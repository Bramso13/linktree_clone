"use client";

import { useState, useEffect } from "react";
import { useNavigation } from "../context/NavigationContext";
import { Shop } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { toSlug } from "@/lib/utils";

const InformationsShopEditor = () => {
  const { shop, setShop } = useNavigation();
  const [formData, setFormData] = useState({
    name: "",
    pathName: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || "",
        pathName: shop.pathName || "",
        description: shop.description || "",
      });
    }
  }, [shop]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        pathName: toSlug(value),
      }));
    }
    setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");

    try {
      if (shop) {
        const response = await fetch(`/api/v1/shops/${shop.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Échec de la mise à jour");
        }

        const data = await response.json();
        setShop(data.data);
        setStatus("success");
        toast.success("Boutique mise à jour avec succès");
      } else {
        throw new Error("Boutique non trouvée");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setStatus("error");
      toast.error("Erreur lors de la mise à jour de la boutique");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Nom de la boutique
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Entrez le nom de votre boutique"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="pathName"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Chemin d'accès
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                binkbree.com/shop/
              </span>
              <Input
                type="text"
                id="pathName"
                name="pathName"
                value={formData.pathName}
                placeholder="votre-chemin"
                className="flex-1"
                required
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez votre boutique en quelques mots..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              {status === "success" && (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">Enregistré</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Erreur</span>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default InformationsShopEditor;
