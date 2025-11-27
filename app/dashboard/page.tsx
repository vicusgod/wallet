"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { isSameMonth, isSameYear, parseISO, startOfMonth, subDays, subMonths } from "date-fns"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"

import { SummaryCards } from "@/components/finance/summary-cards"
import { WalletList } from "@/components/finance/wallet-list"
import { TransactionForm, TransactionFormValues } from "@/components/finance/transaction-form"
import { TransactionTable } from "@/components/finance/transaction-table"
import { SpendingPie } from "@/components/finance/spending-pie"
import { IncomeExpenseChart } from "@/components/finance/income-expense-chart"
import { BudgetFormValues, BudgetProgress } from "@/components/finance/budget-progress"
import { CategoryManager } from "@/components/finance/category-manager"
import {
  Budget,
  Category,
  Transaction,
  Wallet,
  initialBudgets,
  initialCategories,
  initialTransactions,
  initialWallets,
} from "@/lib/finance-data"
import {
  isSupabaseConfigured,
  fetchWallets as fetchSupabaseWallets,
  fetchCategories as fetchSupabaseCategories,
  fetchTransactions as fetchSupabaseTransactions,
  fetchBudgets as fetchSupabaseBudgets,
  insertWallet as supabaseInsertWallet,
  updateWalletBalance as supabaseUpdateWalletBalance,
  insertCategory as supabaseInsertCategory,
  patchCategory as supabasePatchCategory,
  deleteCategory as supabaseDeleteCategory,
  insertTransaction as supabaseInsertTransaction,
  patchTransaction as supabasePatchTransaction,
  deleteTransaction as supabaseDeleteTransaction,
  insertBudget as supabaseInsertBudget,
  upsertBudget as supabaseUpsertBudget,
  type WalletRecord,
  type CategoryRecord,
  type TransactionRecord,
  type BudgetRecord,
} from "@/lib/supabase-finance"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type FilterPeriod = "this-month" | "last-month" | "90-days" | "all"

type NewWalletPayload = {
  name: string
  currency: string
  type: Wallet["type"]
  balance: number
  description?: string
}

const monthLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
})

const monthShortFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "short",
})

const adjustWalletBalance = (
  wallets: Wallet[],
  payload: { walletId: string; amount: number; type: Transaction["type"] },
  direction: 1 | -1,
) =>
  wallets.map((wallet) =>
    wallet.id === payload.walletId
      ? {
          ...wallet,
          balance:
            wallet.balance +
            direction * (payload.type === "income" ? payload.amount : -payload.amount),
        }
      : wallet,
  )

const mapWalletRecord = (record: WalletRecord): Wallet => ({
  id: record.id,
  name: record.name,
  currency: record.currency || "IDR",
  balance: Number(record.balance ?? 0),
  type: (record.type as Wallet["type"]) || "cash",
  description: record.description ?? undefined,
  userId: record.user_id,
})

const mapCategoryRecord = (record: CategoryRecord): Category => ({
  id: record.id,
  name: record.name,
  type: record.type === "income" ? "income" : "expense",
  emoji: record.emoji || "🏷️",
  isDefault: Boolean(record.is_default),
  userId: record.user_id,
})

const mapTransactionRecord = (record: TransactionRecord): Transaction => ({
  id: record.id,
  walletId: record.wallet_id,
  categoryId: record.category_id,
  type: record.type === "income" ? "income" : "expense",
  amount: Number(record.amount ?? 0),
  description: record.description ?? undefined,
  date: record.transaction_date,
  userId: record.user_id,
})

const mapBudgetRecord = (record: BudgetRecord): Budget => ({
  id: record.id,
  walletId: record.wallet_id,
  categoryId: record.category_id,
  amountLimit: Number(record.amount_limit ?? 0),
  month: record.month,
  year: record.year,
  userId: record.user_id,
})

const isUUID = (value?: string) =>
  !!value &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

const getBalanceEffect = (type: Transaction["type"], amount: number) =>
  type === "income" ? amount : -amount

type SectionName = "dashboard" | "wallets" | "transactions" | "budgets" | "reports"

