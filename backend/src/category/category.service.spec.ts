import { CategoryService } from './category.service.js';

describe('CategoryService', () => {
  const create = vi.fn();
  const where = vi.fn();
  const update = vi.fn();
  const remove = vi.fn();
  const collection = { update, delete: remove };
  const prisma = {
    orm: { public: { Category: { create, where } } },
  };
  const service = new CategoryService(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
    where.mockReturnValue(collection);
  });

  it('cria uma categoria para o usuário autenticado', async () => {
    const category = {
      id: 10,
      name: 'Operações',
      description: 'Custos operacionais',
      userId: 7,
    };
    create.mockResolvedValue(category);

    await expect(
      service.create(7, {
        name: '  Operações  ',
        description: '  Custos operacionais  ',
      }),
    ).resolves.toEqual(category);
    expect(create).toHaveBeenCalledWith({
      name: 'Operações',
      description: 'Custos operacionais',
      userId: 7,
    });
  });

  it('atualiza somente uma categoria pertencente ao usuário', async () => {
    const category = {
      id: 10,
      name: 'Infraestrutura',
      description: null,
      userId: 7,
    };
    update.mockResolvedValue(category);

    await expect(
      service.update(7, 10, {
        name: '  Infraestrutura ',
        description: '   ',
      }),
    ).resolves.toEqual(category);
    expect(where).toHaveBeenCalledWith({ id: 10, userId: 7 });
    expect(update).toHaveBeenCalledWith({
      name: 'Infraestrutura',
      description: null,
    });
  });

  it('exclui somente uma categoria pertencente ao usuário', async () => {
    remove.mockResolvedValue({ id: 10, userId: 7 });

    await expect(service.remove(7, 10)).resolves.toBeUndefined();
    expect(where).toHaveBeenCalledWith({ id: 10, userId: 7 });
    expect(remove).toHaveBeenCalledOnce();
  });
});
