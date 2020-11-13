import { Router } from 'express';

import multer from 'multer';
import uploadingConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadingConfig);

const transactionsRepository = new TransactionsRepository();
const createTransactionService = new CreateTransactionService();
const deleteTransactionService = new DeleteTransactionService();
const importTransactionsService = new ImportTransactionsService();

transactionsRouter.get('/', async (request, response) => {
  const balance = await transactionsRepository.getBalance();
  return response.status(200).json(balance);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transaction = await createTransactionService.execute({ title, value, type, category });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  await deleteTransactionService.execute(id);
  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('csv-file'),
  async (request, response) => {
    await importTransactionsService
      .execute(request.file.filename)
      .then(transactions => {
        return response.json(transactions);
      });
  },
);

export default transactionsRouter;
