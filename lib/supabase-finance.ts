const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC__SUPABASE_ANON_KEY

const SUPABASE_REST_URL = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1`
  : ""

const defaultHeaders =
  SUPABASE_ANON_KEY && SUPABASE_REST_URL
    ? {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      }
    : null

export const isSupabaseConfigured = Boolean(defaultHeaders && SUPABASE_REST_URL)

type RequestOptions = RequestInit & { searchParams?: URLSearchParams }

async function supabaseFetch<TResponse>(
  path: string,
  { searchParams, ...init }: RequestOptions = {},
): Promise<TResponse> {
  if (!defaultHeaders || !SUPABASE_REST_URL) {
    throw new Error("Supabase is not correctly configured")
  }

  const url = new URL(`${SUPABASE_REST_URL}/${path}`)
  if (searchParams) {
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      ...defaultHeaders,
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || response.statusText)
  }

  if (response.status === 204) {
    return null as TResponse
  }

  return (await response.json()) as TResponse
}

type SupabaseRecord<T extends Record<string, unknown>> = T & {
  id: string
  user_id: string
}

export type WalletRecord = SupabaseRecord<{
  name: string
  currency: string
  balance: number
  type: string | null
  description: string | null
}>

export type CategoryRecord = SupabaseRecord<{
  name: string
  type: string
  emoji: string | null
  is_default: boolean | null
}>

export type TransactionRecord = SupabaseRecord<{
  wallet_id: string
  category_id: string
  type: string
  amount: number
  description: string | null
  transaction_date: string
}>

export type BudgetRecord = SupabaseRecord<{
  wallet_id: string
  category_id: string
  amount_limit: number
  month: number
  year: number
}>

const withUserFilter = (userId: string) => {
  const params = new URLSearchParams()
  params.set("select", "*")
  params.set("user_id", `eq.${userId}`)
  return params
}

export async function fetchWallets(userId: string) {
  const params = withUserFilter(userId)
  params.set("order", "created_at.asc")
  return supabaseFetch<WalletRecord[]>("wallets", { searchParams: params })
}

export function insertWallet(userId: string, payload: Partial<WalletRecord>) {
  return supabaseFetch<WalletRecord[]>("wallets", {
    method: "POST",
    body: JSON.stringify([{ ...payload, user_id: userId }]),
  })
}

export function updateWalletBalance(
  userId: string,
  walletId: string,
  balance: number,
) {
  const params = new URLSearchParams()
  params.set("id", `eq.${walletId}`)
  params.set("user_id", `eq.${userId}`)
  return supabaseFetch<WalletRecord[]>("wallets", {
    method: "PATCH",
    body: JSON.stringify({ balance }),
    searchParams: params,
  })
}

export function fetchCategories(userId: string) {
  const params = withUserFilter(userId)
  params.set("order", "created_at.asc")
  return supabaseFetch<CategoryRecord[]>("categories", { searchParams: params })
}

export function insertCategory(userId: string, payload: Partial<CategoryRecord>) {
  return supabaseFetch<CategoryRecord[]>("categories", {
    method: "POST",
    body: JSON.stringify([{ ...payload, user_id: userId }]),
  })
}

export function patchCategory(
  userId: string,
  categoryId: string,
  payload: Partial<CategoryRecord>,
) {
  const params = new URLSearchParams()
  params.set("id", `eq.${categoryId}`)
  params.set("user_id", `eq.${userId}`)
  return supabaseFetch<CategoryRecord[]>("categories", {
    method: "PATCH",
    body: JSON.stringify(payload),
    searchParams: params,
  })
}

export function deleteCategory(userId: string, categoryId: string) {
  const params = new URLSearchParams()
  params.set("id", `eq.${categoryId}`)
  params.set("user_id", `eq.${userId}`)
  return supabaseFetch<null>("categories", {
    method: "DELETE",
    searchParams: params,
  })
}

export function fetchTransactions(userId: string) {
  const params = withUserFilter(userId)
  params.set("order", "transaction_date.desc")
  return supabaseFetch<TransactionRecord[]>("transactions", {
    searchParams: params,
  })
}

export function insertTransaction(
  userId: string,
  payload: Partial<TransactionRecord>,
) {
  return supabaseFetch<TransactionRecord[]>("transactions", {
    method: "POST",
    body: JSON.stringify([{ ...payload, user_id: userId }]),
  })
}

export function patchTransaction(
  userId: string,
  transactionId: string,
  payload: Partial<TransactionRecord>,
) {
  const params = new URLSearchParams()
  params.set("id", `eq.${transactionId}`)
  params.set("user_id", `eq.${userId}`)
  return supabaseFetch<TransactionRecord[]>("transactions", {
    method: "PATCH",
    body: JSON.stringify(payload),
    searchParams: params,
  })
}

export function deleteTransaction(userId: string, transactionId: string) {
  const params = new URLSearchParams()
  params.set("id", `eq.${transactionId}`)
  params.set("user_id", `eq.${userId}`)
  return supabaseFetch<null>("transactions", {
    method: "DELETE",
    searchParams: params,
  })
}

export function fetchBudgets(userId: string) {
  const params = withUserFilter(userId)
  return supabaseFetch<BudgetRecord[]>("budgets", {
    searchParams: params,
  })
}

export function insertBudget(userId: string, payload: Partial<BudgetRecord>) {
  return supabaseFetch<BudgetRecord[]>("budgets", {
    method: "POST",
    body: JSON.stringify([{ ...payload, user_id: userId }]),
  })
}

export function upsertBudget(
  userId: string,
  walletId: string,
  categoryId: string,
  month: number,
  year: number,
  amountLimit: number,
) {
  const params = new URLSearchParams()
  params.set("wallet_id", `eq.${walletId}`)
  params.set("category_id", `eq.${categoryId}`)
  params.set("month", `eq.${month}`)
  params.set("year", `eq.${year}`)
  params.set("user_id", `eq.${userId}`)
  return supabaseFetch<BudgetRecord[]>("budgets", {
    method: "PATCH",
    searchParams: params,
    body: JSON.stringify({ amount_limit: amountLimit }),
  })
}
