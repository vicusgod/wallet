export type Wallet = {
  id: string
  name: string
  currency: string
  balance: number
  type: "cash" | "bank" | "savings"
  description?: string
  userId?: string
}

export type Category = {
  id: string
  name: string
  type: "income" | "expense"
  emoji: string
  isDefault?: boolean
  userId?: string
}

export type Transaction = {
  id: string
  walletId: string
  categoryId: string
  type: "income" | "expense"
  amount: number
  description?: string
  date: string
  userId?: string
}

export type Budget = {
  id: string
  walletId: string
  categoryId: string
  amountLimit: number
  month: number
  year: number
  userId?: string
}

export function formatCurrency(value: number, currency: string = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

// Kosongkan data awal agar tidak ada dummy data saat load pertama.
export const initialWallets: Wallet[] = []
export const initialCategories: Category[] = []
export const initialTransactions: Transaction[] = []
export const initialBudgets: Budget[] = []
