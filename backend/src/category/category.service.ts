import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaDb } from '../prisma/db.js';
import { PRISMA_DB } from '../prisma/prisma.constants.js';
import type { CreateCategoryDto } from './dto/create-category.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoryService {
  constructor(@Inject(PRISMA_DB) private readonly prisma: PrismaDb) {}

  create(userId: number, data: CreateCategoryDto) {
    const name = this.normalizeName(data.name);

    return this.prisma.orm.public.Category.create({
      name,
      description: this.normalizeDescription(data.description),
      userId,
    });
  }

  findAll(userId: number) {
    return this.prisma.orm.public.Category.where({ userId })
      .orderBy((category) => category.name.asc())
      .all();
  }

  async findOne(userId: number, id: number) {
    const category = await this.prisma.orm.public.Category.where({
      id,
      userId,
    }).first();

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(userId: number, id: number, data: UpdateCategoryDto) {
    const changes: { name?: string; description?: string | null } = {};

    if (data.name === undefined && data.description === undefined) {
      throw new BadRequestException(
        'Informe ao menos um campo para atualização',
      );
    }

    if (data.name !== undefined) {
      changes.name = this.normalizeName(data.name);
    }

    if (data.description !== undefined) {
      changes.description = this.normalizeDescription(data.description);
    }

    const category = await this.prisma.orm.public.Category.where({
      id,
      userId,
    }).update(changes);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async remove(userId: number, id: number) {
    const category = await this.prisma.orm.public.Category.where({
      id,
      userId,
    }).delete();

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
  }

  private normalizeName(name: string) {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new BadRequestException('Nome da categoria é obrigatório');
    }

    return normalizedName;
  }

  private normalizeDescription(description?: string | null) {
    const normalizedDescription = description?.trim();
    return normalizedDescription || null;
  }
}
