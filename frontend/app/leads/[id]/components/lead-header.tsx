import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Lead } from "@/types/lead";
import { ArrowLeft, Edit, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface LeadHeaderProps {
  lead: Lead;
  onEditClick?: () => void;
  onConvertClick?: () => void;
}

export function LeadHeader({
  lead,
  onEditClick,
  onConvertClick,
}: LeadHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 md:px-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 md:mr-2 h-4" />
      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="size-8 hidden sm:inline-flex"
          >
            <ArrowLeft />
          </Button>
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <Avatar className="h-8 w-8 md:h-10 md:w-10 border shrink-0">
              <AvatarFallback className="bg-linear-to-br from-primary/80 to-primary text-primary-foreground font-semibold text-sm md:text-base">
                {lead.customer.firstName.charAt(0).toUpperCase() +
                  lead.customer?.lastName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm md:text-base font-semibold leading-none mb-1 truncate">
                {lead.customer.firstName} {lead.customer.lastName}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {lead.customer.organization?.name || "-"}
              </p>
            </div>
          </div>
          <Badge variant="outline" colorHex={lead.status?.color}>
            <span className="hidden md:inline">{lead.status?.name}</span>
            <span className="md:hidden">{lead?.status?.name}</span>
          </Badge>
        </div>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={onEditClick}
          >
            Edit Lead
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden size-8"
            onClick={onEditClick}
          >
            <Edit className="size-4" />
          </Button>
          <Button
            size="sm"
            className="hidden md:flex"
            onClick={onConvertClick}
            disabled={lead.converted}
          >
            Convert to Deal
          </Button>
          <Button
            size="icon"
            className="md:hidden size-8"
            onClick={onConvertClick}
            disabled={lead.converted}
          >
            <TrendingUp className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
