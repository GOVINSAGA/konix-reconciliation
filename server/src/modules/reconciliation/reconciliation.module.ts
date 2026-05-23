import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsModule } from '../transactions/transactions.module';
import { ReconciliationController } from './reconciliation.controller';
import { IngestionService } from './services/ingestion.service';
import { MatchingEngineService } from './services/matching-engine.service';
import { ReportService } from './services/report.service';
import {
  ReconciliationRun,
  ReconciliationRunSchema,
} from './schemas/reconciliation-run.schema';
import {
  ReconciliationResult,
  ReconciliationResultSchema,
} from './schemas/reconciliation-result.schema';

@Module({
  imports: [
    TransactionsModule,
    MongooseModule.forFeature([
      { name: ReconciliationRun.name, schema: ReconciliationRunSchema },
      { name: ReconciliationResult.name, schema: ReconciliationResultSchema },
    ]),
  ],
  controllers: [ReconciliationController],
  providers: [IngestionService, MatchingEngineService, ReportService],
  exports: [ReportService],
})
export class ReconciliationModule {}
