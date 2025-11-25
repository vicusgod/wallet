"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  IconArrowsExchange2,
  IconChartPie,
  IconDashboard,
  IconFileDollar,
  IconHelp,
  IconNews,
  IconReportAnalytics,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconWallet,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Dompet",
      url: "/dashboard#wallets",
      icon: IconWallet,
    },
    {
      title: "Transaksi",
      url: "/dashboard#transactions",
      icon: IconArrowsExchange2,
    },
    {
      title: "Budgeting",
      url: "/dashboard#budgets",
      icon: IconTargetArrow,
    },
    {
      title: "Laporan",
      url: "/dashboard#reports",
      icon: IconChartPie,
    },
  ],
  navClouds: [
    {
      title: "Pengaturan Budget",
      icon: IconTargetArrow,
      isActive: true,
      url: "/dashboard#budgets",
      items: [
        {
          title: "Semua Budget",
          url: "/dashboard#budgets",
        },
        {
          title: "Tambah Budget",
          url: "/dashboard#budgets",
        },
      ],
    },
    {
      title: "Templates",
      icon: IconFileDollar,
      url: "#",
      items: [
        {
          title: "Import CSV",
          url: "#",
        },
        {
          title: "Ekspor Bulanan",
          url: "#",
        },
      ],
    },
    {
      title: "Insight",
      icon: IconReportAnalytics,
      url: "/dashboard#reports",
      items: [
        {
          title: "Grafik Tren",
          url: "/dashboard#reports",
        },
        {
          title: "Riwayat PDF",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Pengaturan",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Pusat Bantuan",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Pencarian",
      url: "#",
      icon: IconSearch,
    },
    {
      title: "Tips Finansial",
      url: "#",
      icon: IconNews,
    },
  ],
  documents: [
    {
      name: "Panduan Budget",
      url: "#",
      icon: IconTargetArrow,
    },
    {
      name: "Template CSV",
      url: "#",
      icon: IconFileDollar,
    },
    {
      name: "Laporan Pajak",
      url: "#",
      icon: IconReportAnalytics,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image src="/codeguide-logo.png" alt="CodeGuide" width={32} height={32} className="rounded-lg" />
                <span className="text-base font-semibold font-parkinsans">CodeGuide</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavDocuments items={staticData.documents} />
        <NavSecondary items={staticData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
