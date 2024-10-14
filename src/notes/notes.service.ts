import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './note.interface';

@Injectable()
export class NotesService {
  constructor(@InjectModel('Note') private noteModel: Model<Note>) {}

  async create(userId: string, title: string, content: string): Promise<Note> {
    try {
      const newNote = new this.noteModel({ userId, title, content });
      return await newNote.save();
    } catch (error) {
      throw new BadRequestException('Failed to create the note');
    }
  }

  async findAll(userId: string): Promise<Note[]> {
    try {
      return await this.noteModel.find({ userId }).exec();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve notes');
    }
  }

  async findById(userId: string, id: string): Promise<Note> {
    const note = await this.noteModel.findOne({ _id: id, userId }).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  async update(userId: string, id: string, title: string, content: string): Promise<Note> {
    const updatedNote = await this.noteModel.findOneAndUpdate(
      { _id: id, userId },
      { title, content },
      { new: true }
    ).exec();

    if (!updatedNote) {
      throw new NotFoundException('Note not found or update failed');
    }
    return updatedNote;
  }

  // Delete a note by its id and userId
  async delete(userId: string, id: string): Promise<Note> {
    const deletedNote = await this.noteModel.findOneAndDelete({ _id: id, userId }).exec();
    if (!deletedNote) {
      throw new NotFoundException('Note not found or delete failed');
    }
    return deletedNote;
  }
}
