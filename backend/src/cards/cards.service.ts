import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async create(columnId: string, title: string, userId: string) {
    const column = await this.prisma.column.findFirst({
      where: { id: columnId },
      include: { board: true },
    });
    if (!column || column.board.userId !== userId) throw new NotFoundException('Coluna não encontrada');

    const count = await this.prisma.card.count({ where: { columnId } });
    return this.prisma.card.create({
      data: { title, columnId, position: count },
      include: { checkItems: true },
    });
  }

  async update(id: string, data: { title?: string; description?: string; dueDate?: string | null }, userId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id },
      include: { column: { include: { board: true } } },
    });
    if (!card || card.column.board.userId !== userId) throw new NotFoundException('Cartão não encontrado');

    return this.prisma.card.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: { checkItems: true },
    });
  }

  async remove(id: string, userId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id },
      include: { column: { include: { board: true } } },
    });
    if (!card || card.column.board.userId !== userId) throw new NotFoundException('Cartão não encontrado');
    return this.prisma.card.delete({ where: { id } });
  }

  async move(id: string, columnId: string, position: number, userId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id },
      include: { column: { include: { board: true } } },
    });
    if (!card || card.column.board.userId !== userId) throw new NotFoundException('Cartão não encontrado');

    return this.prisma.card.update({
      where: { id },
      data: { columnId, position },
      include: { checkItems: true },
    });
  }

  async addCheckItem(cardId: string, text: string, userId: string) {
    const card = await this.prisma.card.findFirst({
      where: { id: cardId },
      include: { column: { include: { board: true } } },
    });
    if (!card || card.column.board.userId !== userId) throw new NotFoundException('Cartão não encontrado');

    const count = await this.prisma.checklistItem.count({ where: { cardId } });
    return this.prisma.checklistItem.create({
      data: { text, cardId, position: count },
    });
  }

  async updateCheckItem(id: string, data: { text?: string; checked?: boolean }, userId: string) {
    const item = await this.prisma.checklistItem.findFirst({
      where: { id },
      include: { card: { include: { column: { include: { board: true } } } } },
    });
    if (!item || item.card.column.board.userId !== userId) throw new NotFoundException('Item não encontrado');
    return this.prisma.checklistItem.update({ where: { id }, data });
  }

  async removeCheckItem(id: string, userId: string) {
    const item = await this.prisma.checklistItem.findFirst({
      where: { id },
      include: { card: { include: { column: { include: { board: true } } } } },
    });
    if (!item || item.card.column.board.userId !== userId) throw new NotFoundException('Item não encontrado');
    return this.prisma.checklistItem.delete({ where: { id } });
  }
}