import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convertit une chaîne de caractères en slug
 * @param str La chaîne à convertir
 * @returns Le slug généré
 * @example
 * toSlug("Mon Super Shop") // "mon-super-shop"
 * toSlug("Hello World!") // "hello-world"
 */
export function toSlug(str: string): string {
  return str
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
