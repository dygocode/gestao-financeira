import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaDb } from '../prisma/db.js';
import { PRISMA_DB } from '../prisma/prisma.constants.js';
import type { CreateTransactionDto } from './dto/create-transaction.dto.js';
import type { UpdateTransactionDto } from './dto/update-transaction.dto.js';

@Injectable()
export class TransactionService {
  constructor(@Inject(PRISMA_DB) private readonly prisma: PrismaDb) {}

  async create(userId: number, data: CreateTransactionDto) {
    await this.ensureCategoryOwnership(userId, data.categoryId);

    return this.prisma.orm.public.Transaction.include('category', (category) =>
      category.select('id', 'name'),
    ).create({
      name: this.normalizeName(data.name),
      description: this.normalizeDescription(data.description),
      amount: this.normalizeAmount(data.amount),
      categoryId: data.categoryId,
      date: new Date(data.date),
      type: data.type,
      userId,
    });
  }

  findAll(userId: number) {
    return this.prisma.orm.public.Transaction.where({ userId })
      .include('category', (category) => category.select('id', 'name'))
      .orderBy((transaction) => transaction.date.desc())
      .all();
  }

  async findOne(userId: number, id: number) {
    const transaction = await this.prisma.orm.public.Transaction.where({
      id,
      userId,
    })
      .include('category', (category) => category.select('id', 'name'))
      .first();

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async update(userId: number, id: number, data: UpdateTransactionDto) {
    if (Object.values(data).every((value) => value === undefined)) {
      throw new BadRequestException(
        'Informe ao menos um campo para atualização',
      );
    }

    if (data.categoryId !== undefined) {
      await this.ensureCategoryOwnership(userId, data.categoryId);
    }

    const changes: {
      name?: string;
      description?: string | null;
      amount?: string;
      categoryId?: number;
      date?: Date;
      type?: CreateTransactionDto['type'];
    } = {};

    if (data.name !== undefined) changes.name = this.normalizeName(data.name);
    if (data.description !== undefined) {
      changes.description = this.normalizeDescription(data.description);
    }
    if (data.amount !== undefined) {
      changes.amount = this.normalizeAmount(data.amount);
    }
    if (data.categoryId !== undefined) changes.categoryId = data.categoryId;
    if (data.date !== undefined) changes.date = new Date(data.date);
    if (data.type !== undefined) changes.type = data.type;

    const transaction = await this.prisma.orm.public.Transaction.where({
      id,
      userId,
    })
      .include('category', (category) => category.select('id', 'name'))
      .update(changes);

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async remove(userId: number, id: number) {
    const transaction = await this.prisma.orm.public.Transaction.where({
      id,
      userId,
    }).delete();

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }
  }

  private async ensureCategoryOwnership(userId: number, categoryId: number) {
    const category = await this.prisma.orm.public.Category.where({
      id: categoryId,
      userId,
    })
      .select('id')
      .first();

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
  }

  private normalizeName(name: string) {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new BadRequestException('Nome da transação é obrigatório');
    }

    return normalizedName;
  }

  private normalizeDescription(description?: string | null) {
    const normalizedDescription = description?.trim();
    return normalizedDescription || null;
  }

  private normalizeAmount(amount: string) {
    if (Number(amount) <= 0) {
      throw new BadRequestException('O valor deve ser maior que zero');
    }

    return amount;
  }
}
