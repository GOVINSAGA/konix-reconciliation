import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ReconciliationResult,
  ReconciliationResultDocument,
} from '../schemas/reconciliation-result.schema';
import {
  ReconciliationRun,
  ReconciliationRunDocument,
} from '../schemas/reconciliation-run.schema';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectModel(ReconciliationResult.name)
    private readonly resultModel: Model<ReconciliationResultDocument>,
    @InjectModel(ReconciliationRun.name)
    private readonly runModel: Model<ReconciliationRunDocument>,
  ) {}

    async getRun(runId: string): Promise<ReconciliationRunDocument> {
    const run = await this.runModel.findOne({ runId }).lean().exec();
    if (!run) {
      throw new NotFoundException(`Reconciliation run '${runId}' not found`);
    }
    return run as ReconciliationRunDocument;
  }

    async getFullReport(runId: string): Promise<ReconciliationResultDocument[]> {
    await this.getRun(runId);
    return this.resultModel.find({ runId }).lean().exec();
  }

    async getSummary(
    runId: string,
  ): Promise<{
    runId: string;
    status: string;
    config: Record<string, number>;
    summary: Record<string, number>;
    completedAt: Date | null;
  }> {
    const run = await this.getRun(runId);
    return {
      runId: run.runId,
      status: run.status,
      config: run.config,
      summary: run.summary || {},
      completedAt: run.completedAt,
    };
  }

    async getUnmatched(runId: string): Promise<ReconciliationResultDocument[]> {
    await this.getRun(runId);
    return this.resultModel
      .find({
        runId,
        category: { $in: ['unmatched_user', 'unmatched_exchange'] },
      })
      .lean()
      .exec();
  }

    async generateCsv(runId: string): Promise<string> {
    const results = await this.getFullReport(runId);

    const headers = [
      'category',
      'reason',
      'user_transaction_id',
      'user_timestamp',
      'user_type',
      'user_asset',
      'user_quantity',
      'user_price_usd',
      'user_fee',
      'user_note',
      'exchange_transaction_id',
      'exchange_timestamp',
      'exchange_type',
      'exchange_asset',
      'exchange_quantity',
      'exchange_price_usd',
      'exchange_fee',
      'exchange_note',
      'timestamp_diff_sec',
      'quantity_diff_pct',
      'fee_diff',
      'price_diff',
    ];

    const rows = results.map((r) => {
      const u = r.userTransaction;
      const e = r.exchangeTransaction;
      const m = r.matchDetails;

      return [
        r.category,
        `"${(r.reason || '').replace(/"/g, '""')}"`,
        u?.transactionId || '',
        u?.timestamp || '',
        u?.type || '',
        u?.asset || '',
        u?.quantity ?? '',
        u?.priceUsd ?? '',
        u?.fee ?? '',
        `"${(u?.note || '').replace(/"/g, '""')}"`,
        e?.transactionId || '',
        e?.timestamp || '',
        e?.type || '',
        e?.asset || '',
        e?.quantity ?? '',
        e?.priceUsd ?? '',
        e?.fee ?? '',
        `"${(e?.note || '').replace(/"/g, '""')}"`,
        m?.timestampDiffSec ?? '',
        m?.quantityDiffPct ?? '',
        m?.feeDiff ?? '',
        m?.priceDiff ?? '',
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
