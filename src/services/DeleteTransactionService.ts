import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const transaction = await transactionsRepository.findOne({
      where: { id },
    });
    if (transaction) {
      await transactionsRepository.remove(transaction);
    }
  }
}

export default DeleteTransactionService;
