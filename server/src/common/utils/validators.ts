import { VALID_TYPES } from '../constants/type-mapping';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRow(row: Record<string, string>): ValidationResult {
  const errors: string[] = [];

  const rawTimestamp = row['timestamp']?.trim();
  if (!rawTimestamp) {
    errors.push('MISSING_TIMESTAMP: timestamp field is empty');
  } else {
    const parsed = new Date(rawTimestamp);
    if (isNaN(parsed.getTime())) {
      errors.push(
        `INVALID_TIMESTAMP: could not parse "${rawTimestamp}" as a valid date`,
      );
    }
  }

  const rawType = row['type']?.trim().toUpperCase();
  if (!rawType) {
    errors.push('MISSING_TYPE: type field is empty');
  } else if (!VALID_TYPES.includes(rawType)) {
    errors.push(
      `INVALID_TYPE: "${rawType}" is not one of ${VALID_TYPES.join(', ')}`,
    );
  }

  const rawQuantity = row['quantity']?.trim();
  if (!rawQuantity) {
    errors.push('MISSING_QUANTITY: quantity field is empty');
  } else {
    const qty = parseFloat(rawQuantity);
    if (isNaN(qty)) {
      errors.push(
        `INVALID_QUANTITY: "${rawQuantity}" is not a valid number`,
      );
    } else if (qty < 0) {
      errors.push(
        `NEGATIVE_QUANTITY: quantity ${qty} is negative, which is invalid for a transaction`,
      );
    } else if (qty === 0) {
      errors.push('ZERO_QUANTITY: quantity is zero');
    }
  }

  const rawAsset = row['asset']?.trim();
  if (!rawAsset) {
    errors.push('MISSING_ASSET: asset field is empty');
  }

  const rawId = row['transaction_id']?.trim();
  if (!rawId) {
    errors.push('MISSING_TRANSACTION_ID: transaction_id field is empty');
  }

  return {
    isValid: errors.filter((e) => !e.startsWith('MISSING_TRANSACTION_ID')).length === 0,
    errors,
  };
}

export function safeParseFloat(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null;
  const parsed = parseFloat(value.trim());
  return isNaN(parsed) ? null : parsed;
}

/**
 * Safely parses an ISO timestamp string. Returns null if parsing fails.
 */
export function safeParseDate(value: string | undefined): Date | null {
  if (!value || value.trim() === '') return null;
  const parsed = new Date(value.trim());
  return isNaN(parsed.getTime()) ? null : parsed;
}
