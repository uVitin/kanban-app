import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.boardsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() body: { title: string }, @Request() req: any) {
    return this.boardsService.create(body.title, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { title: string }, @Request() req: any) {
    return this.boardsService.update(id, body.title, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.boardsService.remove(id, req.user.id);
  }
}