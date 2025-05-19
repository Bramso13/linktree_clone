import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, GalleryVerticalEnd } from "lucide-react";
import { useNavigation } from "../context/NavigationContext";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { toSlug } from "@/lib/utils";

import { Shop } from "@prisma/client";
import { headers } from "next/headers";
const ShopChooser = () => {
  const { shop, setShop } = useNavigation();
  const router = useRouter();

  const [shops, setShops] = useState<Shop[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchShops = async () => {
      const response = await fetch("/api/v1/shops", {
        method: "GET",
      });
      const data = await response.json();
      setShops(data.data.shops);
      if (data.data.shops.length > 0) {
        setShop(data.data.shops[0]);
      }
    };
    fetchShops();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Shop</span>
            <span className="text-xs text-muted-foreground">{shop?.name}</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width]"
        align="start"
      >
        {shops.map((shop) => (
          <DropdownMenuItem
            key={shop.id}
            onClick={() => {
              setShop(shop);
            }}
          >
            {shop.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <Drawer>
          <DrawerTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Créer un nouveau shop
            </DropdownMenuItem>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Créer un nouveau shop</DrawerTitle>
              <DrawerDescription>
                Ajoutez un nouveau shop à votre compte
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const response = await fetch("/api/v1/shops", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        name,
                        pathName: toSlug(name),
                        description,
                      }),
                    });

                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error.message);
                    }

                    const data = await response.json();
                    window.location.reload();
                    // Réinitialiser le formulaire
                    setName("");
                    setDescription("");
                  } catch (error) {
                    console.error("Erreur lors de la création du shop:", error);
                    toast({
                      title: "Erreur",
                      description:
                        error instanceof Error
                          ? error.message
                          : "Une erreur est survenue",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du shop</Label>
                  <Input
                    id="name"
                    placeholder="Mon super shop"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pathname">Chemin d'accès</Label>
                  <Input
                    id="pathname"
                    placeholder="mon-super-shop"
                    value={toSlug(name)}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description de votre shop"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Créer le shop
                </Button>
              </form>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Annuler</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShopChooser;
