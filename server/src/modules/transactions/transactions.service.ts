import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

    async bulkInsert(transactions: Partial<Transaction>[]): Promise<void> {
    if (transactions.length === 0) return;
    await this.transactionModel.insertMany(transactions, { ordered: false });
  }

    async getValidTransactions(
    runId: string,
    source: 'user' | 'exchange',
  ): Promise<TransactionDocument[]> {
    return this.transactionModel
      .find({
        runId,
        source,
        isValid: true,
        isDuplicate: false,
      })
      .lean()
      .exec();
  }

    async getAllTransactions(
    runId: string,
    source?: 'user' | 'exchange',
  ): Promise<TransactionDocument[]> {
    const filter: Record<string, unknown> = { runId };
    if (source) filter.source = source;
    return this.transactionModel.find(filter).lean().exec();
  }

    async getIngestionSummary(
    runId: string,
  ): Promise<{
    totalUserRows: number;
    totalExchangeRows: number;
    validUserRows: number;
    validExchangeRows: number;
    flaggedRows: number;
    duplicateRows: number;
  }> {
    const [
      totalUserRows,
      totalExchangeRows,
      validUserRows,
      validExchangeRows,
      flaggedRows,
      duplicateRows,
    ] = await Promise.all([
      this.transactionModel.countDocuments({ runId, source: 'user' }),
      this.transactionModel.countDocuments({ runId, source: 'exchange' }),
      this.transactionModel.countDocuments({
        runId,
        source: 'user',
        isValid: true,
        isDuplicate: false,
      }),
      this.transactionModel.countDocuments({
        runId,
        source: 'exchange',
        isValid: true,
        isDuplicate: false,
      }),
      this.transactionModel.countDocuments({ runId, isValid: false }),
      this.transactionModel.countDocuments({ runId, isDuplicate: true }),
    ]);

    return {
      totalUserRows,
      totalExchangeRows,
      validUserRows,
      validExchangeRows,
      flaggedRows,
      duplicateRows,
    };
  }
}
