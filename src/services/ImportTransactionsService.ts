import { getRepository } from 'typeorm';

import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(csvFilename: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', csvFilename);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      // ltrim: true,
      // rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CsvTransaction[] = [];
    const categories: string[] = [];
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    // Check categories
    categories.map(async title => {
      let categoryExists = await categoriesRepository.findOne({
        where: { title },
      });

      if (!categoryExists) {
        categoryExists = categoriesRepository.create({
          title,
        });

        categoryExists = await categoriesRepository.save(categoryExists);
      }
    });

    // Add transaction
    const transactionsSaved: Transaction[] = [];

    transactions.map(async transaction => {
      const categoryExists = await categoriesRepository.findOne({
        where: { title: transaction.category },
      });

      const transactionSaved = transactionsRepository.create({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category_id: categoryExists.id,
      });

      transactionsSaved.push(transactionSaved);
      await transactionsRepository.save(transactionSaved);
    });

    return transactionsSaved;
  }
}

export default ImportTransactionsService;
