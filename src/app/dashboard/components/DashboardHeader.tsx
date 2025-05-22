"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigation } from "../context/NavigationContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EyeIcon, Share2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const DashboardHeader = () => {
  const { currentSection, shop } = useNavigation();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/shop/${shop?.pathName}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shop?.name,
          text: `Découvrez ma boutique ${shop?.name}`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Lien copié dans le presse-papier");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      toast.error("Erreur lors du partage");
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentSection}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleShare}>
            {copied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Copié !
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Partager
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/shop/${shop?.pathName}`}>
              <EyeIcon className="mr-2 h-4 w-4" />
              Voir le shop
            </Link>
          </Button>
        </div>
      </div>
      <Separator />
    </div>
  );
};

export default DashboardHeader;
