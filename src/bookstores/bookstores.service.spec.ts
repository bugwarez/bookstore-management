import { Test, TestingModule } from '@nestjs/testing';
import { BookstoresService } from './bookstores.service';

describe('BookstoresService', () => {
  let service: BookstoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookstoresService],
    }).compile();

    service = module.get<BookstoresService>(BookstoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
