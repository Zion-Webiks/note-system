import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, UsePipes, NotFoundException, BadRequestException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Request } from 'express';
import { CreateNoteDto } from '../common/create-note.dto';
import { GenericValidationPipe } from '../common/validation.pipe';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  async getAllNotes(@Req() req: Request) {
    try {
      const userId = (req as any).user.sub;  
      const notes = await this.notesService.findAll(userId);
      return {
        message: 'Notes retrieved successfully',
        notes,
      };
    } catch (error) {
        throw new NotFoundException(error.message);
    }
  }

  @Get(':id')
  async getNoteById(@Param('id') id: string, @Req() req: Request) {
    try {
      const userId = (req as any).user.sub;  
      const note = await this.notesService.findById(userId, id);
      return {
        message: 'Note retrieved successfully',
        note,
      };
    } catch (error) {
        throw new NotFoundException(error.message);
    }
  }

  @Post('create')
  @UsePipes(GenericValidationPipe)  
  async createNote(@Body() createNoteDto: CreateNoteDto, @Req() req: Request) {
    try {
      const userId = (req as any).user.sub; 
      const newNote = await this.notesService.create(userId, createNoteDto.title, createNoteDto.content);
      return {
        message: 'Note created successfully',
        newNote,
      };
    } catch (error) {
        throw new BadRequestException(error.message)
    }

  }

  @Put(':id')
  @UsePipes(GenericValidationPipe)  
  async updateNote(@Param('id') id: string, @Body() createNoteDto: CreateNoteDto, @Req() req: Request) {
    try {
      const userId = (req as any).user.sub; 
      const updatedNote = await this.notesService.update(userId, id, createNoteDto.title, createNoteDto.content);
      return {
        message: 'Note updated successfully',
        updatedNote,
      };
    } catch (error) {
        throw new NotFoundException('Note not found'); 
    }
  }

  @Delete(':id')
  async deleteNote(@Param('id') id: string, @Req() req: Request) {
    try {
      const userId = (req as any).user.sub; 
      const deletedNote = await this.notesService.delete(userId, id);
      return {
        message: 'Note deleted successfully',
        deletedNote,
      };
    } catch (error) {
        throw new NotFoundException('Note not found'); 
    }
  }
}
