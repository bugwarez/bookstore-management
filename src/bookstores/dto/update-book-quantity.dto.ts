import { IsInt } from 'class-validator';

export class UpdateBookQuantityDto {
  @IsInt()
  quantity: number;
}
