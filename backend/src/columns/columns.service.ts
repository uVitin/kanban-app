import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(boardId: string, title: string, userId: string) {
    const board = await this.prisma.board.findFirst({ where: { id: boardId, userId } });
    if (!board) throw new NotFoundException('Quadro não encontrado');

    const count = await this.prisma.column.count({ where: { boardId } });
    return this.prisma.column.create({
      data: { title, boardId, position: count },
    });
  }

  async update(id: string, title: string, userId: string) {
    const column = await this.prisma.column.findFirst({
      where: { id },
      include: { board: true },
    });
    if (!column || column.board.userId !== userId) throw new NotFoundException('Coluna não encontrada');
    return this.prisma.column.update({ where: { id }, data: { title } });
  }

  async remove(id: string, userId: string) {
    const column = await this.prisma.column.findFirst({
      where: { id },
      include: { board: true },
    });
    if (!column || column.board.userId !== userId) throw new NotFoundException('Coluna não encontrada');
    return this.prisma.column.delete({ where: { id } });
  }

  async reorder(boardId: string, columnIds: string[], userId: string) {
    const board = await this.prisma.board.findFirst({ where: { id: boardId, userId } });
    if (!board) throw new NotFoundException('Quadro não encontrado');

    await Promise.all(
      columnIds.map((id, position) =>
        this.prisma.column.update({ where: { id }, data: { position } }),
      ),
    );
    return { success: true };
  }
}