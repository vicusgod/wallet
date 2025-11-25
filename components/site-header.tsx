import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

const monthLabel = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
}).format(new Date())

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-col">
          <span className="text-base font-semibold">DompetKu Dashboard</span>
          <Badge variant="outline" className="mt-1 w-fit text-xs font-normal">
            Periode {monthLabel}
          </Badge>
        </div>
      </div>
    </header>
  )
}
