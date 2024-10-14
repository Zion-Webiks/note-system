import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NoteSchema } from './note.schema';
import { AuthModule } from '../auth/auth.module';  
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Note', schema: NoteSchema }]),
    AuthModule,  
  ],
  controllers: [NotesController],
  providers: [NotesService, JwtAuthGuard]
})
export class NotesModule {}
