import {
  pgTable,
  uuid,
  text,
  varchar,
  numeric,
  timestamp,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

import { user } from "@/db/schema/auth"

export const categoryTypeEnum = pgEnum("category_type", ["income", "expense"])

export const wallets = pgTable(
  "wallets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    currency: varchar("currency", { length: 5 }).notNull().default("IDR"),
    balance: numeric("balance", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueWalletPerUser: uniqueIndex("wallets_user_name_idx").on(
      table.userId,
      table.name,
    ),
  }),
)

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 100 }).notNull(),
    type: categoryTypeEnum("type").notNull().default("expense"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueCategoryPerUser: uniqueIndex("categories_user_name_type_idx").on(
      table.userId,
      table.name,
      table.type,
    ),
  }),
)

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletId: uuid("wallet_id")
    .references(() => wallets.id, { onDelete: "cascade" })
    .notNull(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  transactionDate: timestamp("transaction_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    walletId: uuid("wallet_id")
      .references(() => wallets.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: uuid("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
    amountLimit: numeric("amount_limit", { precision: 15, scale: 2 }).notNull(),
    month: integer("month")
      .notNull()
      .check(sql`month >= 1 AND month <= 12`),
    year: integer("year").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueBudgetPerPeriod: uniqueIndex("budgets_wallet_category_period_idx").on(
      table.walletId,
      table.categoryId,
      table.month,
      table.year,
    ),
  }),
)

export const transactionsWalletIndex = index(
  "transactions_wallet_idx",
).on(transactions.walletId)

export const transactionsCategoryIndex = index(
  "transactions_category_idx",
).on(transactions.categoryId)

export const transactionsDateIndex = index("transactions_date_idx").on(
  transactions.transactionDate,
)

export const budgetsWalletPeriodIndex = index(
  "budgets_wallet_period_idx",
).on(budgets.walletId, budgets.month, budgets.year)

export const categoriesUserIndex = index("categories_user_idx").on(
  categories.userId,
)
