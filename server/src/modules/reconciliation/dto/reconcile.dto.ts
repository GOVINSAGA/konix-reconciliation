import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReconcileDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  timestampToleranceSec?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantityTolerancePct?: number;
}
