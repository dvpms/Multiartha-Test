import { transactionsQueryRepo } from "../../infrastructure/repositories/transactionsQueryRepo";

export async function listTransactions() {
  return transactionsQueryRepo.listLatest();
}
