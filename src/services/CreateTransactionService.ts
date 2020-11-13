import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const balance = await transactionsRepository.getBalance();
      if (value > balance.balance.total) {
        throw new AppError('No have this value.', 400);
      }
    }

    let categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = categoriesRepository.create({
        title: category,
      });

      categoryExists = await categoriesRepository.save(categoryExists);
    }

    const transactionSaved = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryExists.id,
    });

    await transactionsRepository.save(transactionSaved);

    return transactionSaved;
  }
}

export default CreateTransactionService;
