import { Controller, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Post()
  create(@Body() body: { boardId: string; title: string }, @Request() req: any) {
    return this.columnsService.create(body.boardId, body.title, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { title: string }, @Request() req: any) {
    return this.columnsService.update(id, body.title, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.columnsService.remove(id, req.user.id);
  }

  @Patch('reorder/:boardId')
  reorder(@Param('boardId') boardId: string, @Body() body: { columnIds: string[] }, @Request() req: any) {
    return this.columnsService.reorder(boardId, body.columnIds, req.user.id);
  }
}