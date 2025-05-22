"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Link, Shop, StyleComponent } from "@prisma/client";

type ShopWithComponents = Shop & {
  styleComponents: StyleComponent[];
};

interface ShopContextType {
  shop: ShopWithComponents | null;
  setShop: (shop: ShopWithComponents | null) => void;
  styleComponents: StyleComponent[];
  setStyleComponents: (components: StyleComponent[]) => void;
  updateComponentOrder: (newOrder: StyleComponent[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  links: Link[];
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({
  children,
  shopPathname,
}: {
  children: ReactNode;
  shopPathname: string;
}) {
  const [shop, setShop] = useState<ShopWithComponents | null>(null);
  const [styleComponents, setStyleComponents] = useState<StyleComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<Link[]>([]);

  const getLinks = async () => {
    if (!shop) return;
    const link = await fetch(`/api/v1/shops/${shop.id}/links`);
    const data = await link.json();
    setLinks(data.data);
  };

  useEffect(() => {
    getLinks();
  }, [shop]);

  const getShop = async (shopPathname: string) => {
    const shop = await fetch(`/api/v1/shops/pathname/${shopPathname}`);
    const data = await shop.json();
    setShop(data);
  };

  useEffect(() => {
    if (shop) {
      // Trier les composants par ordre lors du chargement
      const sortedComponents = [...shop.styleComponents].sort(
        (a, b) => a.order - b.order
      );
      setStyleComponents(sortedComponents);
    }
  }, [shop]);

  useEffect(() => {
    if (shopPathname) {
      getShop(shopPathname);
      setIsLoading(false);
    }
  }, [shopPathname]);

  const updateComponentOrder = async (newOrder: StyleComponent[]) => {
    if (!shop) return;

    try {
      const response = await fetch(`/api/v1/shops/${shop.id}/styles/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          components: newOrder.map((comp, index) => ({
            id: comp.id,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update components order");
      }

      const { data } = await response.json();
      setStyleComponents(data);

      // Mettre à jour le shop avec les nouveaux composants
      setShop((prev) =>
        prev
          ? {
              ...prev,
              styleComponents: data,
            }
          : null
      );
    } catch (error) {
      console.error("Error updating components order:", error);
      setError("Erreur lors de la mise à jour de l'ordre des composants");
    }
  };

  const value = {
    shop,
    setShop,
    styleComponents,
    setStyleComponents,
    updateComponentOrder,
    isLoading,
    error,
    shopPathname,
    links,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
