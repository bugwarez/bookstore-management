import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookstoreDto } from './dto/create-bookstore.dto';
import { UpdateBookQuantityDto } from './dto/update-book-quantity.dto';

@Injectable()
export class BookstoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStoreDto: CreateBookstoreDto) {
    return this.prisma.bookstore.create({
      data: {
        name: createStoreDto.name,
        location: createStoreDto.location,
      },
    });
  }

  async findAll() {
    return this.prisma.bookstore.findMany();
  }

  async findOne(id: string) {
    const store = await this.prisma.bookstore.findUnique({
      where: { id },
      include: {
        BookstoreBook: {
          include: {
            book: true,
          },
        },
      },
    });
    if (!store) {
      throw new NotFoundException(`Bookstore with ID "${id}" not found`);
    }
    return store;
  }

  async updateBookQuantity(
    storeId: string,
    bookId: string,
    updateDto: UpdateBookQuantityDto,
  ) {
    const store = await this.prisma.bookstore.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException(`Bookstore with ID "${storeId}" not found`);
    }

    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with ID "${bookId}" not found`);
    }

    let pivot = await this.prisma.bookstoreBook.findUnique({
      where: {
        bookstoreId_bookId: {
          bookstoreId: storeId,
          bookId: bookId,
        },
      },
    });

    if (!pivot) {
      pivot = await this.prisma.bookstoreBook.create({
        data: {
          bookstoreId: storeId,
          bookId: bookId,
          quantity: 0,
        },
      });
    }

    const newQuantity = pivot.quantity + updateDto.quantity;
    return this.prisma.bookstoreBook.update({
      where: { id: pivot.id },
      data: { quantity: newQuantity },
    });
  }
}
