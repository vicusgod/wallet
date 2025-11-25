"use client"

import { Pie, PieChart, Cell } from "recharts"

import { formatCurrency } from "@/lib/finance-data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type SpendingSlice = {
  categoryId: string
  name: string
  value: number
}

type SpendingPieProps = {
  data: SpendingSlice[]
  totalExpense: number
}

const defaultColors = [
  "hsl(12, 88%, 62%)",
  "hsl(199, 89%, 48%)",
  "hsl(275, 70%, 60%)",
  "hsl(145, 63%, 42%)",
  "hsl(48, 96%, 53%)",
]

export function SpendingPie({ data, totalExpense }: SpendingPieProps) {
  const chartConfig = data.reduce<ChartConfig>(
    (config, slice, index) => {
      config[slice.categoryId] = {
        label: slice.name,
        color: defaultColors[index % defaultColors.length],
      }
      return config
    },
    {
      amount: {
        label: "Pengeluaran",
      },
    },
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Komposisi Pengeluaran</CardTitle>
        <CardDescription>Menunjukkan persentase tiap kategori bulan ini</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-sm"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((item) => (
                <Cell
                  key={item.categoryId}
                  fill={`var(--color-${item.categoryId})`}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="space-y-3 rounded-xl border p-4">
          <div>
            <p className="text-sm text-muted-foreground">Total pengeluaran</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div className="space-y-2">
            {data.map((item, index) => {
              const percentage = totalExpense
                ? Math.round((item.value / totalExpense) * 100)
                : 0
              return (
                <div
                  key={item.categoryId}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full"
                      style={{
                        backgroundColor: defaultColors[index % defaultColors.length],
                      }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">
                    {percentage}% · {formatCurrency(item.value)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