export default function DashboardPage({ forceSection }: { forceSection?: SectionName } = {}) {
  const { user } = useUser()
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [filters, setFilters] = useState<{ walletId: string; categoryId: string; period: FilterPeriod }>({
    walletId: "all",
    categoryId: "all",
    period: "this-month",
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const userId = user?.id
  const supabaseReady = isSupabaseConfigured && Boolean(userId)
  useEffect(() => {
    // Hilangkan data dummy ketika Supabase siap supaya UI tidak sempat menampilkan seed local.
    if (supabaseReady) {
      setWallets([])
      setCategories([])
      setTransactions([])
      setBudgets([])
    }
  }, [supabaseReady])

  const currentDate = useMemo(() => new Date(), [])
  const currentMonthNumber = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const monthLabel = monthLabelFormatter.format(currentDate)

  const walletsById = useMemo(
    () =>
      wallets.reduce<Record<string, Wallet>>((map, wallet) => {
        map[wallet.id] = wallet
        return map
      }, {}),
    [wallets],
  )

  const categoriesById = useMemo(
    () =>
      categories.reduce<Record<string, Category>>((map, category) => {
        map[category.id] = category
        return map
      }, {}),
    [categories],
  )

  const currentMonthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const date = parseISO(transaction.date)
        return date.getMonth() + 1 === currentMonthNumber && date.getFullYear() === currentYear
      }),
    [transactions, currentMonthNumber, currentYear],
  )

  const monthlyIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const monthlyExpense = currentMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0

  const expenseBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string
        value: number
      }
    >()

    currentMonthTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const category = categoriesById[transaction.categoryId]
        const name = category ? `${category.emoji} ${category.name}` : "Tanpa kategori"
        const existing = map.get(transaction.categoryId)
        if (existing) {
          existing.value += transaction.amount
        } else {
          map.set(transaction.categoryId, { name, value: transaction.amount })
        }
      })

    return Array.from(map.entries())
      .map(([categoryId, value]) => ({
        categoryId,
        ...value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [currentMonthTransactions, categoriesById])

  const budgetsWithProgress = useMemo(() => {
    return budgets
      .filter((budget) => budget.month === currentMonthNumber && budget.year === currentYear)
      .map((budget) => {
        const spent = transactions
          .filter(
            (transaction) =>
              transaction.type === "expense" &&
              transaction.walletId === budget.walletId &&
              transaction.categoryId === budget.categoryId &&
              isSameMonth(parseISO(transaction.date), currentDate) &&
              isSameYear(parseISO(transaction.date), currentDate),
          )
          .reduce((sum, transaction) => sum + transaction.amount, 0)

        return {
          ...budget,
          walletName: walletsById[budget.walletId]?.name ?? "Dompet",
          categoryName: categoriesById[budget.categoryId]?.name ?? "Kategori",
          spent,
        }
      })
  }, [budgets, transactions, currentMonthNumber, currentYear, categoriesById, walletsById, currentDate])

  const budgetAlertCandidate = budgetsWithProgress
    .map((budget) => ({
      ...budget,
      usage: budget.amountLimit > 0 ? budget.spent / budget.amountLimit : 0,
    }))
    .sort((a, b) => b.usage - a.usage)[0]

  const budgetAlert =
    budgetAlertCandidate && budgetAlertCandidate.usage >= 0.7
      ? {
          name: `${budgetAlertCandidate.categoryName} (${budgetAlertCandidate.walletName})`,
          spent: budgetAlertCandidate.spent,
          limit: budgetAlertCandidate.amountLimit,
        }
      : undefined

  const monthWindows = useMemo(() => {
    const start = startOfMonth(new Date())
    return Array.from({ length: 6 }, (_, index) => subMonths(start, 5 - index))
  }, [])

  const incomeExpenseData = useMemo(
    () =>
      monthWindows.map((monthDate) => {
        const monthIncome = transactions
          .filter(
            (transaction) =>
              transaction.type === "income" &&
              isSameMonth(parseISO(transaction.date), monthDate) &&
              isSameYear(parseISO(transaction.date), monthDate),
          )
          .reduce((sum, transaction) => sum + transaction.amount, 0)
        const monthExpense = transactions
          .filter(
            (transaction) =>
              transaction.type === "expense" &&
              isSameMonth(parseISO(transaction.date), monthDate) &&
              isSameYear(parseISO(transaction.date), monthDate),
          )
          .reduce((sum, transaction) => sum + transaction.amount, 0)

        return {
          month: `${monthShortFormatter.format(monthDate)} '${monthDate.getFullYear().toString().slice(-2)}`,
          income: monthIncome,
          expense: monthExpense,
        }
      }),
    [transactions, monthWindows],
  )

  const filteredTransactions = useMemo(() => {
    const now = new Date()

    return transactions.filter((transaction) => {
      const date = parseISO(transaction.date)

      if (filters.walletId !== "all" && transaction.walletId !== filters.walletId) {
        return false
      }

      if (filters.categoryId !== "all" && transaction.categoryId !== filters.categoryId) {
        return false
      }

      switch (filters.period) {
        case "this-month":
          return isSameMonth(date, now) && isSameYear(date, now)
        case "last-month": {
          const lastMonth = subMonths(now, 1)
          return isSameMonth(date, lastMonth) && isSameYear(date, lastMonth)
        }
        case "90-days": {
          const start = subDays(now, 90)
          return date >= start
        }
        default:
          return true
      }
    })
  }, [transactions, filters])

const syncSupabaseData = useCallback(async () => {
    if (!supabaseReady || !userId) {
      return
    }
    try {
      setIsLoadingData(true)
      const fetchEntity = async <T,>(
        promise: Promise<T>,
        label: string,
        { optional }: { optional?: boolean } = {},
      ): Promise<T | null> => {
        try {
          return await promise
        } catch (error) {
          console.error(`Supabase ${label} fetch error`, error)
          if (!optional) {
            toast.error(`Gagal memuat data ${label} dari Supabase`)
          }
          return null
        }
      }

      const budgetsPromise = fetchEntity(fetchSupabaseBudgets(userId), "budget", {
        optional: true,
      })

      const [walletRows, categoryRows, transactionRows] = await Promise.all([
        fetchEntity(fetchSupabaseWallets(userId), "dompet"),
        fetchEntity(fetchSupabaseCategories(userId), "kategori"),
        fetchEntity(fetchSupabaseTransactions(userId), "transaksi"),
      ])

      const budgetRows = await budgetsPromise
      if (walletRows) {
        setWallets(walletRows.map(mapWalletRecord))
      }
      if (categoryRows) {
        setCategories(categoryRows.map(mapCategoryRecord))
      }
      if (transactionRows) {
        setTransactions(transactionRows.map(mapTransactionRecord))
      }
      if (budgetRows) {
        setBudgets(budgetRows.map(mapBudgetRecord))
      }
    } catch (error) {
      console.error("Supabase sync error", error)
      toast.error("Gagal memuat data dari Supabase")
    } finally {
      setIsLoadingData(false)
    }
  }, [supabaseReady, userId])

  useEffect(() => {
    if (supabaseReady) {
      syncSupabaseData()
    }
  }, [supabaseReady, syncSupabaseData])

  const renderLoadingState = () => (
    <div className="space-y-6 p-4 md:p-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="rounded-2xl border border-border/50 bg-card p-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-4 h-8 w-32 rounded bg-muted" />
            <div className="mt-3 h-3 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-8 w-24 rounded bg-muted" />
          </div>
          <div className="mt-4 space-y-3">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-14 rounded-xl bg-muted/60" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-4 space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-10 rounded-lg bg-muted/60" />
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border/50 bg-card p-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-10 rounded-lg bg-muted/60" />
          ))}
        </div>
      </div>
    </div>
  )

  const handleAddWallet = async (wallet: NewWalletPayload) => {
    if (supabaseReady && userId) {
      try {
        const created = await supabaseInsertWallet(userId, {
          name: wallet.name,
          currency: wallet.currency,
          balance: wallet.balance,
          type: wallet.type,
          description: wallet.description ?? null,
        })
        if (created?.[0]) {
          await syncSupabaseData()
          toast.success("Dompet baru tersimpan di Supabase")
          return
        }
      } catch (error) {
        console.error("Supabase wallet insert error", error)
        toast.error("Gagal menyimpan dompet ke Supabase")
      }
    }
    const newWallet: Wallet = { ...wallet, id: crypto.randomUUID() }
    setWallets((prev) => [newWallet, ...prev])
    toast.success("Dompet baru berhasil ditambahkan (mode lokal)")
  }

  const handleCreateTransaction = async (values: TransactionFormValues) => {
    if (!values.walletId) {
      toast.error("Silakan pilih dompet terlebih dahulu")
      return
    }
    const walletRecord = walletsById[values.walletId]
    const categoryRecord = categoriesById[values.categoryId]
    const canSyncToSupabase =
      supabaseReady &&
      userId &&
      walletRecord?.userId &&
      categoryRecord?.userId &&
      isUUID(values.walletId) &&
      isUUID(values.categoryId)
    if (canSyncToSupabase) {
      try {
        await supabaseInsertTransaction(userId, {
          wallet_id: values.walletId,
          category_id: values.categoryId,
          type: values.type,
          amount: values.amount,
          description: values.description ?? null,
          transaction_date: values.date,
        })
        const balanceDelta = getBalanceEffect(values.type, values.amount)
        const newBalance = Number(walletRecord?.balance ?? 0) + balanceDelta
        await supabaseUpdateWalletBalance(userId, values.walletId, newBalance)
        await syncSupabaseData()
        toast.success("Transaksi berhasil dicatat")
        return
      } catch (error) {
        console.error("Supabase insert transaction error", error)
        toast.error("Gagal menyimpan transaksi ke Supabase")
      }
    }
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      walletId: values.walletId,
      categoryId: values.categoryId,
      type: values.type,
      amount: values.amount,
      description: values.description,
      date: values.date,
    }

    setTransactions((prev) => [newTransaction, ...prev])
    setWallets((prev) =>
      adjustWalletBalance(prev, {
        walletId: values.walletId,
        amount: values.amount,
        type: values.type,
      }, 1),
    )
    toast.success("Transaksi berhasil dicatat (mode lokal)")
  }

  const handleDeleteTransaction = async (transaction: Transaction) => {
    const canSyncToSupabase =
      supabaseReady && userId && transaction.userId && isUUID(transaction.id)
    if (canSyncToSupabase) {
      try {
        await supabaseDeleteTransaction(userId, transaction.id)
        const walletRecord = walletsById[transaction.walletId]
        const balanceDelta = -getBalanceEffect(transaction.type, transaction.amount)
        const newBalance = Number(walletRecord?.balance ?? 0) + balanceDelta
        await supabaseUpdateWalletBalance(userId, transaction.walletId, newBalance)
        await syncSupabaseData()
        toast.success("Transaksi dihapus")
        return
      } catch (error) {
        console.error("Supabase delete transaction error", error)
        toast.error("Gagal menghapus transaksi di Supabase")
      }
    }
    setTransactions((prev) => prev.filter((item) => item.id !== transaction.id))
    setWallets((prev) =>
      adjustWalletBalance(prev, {
        walletId: transaction.walletId,
        amount: transaction.amount,
        type: transaction.type,
      }, -1),
    )
    toast.success("Transaksi dihapus (mode lokal)")
  }

  const handleUpdateTransaction = async (values: TransactionFormValues) => {
    if (!editingTransaction) return

    const canSyncToSupabase =
      supabaseReady &&
      userId &&
      editingTransaction.userId &&
      isUUID(editingTransaction.id) &&
      walletsById[values.walletId]?.userId &&
      categoriesById[values.categoryId]?.userId &&
      isUUID(values.walletId) &&
      isUUID(values.categoryId)
    if (canSyncToSupabase) {
      try {
        await supabasePatchTransaction(userId, editingTransaction.id, {
          wallet_id: values.walletId,
          category_id: values.categoryId,
          type: values.type,
          amount: values.amount,
          description: values.description ?? null,
          transaction_date: values.date,
        })
        const originalWallet = walletsById[editingTransaction.walletId]
        const targetWallet = walletsById[values.walletId]
        const originalEffect = getBalanceEffect(
          editingTransaction.type,
          editingTransaction.amount,
        )
        const newEffect = getBalanceEffect(values.type, values.amount)

        if (
          originalWallet &&
          isUUID(originalWallet.id) &&
          editingTransaction.walletId === values.walletId
        ) {
          const currentBalance = Number(originalWallet.balance ?? 0)
          await supabaseUpdateWalletBalance(
            userId,
            originalWallet.id,
            currentBalance + (newEffect - originalEffect),
          )
        } else {
          if (originalWallet && isUUID(originalWallet.id)) {
            const currentBalance = Number(originalWallet.balance ?? 0)
            await supabaseUpdateWalletBalance(
              userId,
              originalWallet.id,
              currentBalance - originalEffect,
            )
          }
          if (targetWallet && isUUID(targetWallet.id)) {
            const currentBalance = Number(targetWallet.balance ?? 0)
            await supabaseUpdateWalletBalance(
              userId,
              targetWallet.id,
              currentBalance + newEffect,
            )
          }
        }
        await syncSupabaseData()
        toast.success("Transaksi berhasil diperbarui")
        setEditingTransaction(null)
        setIsEditDialogOpen(false)
        return
      } catch (error) {
        console.error("Supabase update transaction error", error)
        toast.error("Gagal memperbarui transaksi di Supabase")
      }
    }

    const updatedTransaction: Transaction = {
      ...editingTransaction,
      walletId: values.walletId,
      categoryId: values.categoryId,
      type: values.type,
      amount: values.amount,
      description: values.description,
      date: values.date,
    }

    setTransactions((prev) =>
      prev.map((transaction) => (transaction.id === updatedTransaction.id ? updatedTransaction : transaction)),
    )
    setWallets((prev) => {
      let next = adjustWalletBalance(
        prev,
        {
          walletId: editingTransaction.walletId,
          amount: editingTransaction.amount,
          type: editingTransaction.type,
        },
        -1,
      )
      next = adjustWalletBalance(
        next,
        {
          walletId: values.walletId,
          amount: values.amount,
          type: values.type,
        },
        1,
      )
      return next
    })

    toast.success("Transaksi berhasil diperbarui (mode lokal)")
    setEditingTransaction(null)
    setIsEditDialogOpen(false)
  }

  const handleAddBudget = async (values: BudgetFormValues) => {
    const canSyncToSupabase =
      supabaseReady &&
      userId &&
      walletsById[values.walletId]?.userId &&
      categoriesById[values.categoryId]?.userId &&
      isUUID(values.walletId) &&
      isUUID(values.categoryId)
    if (canSyncToSupabase) {
      try {
        await supabaseInsertBudget(userId, {
          wallet_id: values.walletId,
          category_id: values.categoryId,
          amount_limit: values.amountLimit,
          month: values.month,
          year: values.year,
        })
        await syncSupabaseData()
        toast.success("Budget disimpan")
        return
      } catch {
        try {
          await supabaseUpsertBudget(
            userId,
            values.walletId,
            values.categoryId,
            values.month,
            values.year,
            values.amountLimit,
          )
          await syncSupabaseData()
          toast.success("Budget diperbarui")
          return
        } catch (error) {
          console.error("Supabase budget error", error)
          toast.error("Gagal menyimpan budget ke Supabase")
        }
      }
    }
    setBudgets((prev) => {
      const existingIndex = prev.findIndex(
        (budget) =>
          budget.walletId === values.walletId &&
          budget.categoryId === values.categoryId &&
          budget.month === values.month &&
          budget.year === values.year,
      )

      if (existingIndex >= 0) {
        return prev.map((budget, index) =>
          index === existingIndex
            ? { ...budget, amountLimit: values.amountLimit }
            : budget,
        )
      }

      return [
        {
          id: crypto.randomUUID(),
          walletId: values.walletId,
          categoryId: values.categoryId,
          amountLimit: values.amountLimit,
          month: values.month,
          year: values.year,
        },
        ...prev,
      ]
    })

    toast.success("Budget disimpan (mode lokal)")
  }

  const handleAddCategory = async (values: { name: string; emoji: string; type: Category["type"] }) => {
    if (supabaseReady && userId) {
      try {
        await supabaseInsertCategory(userId, {
          name: values.name,
          emoji: values.emoji,
          type: values.type,
          is_default: false,
        })
        await syncSupabaseData()
        toast.success("Kategori berhasil ditambahkan")
        return
      } catch (error) {
        console.error("Supabase insert category error", error)
        toast.error("Gagal menambah kategori di Supabase")
      }
    }
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: values.name,
      emoji: values.emoji,
      type: values.type,
      isDefault: false,
    }
    setCategories((prev) => [...prev, newCategory])
    toast.success("Kategori berhasil ditambahkan (mode lokal)")
  }

  const handleRemoveCategory = async (categoryId: string) => {
    const category = categoriesById[categoryId]
    if (!category) return
    if (category.isDefault) {
      toast.error("Kategori default tidak dapat dihapus")
      return
    }
    const used = transactions.some((transaction) => transaction.categoryId === categoryId)
    if (used) {
      toast.error("Kategori sedang dipakai oleh transaksi. Mohon edit transaksi tersebut terlebih dahulu.")
      return
    }
    if (supabaseReady && userId && category.userId && isUUID(category.id)) {
      try {
        await supabaseDeleteCategory(userId, categoryId)
        await syncSupabaseData()
        toast.success("Kategori dihapus")
        return
      } catch (error) {
        console.error("Supabase delete category error", error)
        toast.error("Gagal menghapus kategori di Supabase")
      }
    }
    setCategories((prev) => prev.filter((item) => item.id !== categoryId))
    setBudgets((prev) => prev.filter((budget) => budget.categoryId !== categoryId))
    toast.success("Kategori dihapus (mode lokal)")
  }

  const handleUpdateCategory = async (categoryId: string, payload: Pick<Category, "name" | "emoji">) => {
    const category = categoriesById[categoryId]
    if (!category || category.isDefault) {
      toast.error("Kategori default tidak dapat diedit")
      return
    }
    if (supabaseReady && userId && category.userId && isUUID(categoryId)) {
      try {
        await supabasePatchCategory(userId, categoryId, {
          name: payload.name,
          emoji: payload.emoji,
        })
        await syncSupabaseData()
        toast.success("Kategori diperbarui")
        return
      } catch (error) {
        console.error("Supabase patch category error", error)
        toast.error("Gagal memperbarui kategori di Supabase")
      }
    }
    setCategories((prev) =>
      prev.map((item) => (item.id === categoryId ? { ...item, ...payload } : item)),
    )
    toast.success("Kategori diperbarui (mode lokal)")
  }

  const spendingPieData = expenseBreakdown.map((item) => ({
    categoryId: item.categoryId,
    name: item.name,
    value: item.value,
  }))

  const topCategory = expenseBreakdown[0]
    ? {
        name: expenseBreakdown[0].name,
        amount: expenseBreakdown[0].value,
        percentage: monthlyExpense > 0 ? (expenseBreakdown[0].value / monthlyExpense) * 100 : 0,
      }
    : undefined

  const activeSection: SectionName = forceSection ?? "dashboard"

  if (isLoadingData) {
    return renderLoadingState()
  }

  if (activeSection !== "dashboard") {
    return (
      <div className="@container/main flex flex-1 flex-col gap-6 py-4 md:py-6">
        {activeSection === "wallets" && (
          <div className="px-4 lg:px-6 space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Dompet</h2>
              <p className="text-sm text-muted-foreground">Kelola semua dompet dan tambahkan saldo awal.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <WalletList wallets={wallets} onAddWallet={handleAddWallet} />
            </div>
          </div>
        )}

        {activeSection === "transactions" && (
          <div className="grid gap-6 px-4 pb-12 lg:px-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Transaksi</h2>
              <p className="text-sm text-muted-foreground">Catat pemasukan/pengeluaran dan kelola riwayat transaksi.</p>
            </div>
            <TransactionForm
              wallets={wallets}
              categories={categories}
              onSubmit={handleCreateTransaction}
              submitLabel="Simpan Transaksi"
            />

            <section id="transactions" className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Filter Transaksi</CardTitle>
                  <CardDescription>Pilih dompet, kategori, atau periode</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dompet</p>
                    <Select
                      value={filters.walletId}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, walletId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih dompet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua dompet</SelectItem>
                        {wallets.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id}>
                            {wallet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                    <Select
                      value={filters.categoryId}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua kategori</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Periode</p>
                    <Select
                      value={filters.period}
                      onValueChange={(value: FilterPeriod) =>
                        setFilters((prev) => ({ ...prev, period: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Periode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this-month">Bulan ini</SelectItem>
                        <SelectItem value="last-month">Bulan lalu</SelectItem>
                        <SelectItem value="90-days">90 hari terakhir</SelectItem>
                        <SelectItem value="all">Semua waktu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setFilters({
                          walletId: "all",
                          categoryId: "all",
                          period: "this-month",
                        })
                      }
                    >
                      Reset Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <TransactionTable
                transactions={filteredTransactions}
                walletsById={walletsById}
                categoriesById={categoriesById}
                onDelete={handleDeleteTransaction}
                onEdit={(transaction) => {
                  setEditingTransaction(transaction)
                  setIsEditDialogOpen(true)
                }}
              />
            </section>
          </div>
        )}

        {activeSection === "budgets" && (
          <section id="budgets" className="grid gap-6 px-4 pb-12 lg:px-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Budgeting</h2>
              <p className="text-sm text-muted-foreground">Pantau batas pengeluaran per kategori dan dompet.</p>
            </div>
            <BudgetProgress
              budgets={budgetsWithProgress}
              wallets={wallets}
              categories={categories}
              onAddBudget={handleAddBudget}
              monthLabel={monthLabel}
            />
          </section>
        )}

        {activeSection === "reports" && (
          <section id="reports" className="grid gap-6 px-4 pb-12 lg:px-6 lg:grid-cols-2">
            <div className="lg:col-span-2 flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Laporan</h2>
              <p className="text-sm text-muted-foreground">Lihat komposisi pengeluaran dan tren pemasukan/pengeluaran.</p>
            </div>
            <SpendingPie data={spendingPieData} totalExpense={monthlyExpense} />
            <IncomeExpenseChart data={incomeExpenseData} />
          </section>
        )}

        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) {
              setEditingTransaction(null)
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Transaksi</DialogTitle>
            </DialogHeader>
            {editingTransaction && (
              <TransactionForm
                key={editingTransaction.id}
                wallets={wallets}
                categories={categories}
                defaultValues={editingTransaction}
                onSubmit={handleUpdateTransaction}
                submitLabel="Update Transaksi"
                onCancel={() => {
                  setEditingTransaction(null)
                  setIsEditDialogOpen(false)
                }}
                isEditing
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 py-4 md:py-6">
      <SummaryCards
        totalBalance={totalBalance}
        monthLabel={monthLabel}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
        savingsRate={savingsRate}
        highlightedCategory={topCategory}
        budgetAlert={budgetAlert}
      />

      <div className="grid gap-6 px-4 pb-12 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
          <div id="transactions">
            <TransactionForm
              wallets={wallets}
              categories={categories}
              onSubmit={handleCreateTransaction}
              submitLabel="Simpan Transaksi"
            />
          </div>
          <div id="wallets">
            <WalletList wallets={wallets} onAddWallet={handleAddWallet} />
          </div>
        </div>

        <section id="reports" className="grid gap-6 lg:grid-cols-2">
          <SpendingPie data={spendingPieData} totalExpense={monthlyExpense} />
          <IncomeExpenseChart data={incomeExpenseData} />
        </section>

        <section id="budgets" className="grid gap-6 lg:grid-cols-2">
          <BudgetProgress
            budgets={budgetsWithProgress}
            wallets={wallets}
            categories={categories}
            onAddBudget={handleAddBudget}
            monthLabel={monthLabel}
          />
          <CategoryManager
            categories={categories}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onUpdateCategory={handleUpdateCategory}
          />
        </section>

        <section id="transactions" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Filter Riwayat</CardTitle>
              <CardDescription>Pilih dompet, kategori, atau periode tertentu.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dompet</p>
                <Select
                  value={filters.walletId}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, walletId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua dompet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua dompet</SelectItem>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua kategori</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.emoji} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Periode</p>
                <Select
                  value={filters.period}
                  onValueChange={(value: FilterPeriod) =>
                    setFilters((prev) => ({ ...prev, period: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">Bulan ini</SelectItem>
                    <SelectItem value="last-month">Bulan lalu</SelectItem>
                    <SelectItem value="90-days">90 hari terakhir</SelectItem>
                    <SelectItem value="all">Semua waktu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFilters({
                      walletId: "all",
                      categoryId: "all",
                      period: "this-month",
                    })
                  }
                >
                  Reset Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          <TransactionTable
            transactions={filteredTransactions}
            walletsById={walletsById}
            categoriesById={categoriesById}
            onDelete={handleDeleteTransaction}
            onEdit={(transaction) => {
              setEditingTransaction(transaction)
              setIsEditDialogOpen(true)
            }}
          />
        </section>
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingTransaction(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              key={editingTransaction.id}
              wallets={wallets}
              categories={categories}
              defaultValues={editingTransaction}
              onSubmit={handleUpdateTransaction}
              submitLabel="Update Transaksi"
              onCancel={() => {
                setEditingTransaction(null)
                setIsEditDialogOpen(false)
              }}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
