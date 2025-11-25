"use client"

import { useMemo, useState } from "react"
import { IconPencil, IconTrash } from "@tabler/icons-react"

import { Category, Transaction, Wallet, formatCurrency } from "@/lib/finance-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type TransactionTableProps = {
  transactions: Transaction[]
  walletsById: Record<string, Wallet>
  categoriesById: Record<string, Category>
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => Promise<void> | void
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function TransactionTable({
  transactions,
  walletsById,
  categoriesById,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const aggregated = useMemo(() => {
    const totalIncome = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0)
    const totalExpense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0)
    return { totalIncome, totalExpense }
  }, [transactions])

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>
            Data dapat difilter berdasarkan periode, dompet, maupun kategori.
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Total Pemasukan</p>
            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(aggregated.totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Pengeluaran</p>
            <p className="font-semibold text-destructive">
              {formatCurrency(aggregated.totalExpense)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Dompet</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada transaksi pada filter ini.
                  </TableCell>
                </TableRow>
              )}
              {transactions.map((transaction) => {
                const wallet = walletsById[transaction.walletId]
                const category = categoriesById[transaction.categoryId]
                const formattedDate = dateFormatter.format(new Date(transaction.date))

                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{formattedDate}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{wallet?.name ?? "Dompet?"}</span>
                        <span className="text-xs text-muted-foreground">{wallet?.currency}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {category?.emoji && <span>{category.emoji}</span>}
                        <div className="flex flex-col">
                          <span className="font-medium">{category?.name ?? "Kategori"}</span>
                          <Badge
                            variant="outline"
                            className={transaction.type === "income" ? "border-emerald-200 text-emerald-600 dark:border-emerald-500/40 dark:text-emerald-200" : "border-destructive/40 text-destructive"}
                          >
                            {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] text-sm text-muted-foreground">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount, wallet?.currency ?? "IDR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Edit"
                          onClick={() => onEdit(transaction)}
                        >
                          <IconPencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Hapus"
                          onClick={() => setTransactionToDelete(transaction)}
                        >
                          <IconTrash className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan mengembalikan saldo dompet sesuai nominal transaksi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={async () => {
                if (!transactionToDelete) return
                setIsDeleting(true)
                try {
                  await onDelete(transactionToDelete)
                  setTransactionToDelete(null)
                } finally {
                  setIsDeleting(false)
                }
              }}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
