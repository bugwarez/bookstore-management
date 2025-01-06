import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBookstoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}
