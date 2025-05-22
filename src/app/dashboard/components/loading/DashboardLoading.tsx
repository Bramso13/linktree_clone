"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardLoading = () => {
  return (
    <div className="space-y-8 p-8">
      {/* En-tête avec statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </Card>
        ))}
      </div>

      {/* Graphique */}
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <div className="h-[300px] w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </Card>

      {/* Liste des liens */}
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-[100px]" />
                  <Skeleton className="h-8 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tableau des statistiques */}
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardLoading;
