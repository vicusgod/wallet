"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

type IncomeExpenseDatum = {
  month: string
  income: number
  expense: number
}

type IncomeExpenseChartProps = {
  data: IncomeExpenseDatum[]
}

const chartConfig: ChartConfig = {
  income: {
    label: "Pemasukan",
    color: "hsl(152, 69%, 45%)",
  },
  expense: {
    label: "Pengeluaran",
    color: "hsl(9, 88%, 60%)",
  },
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Trend 6 Bulan</CardTitle>
        <CardDescription>Pembanding pemasukan vs pengeluaran</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="min-h-[280px]"
        >
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(value) =>
                value >= 1_000_000
                  ? `${Math.round(value / 1_000_000)}jt`
                  : `${Math.round(value / 1000)}rb`
              }
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {name === "income" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                      <span>{formatCurrency(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="income"
              stackId="a"
              radius={[4, 4, 0, 0]}
              fill="var(--color-income)"
            />
            <Bar
              dataKey="expense"
              stackId="b"
              radius={[4, 4, 0, 0]}
              fill="var(--color-expense)"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
