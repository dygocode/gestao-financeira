import { Test, type TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller.js';
import { CategoryService } from './category.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

describe('CategoryController', () => {
  it('é criado com o serviço de categorias', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: {} }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile();

    expect(module.get(CategoryController)).toBeDefined();
  });
});
