import { Controller, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Post()
  create(@Body() body: { columnId: string; title: string }, @Request() req: any) {
    return this.cardsService.create(body.columnId, body.title, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { title?: string; description?: string; dueDate?: string | null }, @Request() req: any) {
    return this.cardsService.update(id, body, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.cardsService.remove(id, req.user.id);
  }

  @Patch(':id/move')
  move(@Param('id') id: string, @Body() body: { columnId: string; position: number }, @Request() req: any) {
    return this.cardsService.move(id, body.columnId, body.position, req.user.id);
  }

  @Post(':id/checklist')
  addCheckItem(@Param('id') id: string, @Body() body: { text: string }, @Request() req: any) {
    return this.cardsService.addCheckItem(id, body.text, req.user.id);
  }

  @Patch('checklist/:id')
  updateCheckItem(@Param('id') id: string, @Body() body: { text?: string; checked?: boolean }, @Request() req: any) {
    return this.cardsService.updateCheckItem(id, body, req.user.id);
  }

  @Delete('checklist/:id')
  removeCheckItem(@Param('id') id: string, @Request() req: any) {
    return this.cardsService.removeCheckItem(id, req.user.id);
  }
}