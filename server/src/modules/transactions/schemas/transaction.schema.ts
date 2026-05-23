import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
    @Prop({ required: true })
  transactionId: string;

    @Prop({ required: true, enum: ['user', 'exchange'] })
  source: string;

    @Prop({ required: true, index: true })
  runId: string;

    @Prop({ type: Date, default: null })
  timestamp: Date | null;

    @Prop({ default: '' })
  type: string;

  /** Normalized canonical asset ticker (e.g., BTC, ETH) */
  @Prop({ default: '' })
  asset: string;

  /** Original asset value before normalization (e.g., "bitcoin") */
  @Prop({ default: '' })
  rawAsset: string;

  /** Transaction quantity */
  @Prop({ type: Number, default: null })
  quantity: number | null;

  /** Price in USD (may be null for transfers) */
  @Prop({ type: Number, default: null })
  priceUsd: number | null;

  /** Fee amount */
  @Prop({ type: Number, default: null })
  fee: number | null;

  /** Free-text note from the CSV */
  @Prop({ default: '' })
  note: string;

    @Prop({ type: Object })
  rawRow: Record<string, string>;

    @Prop()
  lineNumber: number;

    @Prop({ default: true })
  isValid: boolean;

    @Prop({ type: [String], default: [] })
  validationErrors: string[];

    @Prop({ default: false })
  isDuplicate: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ runId: 1, source: 1, isValid: 1, isDuplicate: 1 });
TransactionSchema.index({ runId: 1, source: 1, asset: 1, type: 1 });
