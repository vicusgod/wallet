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

export const initialWallets: Wallet[] = [
  {
    id: "wallet-utama",
    name: "Dompet Utama",
    currency: "IDR",
    balance: 8250000,
    type: "cash",
    description: "Pengeluaran harian & gaya hidup",
  },
  {
    id: "wallet-savings",
    name: "Tabungan",
    currency: "IDR",
    balance: 12500000,
    type: "savings",
    description: "Dana darurat & tabungan pendidikan",
  },
  {
    id: "wallet-bisnis",
    name: "Dompet Usaha",
    currency: "IDR",
    balance: 15550000,
    type: "bank",
    description: "Operasional usaha kecil (coffee cart)",
  },
]

export const initialCategories: Category[] = [
  { id: "cat-food", name: "Makanan & Minuman", type: "expense", emoji: "🍜", isDefault: true },
  { id: "cat-transport", name: "Transportasi", type: "expense", emoji: "🚌", isDefault: true },
  { id: "cat-bills", name: "Tagihan Rutin", type: "expense", emoji: "💡", isDefault: true },
  { id: "cat-leisure", name: "Hiburan", type: "expense", emoji: "🎮", isDefault: true },
  { id: "cat-health", name: "Kesehatan", type: "expense", emoji: "💊", isDefault: true },
  { id: "cat-education", name: "Edukasi", type: "expense", emoji: "📚", isDefault: true },
  { id: "cat-income-salary", name: "Gaji", type: "income", emoji: "💼", isDefault: true },
  { id: "cat-income-freelance", name: "Freelance", type: "income", emoji: "🧑‍💻", isDefault: true },
  { id: "cat-income-business", name: "Usaha", type: "income", emoji: "🏪", isDefault: true },
]

export const initialTransactions: Transaction[] = [
  {
    id: "trx-1",
    walletId: "wallet-utama",
    categoryId: "cat-food",
    type: "expense",
    amount: 55000,
    description: "Sarapan & kopi",
    date: "2025-02-04",
  },
  {
    id: "trx-2",
    walletId: "wallet-utama",
    categoryId: "cat-transport",
    type: "expense",
    amount: 20000,
    description: "MRT ke kantor",
    date: "2025-02-04",
  },
  {
    id: "trx-3",
    walletId: "wallet-utama",
    categoryId: "cat-leisure",
    type: "expense",
    amount: 95000,
    description: "Netflix & data plan",
    date: "2025-02-02",
  },
  {
    id: "trx-4",
    walletId: "wallet-utama",
    categoryId: "cat-bills",
    type: "expense",
    amount: 750000,
    description: "Sewa kos Januari",
    date: "2025-01-28",
  },
  {
    id: "trx-5",
    walletId: "wallet-bisnis",
    categoryId: "cat-income-business",
    type: "income",
    amount: 4500000,
    description: "Pendapatan coffee cart minggu ke-1",
    date: "2025-01-27",
  },
  {
    id: "trx-6",
    walletId: "wallet-bisnis",
    categoryId: "cat-bills",
    type: "expense",
    amount: 1850000,
    description: "Sewa kios Januari",
    date: "2025-01-26",
  },
  {
    id: "trx-7",
    walletId: "wallet-savings",
    categoryId: "cat-income-salary",
    type: "income",
    amount: 12500000,
    description: "Gaji tetap Januari",
    date: "2025-01-25",
  },
  {
    id: "trx-8",
    walletId: "wallet-utama",
    categoryId: "cat-food",
    type: "expense",
    amount: 65000,
    description: "Makan siang kantor",
    date: "2025-02-03",
  },
  {
    id: "trx-9",
    walletId: "wallet-utama",
    categoryId: "cat-health",
    type: "expense",
    amount: 120000,
    description: "Suplement vitamin",
    date: "2025-01-15",
  },
  {
    id: "trx-10",
    walletId: "wallet-utama",
    categoryId: "cat-transport",
    type: "expense",
    amount: 30000,
    description: "Bensin motor",
    date: "2024-12-30",
  },
  {
    id: "trx-11",
    walletId: "wallet-savings",
    categoryId: "cat-income-freelance",
    type: "income",
    amount: 2600000,
    description: "Project desain UI UKM",
    date: "2024-12-21",
  },
  {
    id: "trx-12",
    walletId: "wallet-bisnis",
    categoryId: "cat-income-business",
    type: "income",
    amount: 4200000,
    description: "Pendapatan coffee cart minggu ke-4",
    date: "2024-12-18",
  },
  {
    id: "trx-13",
    walletId: "wallet-bisnis",
    categoryId: "cat-bills",
    type: "expense",
    amount: 1650000,
    description: "Restock bahan baku",
    date: "2024-12-14",
  },
  {
    id: "trx-14",
    walletId: "wallet-utama",
    categoryId: "cat-leisure",
    type: "expense",
    amount: 185000,
    description: "Nonton bioskop",
    date: "2024-11-19",
  },
  {
    id: "trx-15",
    walletId: "wallet-utama",
    categoryId: "cat-education",
    type: "expense",
    amount: 350000,
    description: "Langganan course React",
    date: "2024-11-08",
  },
  {
    id: "trx-16",
    walletId: "wallet-savings",
    categoryId: "cat-income-freelance",
    type: "income",
    amount: 3200000,
    description: "Workshop perusahaan",
    date: "2024-11-05",
  },
  {
    id: "trx-17",
    walletId: "wallet-bisnis",
    categoryId: "cat-income-business",
    type: "income",
    amount: 3800000,
    description: "Pendapatan coffee cart minggu ke-2",
    date: "2024-10-22",
  },
  {
    id: "trx-18",
    walletId: "wallet-utama",
    categoryId: "cat-food",
    type: "expense",
    amount: 48000,
    description: "Sarapan bubur",
    date: "2024-10-18",
  },
  {
    id: "trx-19",
    walletId: "wallet-utama",
    categoryId: "cat-health",
    type: "expense",
    amount: 250000,
    description: "Konsultasi klinik",
    date: "2024-09-12",
  },
  {
    id: "trx-20",
    walletId: "wallet-utama",
    categoryId: "cat-transport",
    type: "expense",
    amount: 18000,
    description: "Ojek online",
    date: "2024-09-10",
  },
]

export const initialBudgets: Budget[] = [
  {
    id: "budget-food",
    walletId: "wallet-utama",
    categoryId: "cat-food",
    amountLimit: 2000000,
    month: 2,
    year: 2025,
  },
  {
    id: "budget-transport",
    walletId: "wallet-utama",
    categoryId: "cat-transport",
    amountLimit: 800000,
    month: 2,
    year: 2025,
  },
  {
    id: "budget-leisure",
    walletId: "wallet-utama",
    categoryId: "cat-leisure",
    amountLimit: 1000000,
    month: 2,
    year: 2025,
  },
  {
    id: "budget-education",
    walletId: "wallet-utama",
    categoryId: "cat-education",
    amountLimit: 500000,
    month: 2,
    year: 2025,
  },
  {
    id: "budget-bisnis",
    walletId: "wallet-bisnis",
    categoryId: "cat-bills",
    amountLimit: 4000000,
    month: 2,
    year: 2025,
  },
]

export const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

export const formatCurrency = (value: number, currency = "IDR") =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)

export const transactionTypeCopy: Record<Transaction["type"], string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
}
