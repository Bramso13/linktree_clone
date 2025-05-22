"use client";

import {
  BarChart,
  CircleDollarSign,
  Edit,
  ShoppingCart,
  Package,
  Layers,
  Heart,
  Star,
  Users,
  Table,
  Link,
  Info,
} from "lucide-react";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Shop } from "@prisma/client";
type Section = {
  id: string;
  title: string;
  icon?: ReactNode;
  subsections?: Section[];
};

type NavigationContextType = {
  currentSection: string;
  currentSubsection: string | null;
  setCurrentSection: (section: string) => void;
  setCurrentSubsection: (subsection: string | null) => void;
  sections: Section[];

  user: any;
  shop: Shop | null;
  setShop: (shop: Shop | null) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

const STORAGE_KEY = "navigation_state";

const navigationSections = [
  {
    id: "informations",
    title: "Informations",
    icon: <Info className="h-5 w-5" />,
  },
  {
    id: "edition",
    title: "Édition",
    icon: <Edit className="h-5 w-5" />,
  },
  {
    id: "analytics",
    title: "Analytiques",
    icon: <BarChart className="h-5 w-5" />,
  },
  {
    id: "links",
    title: "Liens",
    icon: <Link className="h-5 w-5" />,
  },
];

export function NavigationProvider({
  children,

  user,
}: {
  children: ReactNode;

  user: any;
}) {
  const [currentSection, setCurrentSection] = useState<string>("edition");
  const [currentSubsection, setCurrentSubsection] = useState<string | null>(
    null
  );
  const [shop, setShop] = useState<Shop | null>(null);
  // Charger l'état initial depuis le localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const { section, subsection } = JSON.parse(savedState);
      setCurrentSection(section);
      setCurrentSubsection(subsection);
    } else if (navigationSections.length > 0) {
      // Si pas d'état sauvegardé, utiliser la première section
      setCurrentSection(navigationSections[0].id);
    }
  }, []);

  // Sauvegarder l'état dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        section: currentSection,
        subsection: currentSubsection,
      })
    );
    console.log("section, subsection", currentSection, currentSubsection);
  }, [currentSection, currentSubsection]);

  const handleSetCurrentSection = (section: string) => {
    setCurrentSection(section);
    setCurrentSubsection(null); // Réinitialiser la sous-section lors du changement de section
  };

  const value = {
    currentSection,
    currentSubsection,
    setCurrentSection: handleSetCurrentSection,
    setCurrentSubsection,
    sections: navigationSections,
    user,
    shop,
    setShop,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error(
      "useNavigation doit être utilisé à l'intérieur d'un NavigationProvider"
    );
  }
  return context;
}
