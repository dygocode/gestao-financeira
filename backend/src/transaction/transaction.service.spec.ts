import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { TransactionService } from './transaction.service.js';

describe('TransactionService', () => {
  const categoryFirst = vi.fn();
  const categoryCollection = {
    select: vi.fn().mockReturnThis(),
    first: categoryFirst,
  };
  const categoryWhere = vi.fn().mockReturnValue(categoryCollection);

  const create = vi.fn();
  const createCollection = { create };
  const include = vi.fn().mockReturnValue(createCollection);

  const remove = vi.fn();
  const transactionCollection = { delete: remove };
  const transactionWhere = vi.fn().mockReturnValue(transactionCollection);

  const prisma = {
    orm: {
      public: {
        Category: { where: categoryWhere },
        Transaction: { include, where: transactionWhere },
      },
    },
  };
  const service = new TransactionService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
    categoryWhere.mockReturnValue(categoryCollection);
    categoryCollection.select.mockReturnThis();
    include.mockReturnValue(createCollection);
    transactionWhere.mockReturnValue(transactionCollection);
  });

  it('cria uma transação vinculada ao usuário e à categoria dele', async () => {
    categoryFirst.mockResolvedValue({ id: 3 });
    const transaction = {
      id: 20,
      name: 'Mensalidade',
      amount: '149.90',
      categoryId: 3,
      userId: 7,
    };
    create.mockResolvedValue(transaction);

    await expect(
      service.create(7, {
        name: '  Mensalidade  ',
        description: '  Software  ',
        amount: '149.90',
        categoryId: 3,
        date: '2026-11-09T12:00:00.000Z',
        type: 'EXPENSE',
      }),
    ).resolves.toEqual(transaction);

    expect(categoryWhere).toHaveBeenCalledWith({ id: 3, userId: 7 });
    expect(create).toHaveBeenCalledWith({
      name: 'Mensalidade',
      description: 'Software',
      amount: '149.90',
      categoryId: 3,
      date: new Date('2026-11-09T12:00:00.000Z'),
      type: 'EXPENSE',
      userId: 7,
    });
  });

  it('valida os campos obrigatórios e formatos da transação', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      name: '',
      amount: '0',
      categoryId: 0,
      date: 'data-inválida',
      type: 'TRANSFER',
    });

    const errors = await validate(dto);
    const invalidProperties = errors.map((error) => error.property);

    expect(invalidProperties).toEqual(
      expect.arrayContaining(['name', 'categoryId', 'date', 'type']),
    );

    categoryFirst.mockResolvedValue({ id: 3 });
    await expect(
      service.create(7, {
        name: 'Transação inválida',
        amount: '0',
        categoryId: 3,
        date: '2026-11-09T12:00:00.000Z',
        type: 'EXPENSE',
      }),
    ).rejects.toThrow('O valor deve ser maior que zero');
    expect(create).not.toHaveBeenCalled();
  });

  it('exclui somente uma transação pertencente ao usuário', async () => {
    remove.mockResolvedValue({ id: 20, userId: 7 });

    await expect(service.remove(7, 20)).resolves.toBeUndefined();
    expect(transactionWhere).toHaveBeenCalledWith({ id: 20, userId: 7 });
    expect(remove).toHaveBeenCalledOnce();
  });
});
