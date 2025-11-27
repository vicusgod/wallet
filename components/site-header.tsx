import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

const monthLabel = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
}).format(new Date())

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1 rounded-full border bg-card text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mx-2 hidden sm:block data-[orientation=vertical]:h-5" />
        <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10 text-xs font-medium text-primary px-3 py-1 shadow-sm">
          Periode {monthLabel}
        </Badge>
      </div>
    </header>
  )
}
