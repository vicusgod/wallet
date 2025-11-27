"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconPlus, IconWallet } from "@tabler/icons-react"

import { Wallet, formatCurrency } from "@/lib/finance-data"
import { cn } from "@/lib/utils"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const walletSchema = z.object({
  name: z.string().min(3, "Nama dompet minimal 3 karakter"),
  currency: z.string().min(3, "Pilih mata uang"),
  type: z.enum(["cash", "bank", "savings"]),
  balance: z
    .number({
      message: "Masukkan saldo awal",
    })
    .nonnegative("Saldo tidak boleh negatif"),

  description: z.string().max(120, "Deskripsi maksimal 120 karakter").optional(),
})

type WalletFormValues = z.infer<typeof walletSchema>

type WalletListProps = {
  wallets: Wallet[]
  onAddWallet: (payload: WalletFormValues) => Promise<void> | void
}

const walletTypeCopy: Record<Wallet["type"], { label: string; accent: string }> = {
  cash: { label: "Tunai", accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" },
  bank: { label: "Rekening", accent: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-100" },
  savings: { label: "Tabungan", accent: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-100" },
}

export function WalletList({ wallets, onAddWallet }: WalletListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: "",
      currency: "IDR",
      type: "cash",
      balance: 0,
      description: "",
    },
  })

  const handleSubmit = async (values: WalletFormValues) => {
    setIsSubmitting(true)
    try {
      await onAddWallet(values)
      form.reset({
        name: "",
        currency: values.currency,
        type: values.type,
        balance: 0,
        description: "",
      })
      setIsDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Dompet Aktif</CardTitle>
          <CardDescription>Atur dompet pribadi, tabungan, dan usaha Anda</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full gap-1 sm:w-auto">
              <IconPlus className="size-4" />
              Dompet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Dompet Baru</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Dompet</FormLabel>
                      <FormControl>
                        <Input placeholder="mis. Dompet Kuliah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipe</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Tunai</SelectItem>
                            <SelectItem value="bank">Rekening</SelectItem>
                            <SelectItem value="savings">Tabungan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mata Uang</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih mata uang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IDR">IDR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="SGD">SGD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saldo Awal</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step={50000} placeholder="0" {...field} onChange={(event) => field.onChange(Number(event.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan (opsional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tuliskan tujuan dompet ini" rows={3} {...field} />
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
                    {isSubmitting ? "Menyimpan..." : "Simpan Dompet"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {wallets.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-8 text-center">
            <IconWallet className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">Belum ada dompet</p>
            <p className="text-sm text-muted-foreground">
              Buat dompet pertama untuk mulai mencatat pemasukan & pengeluaran.
            </p>
            <Button className="mt-4 gap-2" onClick={() => setIsDialogOpen(true)}>
              <IconPlus className="size-4" />
              Tambah Dompet
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className="text-2xl font-semibold">{formatCurrency(wallet.balance, wallet.currency)}</p>
                  </div>
                  <Badge className={cn("rounded-full text-xs font-medium", walletTypeCopy[wallet.type].accent)}>
                    {walletTypeCopy[wallet.type].label}
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-base font-semibold">{wallet.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {wallet.description || "Belum ada catatan khusus"}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-end text-xs text-muted-foreground">
                  <span>{wallet.currency}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
