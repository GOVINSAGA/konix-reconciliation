import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Res,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { ReconcileDto } from './dto/reconcile.dto';
import { IngestionService } from './services/ingestion.service';
import { MatchingEngineService } from './services/matching-engine.service';
import { ReportService } from './services/report.service';
import {
  ReconciliationRun,
  ReconciliationRunDocument,
} from './schemas/reconciliation-run.schema';

@Controller()
export class ReconciliationController {
  private readonly logger = new Logger(ReconciliationController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly ingestionService: IngestionService,
    private readonly matchingEngine: MatchingEngineService,
    private readonly reportService: ReportService,
    @InjectModel(ReconciliationRun.name)
    private readonly runModel: Model<ReconciliationRunDocument>,
  ) {}

    @Post('reconcile')
  async reconcile(@Body() dto: ReconcileDto) {
    const runId = uuidv4();

    const defaults = this.configService.get('defaultTolerances');
    const config = {
      timestampToleranceSec:
        dto.timestampToleranceSec ?? defaults.timestampToleranceSec,
      quantityTolerancePct:
        dto.quantityTolerancePct ?? defaults.quantityTolerancePct,
    };

    this.logger.log(
      `Starting reconciliation run ${runId} with config: ${JSON.stringify(config)}`,
    );

    const run = new this.runModel({
      runId,
      status: 'processing',
      config,
      summary: null,
      completedAt: null,
      errorMessage: null,
    });
    await run.save();

    try {
      
      this.logger.log(`[${runId}] Step 1: Ingesting CSV files...`);
      const ingestionSummary = await this.ingestionService.ingestBothFiles(runId);

      this.logger.log(`[${runId}] Step 2: Running matching engine...`);
      const matchingSummary = await this.matchingEngine.runMatching(runId, config);

      const summary = {
        ...ingestionSummary,
        ...matchingSummary,
      };

      await this.runModel.updateOne(
        { runId },
        {
          $set: {
            status: 'completed',
            summary,
            completedAt: new Date(),
          },
        },
      );

      this.logger.log(`[${runId}] Reconciliation completed successfully`);

      return {
        success: true,
        runId,
        status: 'completed',
        config,
        summary,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `[${runId}] Reconciliation failed: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      await this.runModel.updateOne(
        { runId },
        {
          $set: {
            status: 'failed',
            errorMessage,
            completedAt: new Date(),
          },
        },
      );

      return {
        success: false,
        runId,
        status: 'failed',
        error: errorMessage,
      };
    }
  }

    @Get('report/:runId')
  async getReport(
    @Param('runId') runId: string,
    @Query('format') format: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (format === 'csv') {
      const csv = await this.reportService.generateCsv(runId);
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="reconciliation-report-${runId}.csv"`,
      });
      res.status(HttpStatus.OK).send(csv);
      return;
    }

    const results = await this.reportService.getFullReport(runId);
    return {
      success: true,
      runId,
      totalResults: results.length,
      results,
    };
  }

    @Get('report/:runId/summary')
  async getSummary(@Param('runId') runId: string) {
    const summary = await this.reportService.getSummary(runId);
    return {
      success: true,
      ...summary,
    };
  }

    @Get('report/:runId/unmatched')
  async getUnmatched(@Param('runId') runId: string) {
    const results = await this.reportService.getUnmatched(runId);
    return {
      success: true,
      runId,
      totalUnmatched: results.length,
      results,
    };
  }
}
