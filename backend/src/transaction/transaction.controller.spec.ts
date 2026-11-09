import { Test, type TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller.js';
import { TransactionService } from './transaction.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

describe('TransactionController', () => {
  it('é criado com o serviço de transações', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [{ provide: TransactionService, useValue: {} }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile();

    expect(module.get(TransactionController)).toBeDefined();
  });
});
