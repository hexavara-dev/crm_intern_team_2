// /**
//  * Sidebar Usage Examples
//  *
//  * Copy any of these examples to get started quickly!
//  */

// // ============================================
// // Example 1: Basic Usage (Minimal)
// // ============================================
// import { AppSidebar } from "@/components/Sidebar";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";

// export function BasicExample() {
//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset>
//         <header className="flex h-16 items-center gap-2 border-b px-4">
//           <SidebarTrigger />
//         </header>
//         <main className="p-4">Your content</main>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

// import type { MenuSection } from "@/components/Sidebar";
// // ============================================
// // Example 2: Custom Menu
// // ============================================
// import { Home, Settings, Users } from "lucide-react";

// export function CustomMenuExample() {
//   const myMenu: MenuSection[] = [
//     {
//       label: "My App",
//       items: [
//         { title: "Home", url: "/", icon: Home, isActive: true },
//         { title: "Users", url: "/users", icon: Users, badge: 3 },
//         { title: "Settings", url: "/settings", icon: Settings },
//       ],
//     },
//   ];

//   return (
//     <SidebarProvider>
//       <AppSidebar menuSections={myMenu} logoText="My App" />
//       <SidebarInset>
//         <main className="p-4">Your content</main>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

// // ============================================
// // Example 3: With Search & Callbacks
// // ============================================
// export function FullFeaturedExample() {
//   return (
//     <SidebarProvider>
//       <AppSidebar
//         user={{ name: "Jane Doe", email: "jane@example.com" }}
//         enableSearch
//         searchPlaceholder="Search..."
//       />
//       <SidebarInset>
//         <main className="p-4">Your content</main>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

// // ============================================
// // Example 4: Floating Sidebar
// // ============================================
// export function FloatingExample() {
//   return (
//     <SidebarProvider>
//       <AppSidebar variant="floating" />
//       <SidebarInset>
//         <main className="p-4">Your content</main>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

// // ============================================
// // Example 5: Right Side Sidebar
// // ============================================
// export function RightSideExample() {
//   return (
//     <SidebarProvider>
//       <SidebarInset>
//         <main className="p-4">Your content</main>
//       </SidebarInset>
//       <AppSidebar side="right" />
//     </SidebarProvider>
//   );
// }

// // ============================================
// // Example 6: Icon Collapse Mode
// // ============================================
// export function IconCollapseExample() {
//   return (
//     <SidebarProvider>
//       <AppSidebar collapsible="icon" />
//       <SidebarInset>
//         <main className="p-4">Your content</main>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

// // ============================================
// // Example 7: Custom Width
// // ============================================
// export function CustomWidthExample() {
//   return (
//     <SidebarProvider
//       style={
//         {
//           "--sidebar-width": "20rem",
//           "--sidebar-width-mobile": "20rem",
//         } as React.CSSProperties
//       }
//     >
//       <AppSidebar />
//       <SidebarInset>
//         <main className="p-4">Your content</main>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }
