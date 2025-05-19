"use client";
import { NavigationProvider } from "./context/NavigationContext";
import { useSession } from "next-auth/react";
import { NewSidebar } from "./components/new-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import DashboardContent from "./components/DashboardContent";
const DashboardPage = () => {
  const { data: session } = useSession();
  return (
    <NavigationProvider user={session?.user}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardContent />
        </SidebarInset>
      </SidebarProvider>
    </NavigationProvider>
  );
};

export default DashboardPage;
