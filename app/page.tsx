"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  PieChart,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { AuthButtons, HeroAuthButtons } from "@/components/auth-buttons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Autentikasi Modern",
    description: "Registrasi, login, serta reset password aman via Better Auth.",
    icon: ShieldCheck,
  },
  {
    title: "Multi Dompet",
    description: "Kelola dompet pribadi, usaha, hingga tabungan dengan mata uang berbeda.",
    icon: Wallet,
  },
  {
    title: "Transaksi Lengkap",
    description: "Catat pemasukan & pengeluaran dengan kategori, catatan, dan saldo otomatis.",
    icon: PiggyBank,
  },
  {
    title: "Budgeting Pintar",
    description: "Tetapkan limit bulanan per kategori dan pantau progresnya.",
    icon: PieChart,
  },
  {
    title: "Dashboard Insight",
    description: "Grafik pie & bar untuk melihat tren 6 bulan dan komposisi pengeluaran.",
    icon: BarChart3,
  },
];

const flow = [
  {
    step: "1",
    title: "Onboarding Cepat",
    copy: "Daftar atau login, lalu buat dompet pertama beserta saldo awal untuk mulai mencatat.",
  },
  {
    step: "2",
    title: "Catat Transaksi",
    copy: "Tambah pemasukan/pengeluaran dengan kategori seperti Makanan, Transport, Gaji, dsb.",
  },
  {
    step: "3",
    title: "Pantau Budget & Insight",
    copy: "Lihat pie chart, tren pemasukan vs pengeluaran, dan sisa budget setiap kategori.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="relative px-4 py-10 sm:py-16">
        <div className="absolute right-4 top-4 flex items-center gap-3 sm:right-8 sm:top-8">
          <AuthButtons />
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="outline" className="px-4 py-1 text-sm font-medium">
            Personal Finance Wallet
          </Badge>
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/codeguide-logo.png"
              alt="DompetKu"
              width={56}
              height={56}
              className="rounded-xl"
            />
            <h1 className="font-parkinsans text-4xl font-bold leading-tight sm:text-5xl">
              DompetKu
            </h1>
          </div>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Dompet digital yang memudahkan Anda mencatat pemasukan & pengeluaran, mengatur dompet
            berbeda, membuat budget, serta menganalisis keuangan pribadi dalam satu dashboard
            responsif.
          </p>
          <HeroAuthButtons />
        </div>
      </div>

      <main className="container mx-auto max-w-6xl space-y-10 px-4 pb-16 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-primary/10 bg-white/80 shadow-sm transition hover:-translate-y-1 dark:bg-slate-900/60"
            >
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <Card className="h-full border-primary/20 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-900/40">
            <CardHeader>
              <CardTitle>Alur Pengguna</CardTitle>
              <CardDescription>Dari onboarding sampai laporan mingguan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {flow.map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 rounded-xl border border-dashed border-primary/20 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.copy}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="h-full border-primary/20 bg-white/80 dark:bg-slate-900/60">
            <CardHeader>
              <CardTitle>Teknologi</CardTitle>
              <CardDescription>
                Stack modern bawaan Codeguide Starter Fullstack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <FeatureTag title="Framework" value="Next.js 15 + React 19" />
              <FeatureTag title="UI" value="Tailwind v4 + shadcn/ui" />
              <FeatureTag title="Auth" value="Better Auth (Email/Password)" />
              <FeatureTag title="Database" value="Drizzle ORM + PostgreSQL" />
              <FeatureTag title="Charting" value="Recharts + Radix Primitives" />
            </CardContent>
          </Card>
        </section>

        <Card className="border-primary/20 bg-gradient-to-r from-blue-500 via-slate-900 to-emerald-500 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Mulai Atur Keuangan Anda</CardTitle>
            <CardDescription className="text-base text-white/80">
              Buat dompet, atur kategori, tetapkan budget, dan dapatkan insight finansial yang
              actionable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" variant="secondary" className="text-base font-semibold">
              <Link href="/sign-up" className="flex items-center gap-2">
                Buat Akun Gratis
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function FeatureTag({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-slate-900 dark:bg-slate-800/60 dark:text-slate-100">
      <p className="text-sm font-medium">{title}</p>
      <span className="text-xs uppercase tracking-wide">{value}</span>
    </div>
  );
}
