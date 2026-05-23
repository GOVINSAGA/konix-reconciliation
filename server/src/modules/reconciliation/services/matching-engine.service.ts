import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionsService } from '../../transactions/transactions.service';
import { TransactionDocument } from '../../transactions/schemas/transaction.schema';
import {
  ReconciliationResult,
  ReconciliationResultDocument,
  TransactionSnapshot,
} from '../schemas/reconciliation-result.schema';
import { typesMatch } from '../../../common/constants/type-mapping';

interface MatchCandidate {
  userIdx: number;
  exchangeIdx: number;
  score: number;
  timestampDiffSec: number;
  quantityDiffPct: number;
  feeDiff: number;
  priceDiff: number;
  withinTolerance: boolean;
}

@Injectable()
export class MatchingEngineService {
  private readonly logger = new Logger(MatchingEngineService.name);

  constructor(
    private readonly transactionsService: TransactionsService,
    @InjectModel(ReconciliationResult.name)
    private readonly resultModel: Model<ReconciliationResultDocument>,
  ) {}

    async runMatching(
    runId: string,
    config: {
      timestampToleranceSec: number;
      quantityTolerancePct: number;
    },
  ): Promise<{ matched: number; conflicting: number; unmatchedUser: number; unmatchedExchange: number }> {
    const userTxs = await this.transactionsService.getValidTransactions(runId, 'user');
    const exchangeTxs = await this.transactionsService.getValidTransactions(runId, 'exchange');

    this.logger.log(
      `Matching ${userTxs.length} user txs against ${exchangeTxs.length} exchange txs ` +
      `(tolerance: ${config.timestampToleranceSec}s / ${config.quantityTolerancePct}%)`,
    );

    const candidates: MatchCandidate[] = [];

    for (let ui = 0; ui < userTxs.length; ui++) {
      const user = userTxs[ui];
      for (let ei = 0; ei < exchangeTxs.length; ei++) {
        const exchange = exchangeTxs[ei];

        if (user.asset !== exchange.asset) continue;

        if (!typesMatch(user.type, exchange.type)) continue;

        if (!user.timestamp || !exchange.timestamp) continue;
        if (user.quantity == null || exchange.quantity == null) continue;

        const timestampDiffSec = Math.abs(
          (new Date(user.timestamp).getTime() - new Date(exchange.timestamp).getTime()) / 1000,
        );

        const maxQty = Math.max(
          Math.abs(user.quantity),
          Math.abs(exchange.quantity),
        );
        const quantityDiffPct =
          maxQty === 0
            ? 0
            : (Math.abs(user.quantity - exchange.quantity) / maxQty) * 100;

        const feeDiff = Math.abs((user.fee ?? 0) - (exchange.fee ?? 0));
        const priceDiff = Math.abs((user.priceUsd ?? 0) - (exchange.priceUsd ?? 0));

        const withinTolerance =
          timestampDiffSec <= config.timestampToleranceSec &&
          quantityDiffPct <= config.quantityTolerancePct;

        const timeScore =
          config.timestampToleranceSec > 0
            ? timestampDiffSec / config.timestampToleranceSec
            : timestampDiffSec === 0
              ? 0
              : Infinity;
        const qtyScore =
          config.quantityTolerancePct > 0
            ? quantityDiffPct / config.quantityTolerancePct
            : quantityDiffPct === 0
              ? 0
              : Infinity;
        const score = timeScore * 0.5 + qtyScore * 0.5;

        candidates.push({
          userIdx: ui,
          exchangeIdx: ei,
          score,
          timestampDiffSec,
          quantityDiffPct,
          feeDiff,
          priceDiff,
          withinTolerance,
        });
      }
    }

    candidates.sort((a, b) => a.score - b.score);

    const usedUser = new Set<number>();
    const usedExchange = new Set<number>();
    const results: Partial<ReconciliationResult>[] = [];
    let matched = 0;
    let conflicting = 0;

    for (const candidate of candidates) {
      if (usedUser.has(candidate.userIdx) || usedExchange.has(candidate.exchangeIdx)) {
        continue;
      }

      usedUser.add(candidate.userIdx);
      usedExchange.add(candidate.exchangeIdx);

      const userTx = userTxs[candidate.userIdx];
      const exchangeTx = exchangeTxs[candidate.exchangeIdx];

      if (candidate.withinTolerance) {
        
        results.push({
          runId,
          category: 'matched',
          reason: this.buildMatchedReason(candidate),
          userTransaction: this.toSnapshot(userTx),
          exchangeTransaction: this.toSnapshot(exchangeTx),
          matchDetails: {
            timestampDiffSec: candidate.timestampDiffSec,
            quantityDiffPct: parseFloat(candidate.quantityDiffPct.toFixed(6)),
            feeDiff: candidate.feeDiff,
            priceDiff: candidate.priceDiff,
          },
        });
        matched++;
      } else {
        
        results.push({
          runId,
          category: 'conflicting',
          reason: this.buildConflictReason(candidate, config),
          userTransaction: this.toSnapshot(userTx),
          exchangeTransaction: this.toSnapshot(exchangeTx),
          matchDetails: {
            timestampDiffSec: candidate.timestampDiffSec,
            quantityDiffPct: parseFloat(candidate.quantityDiffPct.toFixed(6)),
            feeDiff: candidate.feeDiff,
            priceDiff: candidate.priceDiff,
          },
        });
        conflicting++;
      }
    }

    let unmatchedUser = 0;
    let unmatchedExchange = 0;

    for (let i = 0; i < userTxs.length; i++) {
      if (!usedUser.has(i)) {
        results.push({
          runId,
          category: 'unmatched_user',
          reason: 'No matching exchange transaction found within configured tolerances',
          userTransaction: this.toSnapshot(userTxs[i]),
          exchangeTransaction: null,
          matchDetails: null,
        });
        unmatchedUser++;
      }
    }

    for (let i = 0; i < exchangeTxs.length; i++) {
      if (!usedExchange.has(i)) {
        results.push({
          runId,
          category: 'unmatched_exchange',
          reason: 'No matching user transaction found within configured tolerances',
          userTransaction: null,
          exchangeTransaction: this.toSnapshot(exchangeTxs[i]),
          matchDetails: null,
        });
        unmatchedExchange++;
      }
    }

    if (results.length > 0) {
      await this.resultModel.insertMany(results, { ordered: false });
    }

    const summary = { matched, conflicting, unmatchedUser, unmatchedExchange };
    this.logger.log(`Matching complete: ${JSON.stringify(summary)}`);
    return summary;
  }

