import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BookstoresService } from './bookstores.service';
import { CreateBookstoreDto } from './dto/create-bookstore.dto';
import { UpdateBookQuantityDto } from './dto/update-book-quantity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/dto/create-user.dto';

@Controller('bookstores')
export class BookstoresController {
  constructor(private readonly bookstoresService: BookstoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createStore(@Body() dto: CreateBookstoreDto) {
    return this.bookstoresService.create(dto);
  }

  @Get()
  findAll() {
    return this.bookstoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookstoresService.findOne(id);
  }

  @Patch(':storeId/quantity/:bookId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STORE_MANAGER)
  updateQuantity(
    @Param('storeId') storeId: string,
    @Param('bookId') bookId: string,
    @Body() updateDto: UpdateBookQuantityDto,
  ) {
    return this.bookstoresService.updateBookQuantity(
      storeId,
      bookId,
      updateDto,
    );
  }
}
