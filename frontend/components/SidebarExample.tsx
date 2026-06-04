// Simple usage example - just copy and paste!

import { AppSidebar } from "@/components/Sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function SimplePage() {
  return (
    <SidebarProvider>
      {/* Use default CRM menu */}
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1>My Page</h1>
        </header>

        <main className="p-4">
          {/* Your content here */}
          <h1>Hello World</h1>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
