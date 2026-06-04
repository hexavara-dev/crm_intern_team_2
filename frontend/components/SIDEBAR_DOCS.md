# Sidebar Component Documentation

## Overview

A fully responsive and customizable sidebar component for CRM applications built with Next.js, TypeScript, and shadcn/ui.

## Quick Start

```tsx
import { AppSidebar } from "@/components/Sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header>
          <SidebarTrigger />
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

## Features

✅ Fully responsive (mobile & desktop)
✅ Customizable menu sections  
✅ Badge support for notifications
✅ Built-in search functionality
✅ User profile dropdown
✅ Multiple variants (sidebar, floating, inset)
✅ Collapsible modes (offcanvas, icon, none)
✅ TypeScript support
✅ shadcn/ui components

## Props

See `app/page.tsx` for a complete example with all available props.

### Main Props

- `menuSections` - Array of menu sections with items
- `user` - User information (name, email, avatar)
- `logoText` - Text to display in logo area
- `enableSearch` - Enable/disable search
- `onSearch` - Callback for search
- `onLogout` - Callback for logout
- `variant` - Sidebar variant: "sidebar" | "floating" | "inset"
- `collapsible` - Collapse mode: "offcanvas" | "icon" | "none"

## Customization

### Menu Sections

```tsx
const menuSections: MenuSection[] = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
        isActive: true,
        badge: 5,
      },
    ],
  },
];
```

### User Info

```tsx
<AppSidebar
  user={{
    name: "John Doe",
    email: "john@company.com",
  }}
/>
```

### Callbacks

```tsx
<AppSidebar
  onSearch={(query) => console.log(query)}
  onLogout={() => console.log("Logout")}
/>
```

## Keyboard Shortcuts

- `Cmd/Ctrl + B` - Toggle sidebar

## Responsive Behavior

- **Mobile** (< 768px): Sidebar slides in as overlay
- **Desktop** (≥ 768px): Sidebar is visible and collapsible
