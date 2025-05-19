"use client";
import { useShop } from "../../context/ShopContext";
import { StyleComponent, Link } from "@prisma/client";
import { useState, useEffect } from "react";

const ShopViewer = () => {
  const { shop, isLoading, error, links } = useShop();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!shop) return <div>Boutique non trouvée</div>;

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
            }}
          >
            <a
              href={
                links.length > 0
                  ? links.find(
                      (link) => link.id === (component.details as any)?.linkId
                    )?.url
                  : ""
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {(component.details as any)?.text}
            </a>
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
