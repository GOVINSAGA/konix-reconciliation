import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { TransactionsService } from '../../transactions/transactions.service';
import { Transaction } from '../../transactions/schemas/transaction.schema';
import { parseCsvFile } from '../../../common/utils/csv-parser.util';
import {
  validateRow,
  safeParseFloat,
  safeParseDate,
} from '../../../common/utils/validators';
import { resolveAsset } from '../../../common/constants/asset-aliases';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly transactionsService: TransactionsService) {}

    async ingestBothFiles(
    runId: string,
  ): Promise<{
    totalUserRows: number;
    totalExchangeRows: number;
    validUserRows: number;
    validExchangeRows: number;
    flaggedRows: number;
    duplicateRows: number;
  }> {
    const dataDir = path.resolve(__dirname, '..', '..', '..', '..', 'data');
    const userFilePath = path.join(dataDir, 'user_transactions.csv');
    const exchangeFilePath = path.join(dataDir, 'exchange_transactions.csv');

    this.logger.log(`Ingesting user transactions from: ${userFilePath}`);
    const userTransactions = await this.ingestFile(
      userFilePath,
      'user',
      runId,
    );

    this.logger.log(`Ingesting exchange transactions from: ${exchangeFilePath}`);
    const exchangeTransactions = await this.ingestFile(
      exchangeFilePath,
      'exchange',
      runId,
    );

    await this.transactionsService.bulkInsert([
      ...userTransactions,
      ...exchangeTransactions,
    ]);

    const summary = {
      totalUserRows: userTransactions.length,
      totalExchangeRows: exchangeTransactions.length,
      validUserRows: userTransactions.filter(
        (t) => t.isValid && !t.isDuplicate,
      ).length,
      validExchangeRows: exchangeTransactions.filter(
        (t) => t.isValid && !t.isDuplicate,
      ).length,
      flaggedRows: [...userTransactions, ...exchangeTransactions].filter(
        (t) => !t.isValid,
      ).length,
      duplicateRows: [...userTransactions, ...exchangeTransactions].filter(
        (t) => t.isDuplicate,
      ).length,
    };

    this.logger.log(`Ingestion complete: ${JSON.stringify(summary)}`);
    return summary;
  }

    private async ingestFile(
    filePath: string,
    source: 'user' | 'exchange',
    runId: string,
  ): Promise<Partial<Transaction>[]> {
    const rawRows = await parseCsvFile(filePath);
    const transactions: Partial<Transaction>[] = [];
    const seenHashes = new Set<string>();

    for (const { data, lineNumber } of rawRows) {
      const validation = validateRow(data);
      const rawAsset = (data['asset'] || '').trim();
      const normalizedAsset = resolveAsset(rawAsset);
      const normalizedType = (data['type'] || '').trim().toUpperCase();
      const parsedTimestamp = safeParseDate(data['timestamp']);
      const parsedQuantity = safeParseFloat(data['quantity']);
      const parsedPrice = safeParseFloat(data['price_usd']);
      const parsedFee = safeParseFloat(data['fee']);

      const duplicateKey = [
        (data['transaction_id'] || '').trim(),
        data['timestamp'] || '',
        normalizedType,
        normalizedAsset,
        data['quantity'] || '',
      ].join('|');

      const isDuplicate = seenHashes.has(duplicateKey);
      if (!isDuplicate) {
        seenHashes.add(duplicateKey);
      }

      const transaction: Partial<Transaction> = {
        transactionId: (data['transaction_id'] || '').trim(),
        source,
        runId,
        timestamp: parsedTimestamp,
        type: normalizedType,
        asset: normalizedAsset,
        rawAsset,
        quantity: parsedQuantity,
        priceUsd: parsedPrice,
        fee: parsedFee,
        note: (data['note'] || '').trim(),
        rawRow: data,
        lineNumber,
        isValid: validation.isValid && !isDuplicate,
        validationErrors: isDuplicate
          ? [...validation.errors, 'DUPLICATE_ROW: exact duplicate of a previous row']
          : validation.errors,
        isDuplicate,
      };

      if (!validation.isValid) {
        this.logger.warn(
          `[${source}] Line ${lineNumber} (${data['transaction_id'] || 'NO_ID'}): ${validation.errors.join('; ')}`,
        );
      }
      if (isDuplicate) {
        this.logger.warn(
          `[${source}] Line ${lineNumber} (${data['transaction_id'] || 'NO_ID'}): duplicate row detected`,
        );
      }

      transactions.push(transaction);
    }

    return transactions;
  }
}
