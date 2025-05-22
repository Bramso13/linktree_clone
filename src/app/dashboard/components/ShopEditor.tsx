"use client";

import { useState, useEffect } from "react";
import { Shop, StyleComponent, Prisma } from "@prisma/client";
import { useNavigation } from "../context/NavigationContext";
import { Plus, X } from "lucide-react";
import TextComponent from "./style-components/TextComponent";

type ShopWithComponents = Shop & {
  styleComponents: StyleComponent[];
};

const ShopEditor = () => {
  const { shop } = useNavigation();

  const [styleComponents, setStyleComponents] = useState<StyleComponent[]>([]);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] =
    useState<StyleComponent | null>(null);

  useEffect(() => {
    if (selectedComponent) {
      //console.log(selectedComponent, "selectedComponent");
    }
  }, [selectedComponent]);

  useEffect(() => {
    if (shop) {
      const shopWithComponents = shop as ShopWithComponents;

      // Récupération des styleComponents si ils n'existent pas déjà
      if (!shopWithComponents.styleComponents) {
        fetch(`/api/v1/shops/${shop.id}/styles`)
          .then((response) => response.json())
          .then(({ data }) => {
            setStyleComponents(data.styles);
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la récupération des composants de style:",
              error
            );
            setStyleComponents([]);
          });
      } else {
        // Trier les composants par ordre
        const sortedComponents = shopWithComponents.styleComponents.sort(
          (a, b) => a.order - b.order
        );
        setStyleComponents(sortedComponents);
      }
    }
  }, [shop]);

  const addComponent = async (type: string) => {
    let details: any = {};
    switch (type) {
      case "text":
        details = {
          text: "Votre texte ici",
          fontSize: "16px",
          fontWeight: "normal",
          color: "#000000",
          alignment: "left",
        };
        break;
      default:
        return;
    }

    if (!details) return;
    console.log(details);

    if (!shop) return;

    const newComponent: Partial<StyleComponent> = {
      id: crypto.randomUUID(),
      name: type,
      description: "",
      details: details,
      order: styleComponents.length ? styleComponents.length : 0,
      shopId: shop.id,
    };

    try {
      const response = await fetch(`/api/v1/shops/${shop.id}/styles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newComponent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating style component:", errorData);
        throw new Error("Failed to create style component");
      }

      const { data } = await response.json();
      setStyleComponents((prev) => {
        if (styleComponents.length > 0) {
          return [...prev, data];
        }
        return [data];
      });
      setEditingComponent(data.id);
      setSelectedComponent(data);
    } catch (error) {
      console.error("Error creating style component:", error);
    }
  };

  const updateComponent = async (id: string, data: any) => {
    if (!shop) return;

    try {
      const response = await fetch(`/api/v1/shops/${shop.id}/styles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          details: data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update style component");
      }

      const { data: updatedComponent } = await response.json();
      setStyleComponents((prev) =>
        prev.map((comp) => (comp.id === id ? updatedComponent : comp))
      );
    } catch (error) {
      console.error("Error updating style component:", error);
    }
  };

  const removeComponent = async (id: string) => {
    if (!shop) return;

    try {
      const response = await fetch(`/api/v1/shops/${shop.id}/styles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete style component");
      }

      setStyleComponents((prev) => prev.filter((comp) => comp.id !== id));
      if (editingComponent === id) {
        setEditingComponent(null);
        setSelectedComponent(null);
      }
    } catch (error) {
      console.error("Error deleting style component:", error);
    }
  };

  const toggleComponentEdit = (id: string) => {
    console.log(id, "id");
    setEditingComponent(editingComponent === id ? null : id);
    setSelectedComponent(
      styleComponents.find((comp) => comp.id === id) || null
    );
  };

  // Fonction pour mettre à jour l'ordre des composants
  const updateComponentsOrder = async (newOrder: StyleComponent[]) => {
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

      setStyleComponents(newOrder);
    } catch (error) {
      console.error("Error updating components order:", error);
    }
  };

  const editionComponent = (component: StyleComponent) => {
    console.log(component, "component");
    if (component) {
      return (
        <div className="sticky top-6 bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium">
              {component.name === "text" ? "Éditer le texte" : component.name}
            </h4>
            <button
              type="button"
              onClick={() => {
                setEditingComponent(null);
                setSelectedComponent(null);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {component.name === "text" && (
            <TextComponent
              initialData={component.details as any}
              onUpdate={(data) => updateComponent(component.id, data)}
              shopId={shop?.id || ""}
            />
          )}
        </div>
      );
    }
  };

  // Fonction pour déplacer un composant vers le haut
  const moveComponentUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...styleComponents];
    [newOrder[index], newOrder[index - 1]] = [
      newOrder[index - 1],
      newOrder[index],
    ];
    updateComponentsOrder(newOrder);
  };

  // Fonction pour déplacer un composant vers le bas
  const moveComponentDown = (index: number) => {
    if (index === styleComponents.length - 1) return;
    const newOrder = [...styleComponents];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    updateComponentsOrder(newOrder);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <form className="space-y-8">
        <div className="border-t pt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Contenu de la boutique</h3>
            <button
              type="button"
              onClick={() => addComponent("text")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5" />
              Ajouter un texte
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              {styleComponents &&
                styleComponents.length > 0 &&
                styleComponents.map((component, index) => (
                  <div
                    key={component.id}
                    className={`relative group ${
                      editingComponent === component.id
                        ? "ring-2 ring-indigo-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveComponentUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${
                          index === 0
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveComponentDown(index)}
                        disabled={index === styleComponents.length - 1}
                        className={`p-1 rounded ${
                          index === styleComponents.length - 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        ↓
                      </button>
                    </div>

                    {component.name === "text" && (
                      <div
                        className="p-4 rounded-lg border hover:border-indigo-500 cursor-pointer"
                        onClick={() => toggleComponentEdit(component.id)}
                      >
                        <div
                          style={{
                            fontSize:
                              (component.details as any)?.fontSize || "16px",
                            fontWeight:
                              (component.details as any)?.fontWeight ||
                              "normal",
                            color:
                              (component.details as any)?.color || "#000000",
                            textAlign:
                              (component.details as any)?.alignment || "left",
                          }}
                        >
                          {(component.details as any)?.text ||
                            "Cliquez pour éditer"}
                        </div>
                      </div>
                    )}

                    {editingComponent === component.id && (
                      <div className="absolute top-0 right-0 mt-2 mr-2">
                        <button
                          type="button"
                          onClick={() => removeComponent(component.id)}
                          className="p-2 text-red-500 hover:text-red-700 bg-white rounded-full shadow"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div className="col-span-1">
              {editingComponent && selectedComponent ? (
                editionComponent(selectedComponent)
              ) : (
                <div className="text-center text-gray-500 p-4">
                  Sélectionnez un composant pour l'éditer
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShopEditor;
