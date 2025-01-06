import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsInt()
  @IsOptional()
  quantity: number;
}
