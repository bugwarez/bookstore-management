import { Module } from '@nestjs/common';
import { BookstoresService } from './bookstores.service';
import { BookstoresController } from './bookstores.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookstoresController],
  providers: [BookstoresService],
})
export class BookstoresModule {}
