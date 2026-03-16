import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.board.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const board = await this.prisma.board.findFirst({
      where: { id, userId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: { checkItems: { orderBy: { position: 'asc' } } },
            },
          },
        },
      },
    });
    if (!board) throw new NotFoundException('Quadro não encontrado');
    return board;
  }

  async create(title: string, userId: string) {
    return this.prisma.board.create({
      data: { title, userId },
    });
  }

  async update(id: string, title: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.board.update({
      where: { id },
      data: { title },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.board.delete({ where: { id } });
  }
}