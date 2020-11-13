import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  transactions: Transaction[];
  balance: {
    income: number;
    outcome: number;
    total: number;
  };
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transacionRepositorty = getRepository(Transaction);

    const transactions = await transacionRepositorty.find();

    let totalIncome = 0.0;
    let totalOutcome = 0.0;
    let totalTransaction = 0;

    transactions.map(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.value;
      } else {
        totalOutcome += transaction.value;
      }
    });

    totalTransaction = totalIncome - totalOutcome;

    const balance: Balance = {
      transactions,
      balance: {
        income: totalIncome,
        outcome: totalOutcome,
        total: totalTransaction,
      },
    };

    return balance;
  }
}

export default TransactionsRepository;
