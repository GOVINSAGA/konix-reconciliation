import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReconciliationRunDocument = ReconciliationRun & Document;

@Schema({ timestamps: true, collection: 'reconciliation_runs' })
export class ReconciliationRun {
    @Prop({ required: true, unique: true, index: true })
  runId: string;

    @Prop({
    required: true,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  })
  status: string;

    @Prop({ type: Object, required: true })
  config: {
    timestampToleranceSec: number;
    quantityTolerancePct: number;
  };

    @Prop({ type: Object, default: null })
  summary: {
    totalUserRows: number;
    totalExchangeRows: number;
    validUserRows: number;
    validExchangeRows: number;
    flaggedRows: number;
    duplicateRows: number;
    matched: number;
    conflicting: number;
    unmatchedUser: number;
    unmatchedExchange: number;
  } | null;

    @Prop({ type: Date, default: null })
  completedAt: Date | null;

    @Prop({ type: String, default: null })
  errorMessage: string | null;
}

export const ReconciliationRunSchema =
  SchemaFactory.createForClass(ReconciliationRun);