    private toSnapshot(tx: TransactionDocument): TransactionSnapshot {
    return {
      transactionId: tx.transactionId,
      timestamp: tx.timestamp ? new Date(tx.timestamp).toISOString() : null,
      type: tx.type,
      asset: tx.asset,
      quantity: tx.quantity,
      priceUsd: tx.priceUsd,
      fee: tx.fee,
      note: tx.note,
    };
  }

    private buildMatchedReason(c: MatchCandidate): string {
    const parts: string[] = ['Matched within tolerances'];
    if (c.timestampDiffSec > 0) {
      parts.push(`timestamp diff: ${c.timestampDiffSec}s`);
    }
    if (c.quantityDiffPct > 0) {
      parts.push(`quantity diff: ${c.quantityDiffPct.toFixed(6)}%`);
    }
    if (c.feeDiff > 0) {
      parts.push(`fee diff: ${c.feeDiff}`);
    }
    return parts.join('; ');
  }

    private buildConflictReason(
    c: MatchCandidate,
    config: { timestampToleranceSec: number; quantityTolerancePct: number },
  ): string {
    const parts: string[] = ['Matched by proximity but exceeds tolerance'];
    if (c.timestampDiffSec > config.timestampToleranceSec) {
      parts.push(
        `timestamp diff ${c.timestampDiffSec}s exceeds ${config.timestampToleranceSec}s limit`,
      );
    }
    if (c.quantityDiffPct > config.quantityTolerancePct) {
      parts.push(
        `quantity diff ${c.quantityDiffPct.toFixed(6)}% exceeds ${config.quantityTolerancePct}% limit`,
      );
    }
    if (c.feeDiff > 0) {
      parts.push(`fee diff: ${c.feeDiff}`);
    }
    return parts.join('; ');
  }
}
