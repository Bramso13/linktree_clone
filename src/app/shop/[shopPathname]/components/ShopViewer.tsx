"use client";
import { useShop } from "../../context/ShopContext";
import { StyleComponent, Link } from "@prisma/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ShopViewer = () => {
  const { shop, isLoading, error, links } = useShop();
  const router = useRouter();

  useEffect(() => {
    // Enregistrer une vue pour la boutique au chargement
    if (shop) {
      fetch("/api/v1/views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopId: shop.id,
          type: "page_view",
        }),
      }).catch((error) => {
        console.error("Erreur lors de l'enregistrement de la vue:", error);
      });
    }
  }, [shop]);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!shop) return <div>Chargement...</div>;

  const handleLinkClick = async (component: StyleComponent) => {
    console.log(links);
    if (links && links.length > 0) {
      const linkId = (component.details as any)?.linkId;
      if (!linkId) return;

      const link = links.find((l) => l.id === linkId);
      if (!link) return;

      // Enregistrer une vue pour le lien
      try {
        await fetch("/api/v1/views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            linkId: link.id,
            shopId: shop.id,
            type: "link_click",
          }),
        });
      } catch (error) {
        console.error(
          "Erreur lors de l'enregistrement de la vue du lien:",
          error
        );
      }

      if (link.paid) {
        router.push(`/shop/${shop.pathName}/payment/${link.id}`);
      } else {
        window.open(link.url, "_blank", "noopener,noreferrer");
      }
    }
  };

  const renderStyleComponent = (component: StyleComponent) => {
    switch (component.name) {
      case "text":
        return (
          <div
            key={component.id}
            className="p-4 rounded-lg"
            style={{
              fontSize: (component.details as any)?.fontSize || "16px",
              fontWeight: (component.details as any)?.fontWeight || "normal",
              color: (component.details as any)?.color || "#000000",
              textAlign: (component.details as any)?.alignment || "left",
              cursor: "pointer",
            }}
            onClick={() => handleLinkClick(component)}
          >
            {(component.details as any)?.text}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenu de la boutique */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {shop.styleComponents
              .sort((a, b) => a.order - b.order)
              .map((component) => renderStyleComponent(component))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopViewer;
