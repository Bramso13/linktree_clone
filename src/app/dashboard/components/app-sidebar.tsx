"use client";

import * as React from "react";
import { NewSidebar } from "./new-sidebar";

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof NewSidebar>) {
  const handleSectionChange = (section: string, subsection: string | null) => {
    // Ici, vous pouvez ajouter la logique spécifique à exécuter lors du changement de section
    console.log("Section changed:", section, subsection);
  };

  return <NewSidebar onSectionChange={handleSectionChange} {...props} />;
}
