"use client";
import { NavigationProvider } from "./context/NavigationContext";
import { useSession } from "next-auth/react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import DashboardContent from "./components/DashboardContent";
import DashboardHeader from "./components/DashboardHeader";

const DashboardPage = () => {
  const { data: session } = useSession();
  return (
    <NavigationProvider user={session?.user}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex-1 p-4">
            <DashboardContent />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </NavigationProvider>
  );
};

export default DashboardPage;
