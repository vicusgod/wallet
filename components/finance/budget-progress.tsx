"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconTargetArrow } from "@tabler/icons-react"

import { Category, Wallet, formatCurrency } from "@/lib/finance-data"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type BudgetProgressItem = {
  id: string
  walletId: string
  walletName: string
  categoryId: string
  categoryName: string
  amountLimit: number
  spent: number
  month: number
  year: number
}

type BudgetProgressProps = {
  budgets: BudgetProgressItem[]
  wallets: Wallet[]
  categories: Category[]
  onAddBudget: (payload: BudgetFormValues) => Promise<void> | void
  monthLabel: string
}

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

const budgetSchema = z.object({
  walletId: z.string().min(1, "Pilih dompet"),
  categoryId: z.string().min(1, "Pilih kategori pengeluaran"),
  amountLimit: z
      .number({
        message: "Masukkan batas budget",
      })
      .positive("Budget harus lebih dari 0"),
  month: z
    .number()
    .min(1)
    .max(12),
  year: z
    .number()
    .min(2023)
    .max(2100),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>

export function BudgetProgress({
  budgets,
  wallets,
  categories,
  onAddBudget,
  monthLabel,
}: BudgetProgressProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const expenseCategories = categories.filter((category) => category.type === "expense")
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      walletId: wallets[0]?.id ?? "",
      categoryId: expenseCategories[0]?.id ?? "",
      amountLimit: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  })

  const handleSubmit = async (values: BudgetFormValues) => {
    setIsSubmitting(true)
    try {
      await onAddBudget(values)
      setIsDialogOpen(false)
      form.reset({
        walletId: values.walletId,
        categoryId: values.categoryId,
        amountLimit: 0,
        month: values.month,
        year: values.year,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Budgeting</CardTitle>
          <CardDescription>Progress penggunaan budget pengeluaran {monthLabel}</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <IconTargetArrow className="size-4" />
              Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Budget Pengeluaran</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="walletId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dompet</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih dompet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {wallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori Pengeluaran</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.emoji} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bulan</FormLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih bulan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((monthName, index) => (
                              <SelectItem key={monthName} value={String(index + 1)}>
                                {monthName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun</FormLabel>
                        <Input
                          type="number"
                          min={2023}
                          max={2100}
                          {...field}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="amountLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batas Budget</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={10000}
                          {...field}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Belum ada budget untuk bulan ini. Tambahkan untuk memantau pengeluaran.
          </p>
        )}
        {budgets.map((budget) => {
          const progress = Math.min(100, (budget.spent / budget.amountLimit) * 100 || 0)
          let badgeVariant: "default" | "destructive" | "secondary" = "secondary"

          if (progress >= 90) {
            badgeVariant = "destructive"
          } else if (progress >= 70) {
            badgeVariant = "default"
          }

          return (
            <div key={budget.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{budget.walletName}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{budget.categoryName}</p>
                    <Badge variant={badgeVariant}>
                      {progress.toFixed(0)}% terpakai
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">Sisa</p>
                  <p className="font-semibold">
                    {formatCurrency(Math.max(budget.amountLimit - budget.spent, 0))}
                  </p>
                </div>
              </div>
              <Progress value={progress} className="mt-3 h-2" />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Terpakai: {formatCurrency(budget.spent)}</span>
                <span>Batas: {formatCurrency(budget.amountLimit)}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
