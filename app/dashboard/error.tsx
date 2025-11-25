"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error boundary:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <Card className="max-w-xl w-full border-destructive/30 bg-destructive/5">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="size-6" />
            <CardTitle className="text-2xl">Dashboard gagal dimuat</CardTitle>
          </div>
          <CardDescription>
            Terjadi kesalahan saat membaca data dompet Anda. Ini bisa disebabkan koneksi
            yang terputus atau sesi login yang kedaluwarsa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-background/80 p-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Detail Teknis</p>
            <p className="break-all text-xs">
              {error.message || "Unknown error"} {error.digest && `(trace: ${error.digest})`}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="gap-2" onClick={() => reset()}>
              <RefreshCw className="size-4" />
              Muat ulang dashboard
            </Button>
            <Button asChild className="gap-2">
              <Link href="/sign-in">
                Masuk kembali
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Jika masalah terus berlanjut, laporkan ke tim dukungan dengan menyertakan pesan
            di atas. Kami akan membantu memastikan data Anda aman.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
