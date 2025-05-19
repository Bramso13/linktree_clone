"use client";

import { useState, useEffect } from "react";
import { Link } from "@prisma/client";

interface TextComponentProps {
  initialData?: {
    text: string;
    fontSize: string;
    fontWeight: string;
    color: string;
    alignment: "left" | "center" | "right";
    linkId?: string;
  };
  onUpdate: (data: any) => void;
  shopId: string;
}

const TextComponent = ({
  initialData,
  onUpdate,
  shopId,
}: TextComponentProps) => {
  const [data, setData] = useState(
    initialData || {
      text: "Votre texte ici",
      fontSize: "16px",
      fontWeight: "normal",
      color: "#000000",
      alignment: "left" as const,
      linkId: undefined,
    }
  );
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch(`/api/v1/shops/${shopId}/links`);
        const { data } = await response.json();
        setLinks(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des liens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [shopId]);

  const handleChange = (field: string, value: string) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate(newData);
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Texte</label>
        <textarea
          value={data.text}
          onChange={(e) => handleChange("text", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Taille de police
          </label>
          <input
            type="text"
            value={data.fontSize}
            onChange={(e) => handleChange("fontSize", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Épaisseur
          </label>
          <select
            value={data.fontWeight}
            onChange={(e) => handleChange("fontWeight", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="normal">Normal</option>
            <option value="bold">Gras</option>
            <option value="lighter">Fin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Couleur
          </label>
          <input
            type="color"
            value={data.color}
            onChange={(e) => handleChange("color", e.target.value)}
            className="mt-1 block w-full h-10 rounded-md border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Alignement
          </label>
          <select
            value={data.alignment}
            onChange={(e) => handleChange("alignment", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Lien associé
          </label>
          <select
            value={data.linkId || ""}
            onChange={(e) => handleChange("linkId", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isLoading}
          >
            <option value="null">Aucun lien</option>
            {links.map((link) => (
              <option key={link.id} value={link.id}>
                {link.url} {link.paid ? `(${link.price}€)` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="mt-4 p-4 border rounded"
        style={{
          fontSize: data.fontSize,
          fontWeight: data.fontWeight,
          color: data.color,
          textAlign: data.alignment,
        }}
      >
        {data.text}
      </div>
    </div>
  );
};

export default TextComponent;
