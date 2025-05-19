"use client";

import { useState, useEffect } from "react";
import { Link } from "@prisma/client";
import { useNavigation } from "../context/NavigationContext";
import {
  Plus,
  X,
  Lock,
  ExternalLink,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";

const LinkEditor = () => {
  const { shop } = useNavigation();
  const [links, setLinks] = useState<Link[]>([]);
  const [newLink, setNewLink] = useState({
    url: "",
    paid: false,
    price: 0,
  });
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  useEffect(() => {
    if (shop) {
      fetchLinks();
    }
  }, [shop]);

  const fetchLinks = async () => {
    if (!shop) return;
    try {
      const response = await fetch(`/api/v1/shops/${shop.id}/links`);
      const { data } = await response.json();
      setLinks(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des liens:", error);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    try {
      const response = await fetch(`/api/v1/shops/${shop.id}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLink),
      });

      if (!response.ok) {
        throw new Error("Failed to create link");
      }

      const { data } = await response.json();
      setLinks((prev) => [...prev, data]);
      setNewLink({ url: "", paid: false, price: 0 });
      setIsAddingLink(false);
    } catch (error) {
      console.error("Error creating link:", error);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!shop) return;

    try {
      const response = await fetch(`/api/v1/shops/${shop.id}/links/${linkId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      setLinks((prev) => prev.filter((link) => link.id !== linkId));
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  const handleUpdateLink = async (linkId: string, updates: Partial<Link>) => {
    if (!shop) return;

    try {
      const response = await fetch(`/api/v1/shops/${shop.id}/links/${linkId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update link");
      }

      const { data } = await response.json();
      setLinks((prev) =>
        prev.map((link) => (link.id === linkId ? data : link))
      );
      setEditingLinkId(null);
    } catch (error) {
      console.error("Error updating link:", error);
    }
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Liens</h2>
          <button
            onClick={() => setIsAddingLink(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau lien
          </button>
        </div>

        {/* Formulaire d'ajout de lien */}
        {isAddingLink && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <form onSubmit={handleAddLink} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="url"
                    className="block text-sm font-medium text-gray-700"
                  >
                    URL du lien
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      id="url"
                      value={newLink.url}
                      onChange={(e) =>
                        setNewLink((prev) => ({ ...prev, url: e.target.value }))
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newLink.paid}
                      onChange={(e) =>
                        setNewLink((prev) => ({
                          ...prev,
                          paid: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Lien payant
                    </span>
                  </label>

                  {newLink.paid && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={newLink.price}
                        onChange={(e) =>
                          setNewLink((prev) => ({
                            ...prev,
                            price: parseInt(e.target.value),
                          }))
                        }
                        min="0"
                        className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                      <span className="text-sm font-medium text-gray-700">
                        €
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingLink(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Ajouter le lien
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des liens */}
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {link.paid && (
                      <div className="flex items-center gap-1 text-indigo-600">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {link.price}€
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      {editingLinkId === link.id ? (
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) =>
                            handleUpdateLink(link.id, { url: e.target.value })
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          onBlur={() => setEditingLinkId(null)}
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 font-medium truncate"
                          >
                            {link.url}
                          </a>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={link.paid}
                        onChange={(e) =>
                          handleUpdateLink(link.id, { paid: e.target.checked })
                        }
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-600">Payant</span>
                    </label>

                    <button
                      onClick={() => setEditingLinkId(link.id)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {links.length === 0 && !isAddingLink && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Plus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucun lien
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter votre premier lien.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setIsAddingLink(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter un lien
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkEditor;
