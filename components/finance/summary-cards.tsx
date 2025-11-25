"use client"

import { IconAlertTriangle, IconArrowUpRight, IconPigMoney, IconWallet } from "@tabler/icons-react"

import { formatCurrency } from "@/lib/finance-data"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type HighlightedCategory = {
  name: string
  amount: number
  percentage: number
}

type BudgetAlert = {
  name: string
  spent: number
  limit: number
}

type SummaryCardsProps = {
  totalBalance: number
  monthLabel: string
  monthlyIncome: number
  monthlyExpense: number
  savingsRate: number
  highlightedCategory?: HighlightedCategory
  budgetAlert?: BudgetAlert
}

export function SummaryCards({
  totalBalance,
  monthLabel,
  monthlyIncome,
  monthlyExpense,
  savingsRate,
  highlightedCategory,
  budgetAlert,
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 px-4 lg:px-6 @container/main md:grid-cols-2 xl:grid-cols-4">
      <Card className="@container/card border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
          <IconWallet className="text-primary size-5" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-3xl font-semibold">{formatCurrency(totalBalance)}</div>
          <CardDescription>Akumulasi dari semua dompet aktif</CardDescription>
          <div className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("id-ID", {
              dateStyle: "full",
            }).format(new Date())}
          </div>
        </CardContent>
      </Card>
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">Pemasukan</CardTitle>
            <CardDescription>{monthLabel}</CardDescription>
          </div>
          <Badge variant="secondary" className="text-primary">
            <IconArrowUpRight className="mr-1 size-3" />
            Income
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">{formatCurrency(monthlyIncome)}</div>
          <p className="text-sm text-muted-foreground">
            Termasuk gaji, usaha, dan pekerjaan sampingan
          </p>
        </CardContent>
      </Card>
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
            <CardDescription>{monthLabel}</CardDescription>
          </div>
          <Badge variant="outline" className="text-destructive border-destructive/50">
            -{Math.round((monthlyExpense / Math.max(monthlyIncome, 1)) * 100)}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">{formatCurrency(monthlyExpense)}</div>
          {highlightedCategory ? (
            <p className="text-sm text-muted-foreground">
              {highlightedCategory.name} menyumbang{" "}
              <span className="font-medium">
                {formatCurrency(highlightedCategory.amount)} (
                {Math.round(highlightedCategory.percentage)}%)
              </span>{" "}
              dari total pengeluaran.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum ada transaksi pengeluaran pada periode ini.
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="@container/card">
        <CardHeader className="gap-1 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <IconPigMoney className="text-primary size-5" />
            Savings Rate
          </CardTitle>
          <CardDescription>Selisih pemasukan vs pengeluaran</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-semibold">
              {Number.isFinite(savingsRate) ? `${Math.max(savingsRate, 0).toFixed(1)}%` : "0%"}
            </span>
            <span className="text-xs text-muted-foreground">Target: 30%</span>
          </div>
          <Progress value={Math.min(Math.max(savingsRate, 0), 100)} className="h-2" />
          {budgetAlert ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
              <div className="flex items-center gap-2 font-medium">
                <IconAlertTriangle className="size-4" />
                Budget menipis
              </div>
              <p>
                {budgetAlert.name} telah terpakai{" "}
                <span className="font-semibold">
                  {Math.round((budgetAlert.spent / budgetAlert.limit) * 100)}%
                </span>{" "}
                ({formatCurrency(budgetAlert.spent)} dari {formatCurrency(budgetAlert.limit)}).
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Semua budget berada di bawah 80% dari batas bulan ini.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
