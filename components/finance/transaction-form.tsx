"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconArrowDownRight, IconArrowUpRight, IconCalendarCheck } from "@tabler/icons-react"

import { Category, Transaction, Wallet } from "@/lib/finance-data"
import { formatCurrency } from "@/lib/finance-data"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  walletId: z.string().min(1, "Pilih dompet"),
  categoryId: z.string().min(1, "Pilih kategori"),
  amount: z
    .number({
      required_error: "Masukkan nominal",
    })
    .positive("Nominal harus lebih dari 0"),
  date: z.string().min(1, "Pilih tanggal"),
  description: z.string().max(160).optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

type TransactionFormProps = {
  wallets: Wallet[]
  categories: Category[]
  onSubmit: (values: TransactionFormValues) => Promise<void> | void
  defaultValues?: Partial<Transaction>
  submitLabel?: string
  onCancel?: () => void
  isEditing?: boolean
}

const today = new Date().toISOString().slice(0, 10)

export function TransactionForm({
  wallets,
  categories,
  onSubmit,
  defaultValues,
  submitLabel = "Simpan Transaksi",
  onCancel,
  isEditing = false,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultValues?.type ?? "expense",
      walletId: defaultValues?.walletId ?? wallets[0]?.id ?? "",
      categoryId: defaultValues?.categoryId ?? categories.find((cat) => cat.type === (defaultValues?.type ?? "expense"))?.id ?? "",
      amount: defaultValues?.amount ?? 0,
      date: defaultValues?.date ?? today,
      description: defaultValues?.description ?? "",
    },
  })

  const selectedType = form.watch("type")
  const filteredCategories = categories.filter((category) => category.type === selectedType)

  useEffect(() => {
    if (!filteredCategories.some((category) => category.id === form.getValues("categoryId"))) {
      const fallback = filteredCategories[0]?.id ?? ""
      form.setValue("categoryId", fallback)
    }
  }, [filteredCategories, form])

  const handleSubmit = async (values: TransactionFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
      if (!isEditing) {
        const defaultCategory = categories.find((category) => category.type === values.type)
        form.reset({
          type: values.type,
          walletId: values.walletId,
          categoryId: defaultCategory?.id ?? "",
          amount: 0,
          date: today,
          description: "",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const wallet = wallets.find((item) => item.id === form.watch("walletId"))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Transaksi" : "Tambah Transaksi"}</CardTitle>
        <CardDescription>
          Catat pemasukan dan pengeluaran lengkap dengan kategori serta dompet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Jenis</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={field.value === "expense" ? "default" : "outline"}
                        className="w-full gap-2"
                        onClick={() => field.onChange("expense")}
                      >
                        <IconArrowDownRight className="size-4" />
                        Pengeluaran
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "income" ? "default" : "outline"}
                        className="w-full gap-2"
                        onClick={() => field.onChange("income")}
                      >
                        <IconArrowUpRight className="size-4" />
                        Pemasukan
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={5000}
                      placeholder="0"
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
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
                        {wallets.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
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
                    <FormLabel>Kategori</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((category) => (
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
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" max={today} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="rounded-xl border border-dashed px-3 py-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <IconCalendarCheck className="size-4" />
                  Ringkasan
                </div>
                <p>{wallet ? `Saldo ${wallet.name}: ${formatCurrency(wallet.balance, wallet.currency)}` : "Pilih dompet untuk melihat sisa saldo."}</p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: makan siang di kantor, cicilan motor, bonus project..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedType === "income" ? "Pemasukan" : "Pengeluaran"}</Badge>
                <span>
                  Nilai positif akan {selectedType === "income" ? "menambah" : "mengurangi"} saldo dompet
                </span>
              </div>
              <span>{wallet?.currency ?? "IDR"}</span>
            </div>
            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Batal
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
