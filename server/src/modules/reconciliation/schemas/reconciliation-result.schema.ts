import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReconciliationResultDocument = ReconciliationResult & Document;

export interface TransactionSnapshot {
  transactionId: string;
  timestamp: string | null;
  type: string;
  asset: string;
  quantity: number | null;
  priceUsd: number | null;
  fee: number | null;
  note: string;
}

@Schema({ timestamps: true, collection: 'reconciliation_results' })
export class ReconciliationResult {
    @Prop({ required: true, index: true })
  runId: string;

    @Prop({
    required: true,
    enum: ['matched', 'conflicting', 'unmatched_user', 'unmatched_exchange'],
    index: true,
  })
  category: string;

    @Prop({ required: true })
  reason: string;

    @Prop({ type: Object, default: null })
  userTransaction: TransactionSnapshot | null;

    @Prop({ type: Object, default: null })
  exchangeTransaction: TransactionSnapshot | null;

    @Prop({ type: Object, default: null })
  matchDetails: {
    timestampDiffSec: number;
    quantityDiffPct: number;
    feeDiff: number;
    priceDiff: number;
  } | null;
}

export const ReconciliationResultSchema =
  SchemaFactory.createForClass(ReconciliationResult);

ReconciliationResultSchema.index({ runId: 1, category: 1 });
