import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @Transform(({ value }) => String(value))
  @Matches(/^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/, {
    message: 'amount deve ser um valor positivo com até duas casas decimais',
  })
  amount: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsISO8601({ strict: true })
  date: string;

  @IsIn(TRANSACTION_TYPES)
  type: TransactionType;
}
