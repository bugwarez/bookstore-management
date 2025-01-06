import { Test, TestingModule } from '@nestjs/testing';
import { BookstoresController } from './bookstores.controller';

describe('BookstoresController', () => {
  let controller: BookstoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookstoresController],
    }).compile();

    controller = module.get<BookstoresController>(BookstoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
