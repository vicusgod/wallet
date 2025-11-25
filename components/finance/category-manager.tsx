"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconCategoryPlus, IconPencil, IconTrash } from "@tabler/icons-react"

import { Category } from "@/lib/finance-data"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const categorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
  emoji: z.string().min(1, "Isi 1 emoji").max(2, "Gunakan maksimal 2 karakter"),
  type: z.enum(["income", "expense"]),
})

type CategoryFormValues = z.infer<typeof categorySchema>

type CategoryManagerProps = {
  categories: Category[]
  onAddCategory: (payload: CategoryFormValues) => Promise<void> | void
  onRemoveCategory: (id: string) => Promise<void> | void
  onUpdateCategory: (id: string, payload: Pick<Category, "name" | "emoji">) => Promise<void> | void
}

export function CategoryManager({
  categories,
  onAddCategory,
  onRemoveCategory,
  onUpdateCategory,
}: CategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<Category["type"]>("expense")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditingCategory, setIsEditingCategory] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      emoji: "🆕",
      type: "expense",
    },
  })

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      emoji: "💡",
      type: "expense",
    },
  })

  const tabbedCategories = useMemo(
    () => categories.filter((category) => category.type === activeTab),
    [categories, activeTab],
  )

  const handleAddCategory = async (values: CategoryFormValues) => {
    setIsSubmitting(true)
    try {
      await onAddCategory(values)
      form.reset({
        name: "",
        emoji: "🆕",
        type: values.type,
      })
      setIsDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCategory = async (values: CategoryFormValues) => {
    if (!categoryToEdit) return
    setIsEditingCategory(true)
    try {
      await onUpdateCategory(categoryToEdit.id, {
        name: values.name,
        emoji: values.emoji,
      })
      setIsEditDialogOpen(false)
    } finally {
      setIsEditingCategory(false)
    }
  }

  const openEditDialog = (category: Category) => {
    setCategoryToEdit(category)
    editForm.reset({
      name: category.name,
      emoji: category.emoji,
      type: category.type,
    })
    setIsEditDialogOpen(true)
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Kategori Transaksi</CardTitle>
          <CardDescription>Kelola kategori default & kustom untuk transaksi</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <IconCategoryPlus className="size-4" />
              Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Kategori</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddCategory)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value as Category["type"])}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="expense">Pengeluaran</SelectItem>
                          <SelectItem value="income">Pemasukan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama</FormLabel>
                      <FormControl>
                        <Input placeholder="mis. Kopi, Perawatan Motor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emoji"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emoji / Ikon</FormLabel>
                      <FormControl>
                        <Input maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
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
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Category["type"])}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
          </TabsList>
          <TabsContent value="expense" className="mt-4 space-y-3">
            {tabbedCategories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={() => openEditDialog(category)}
                onDelete={() => onRemoveCategory(category.id)}
              />
            ))}
            {tabbedCategories.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum ada kategori untuk tipe ini.
              </p>
            )}
          </TabsContent>
          <TabsContent value="income" className="mt-4 space-y-3">
            {categories
              .filter((category) => category.type === "income")
              .map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  onEdit={() => openEditDialog(category)}
                  onDelete={() => onRemoveCategory(category.id)}
                />
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditCategory)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                      <Input maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isEditingCategory}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={categoryToEdit?.isDefault || isEditingCategory}
                  >
                    {isEditingCategory ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </Form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: () => void
  onDelete: () => Promise<void> | void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <div className="flex items-center justify-between rounded-xl border px-4 py-3">
      <div>
        <div className="flex items-center gap-2 text-base font-semibold">
          <span className="text-2xl">{category.emoji}</span>
          {category.name}
          {category.isDefault && (
            <Badge variant="outline" className="text-xs">
              Default
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Digunakan untuk {category.type === "income" ? "pemasukan" : "pengeluaran"}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit kategori"
          disabled={category.isDefault}
          onClick={onEdit}
        >
          <IconPencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Hapus kategori"
          disabled={category.isDefault || isDeleting}
          onClick={async () => {
            setIsDeleting(true)
            try {
              await onDelete()
            } finally {
              setIsDeleting(false)
            }
          }}
        >
          <IconTrash className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
