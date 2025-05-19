"use client";

import * as React from "react";

import { useNavigation } from "@/app/dashboard/context/NavigationContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, CircleDollarSign } from "lucide-react";
import ShopChooser from "./ShopChooser";
interface NewSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSectionChange?: (section: string, subsection: string | null) => void;
  onChangePublish?: (checked: boolean) => void;
}

export function NewSidebar({
  onSectionChange,

  ...props
}: NewSidebarProps) {
  const {
    currentSection,
    currentSubsection,
    setCurrentSection,
    setCurrentSubsection,
    user,

    sections,
  } = useNavigation();

  const handleSectionClick = (sectionId: string) => {
    setCurrentSection(sectionId);
    if (onSectionChange) {
      onSectionChange(sectionId, null);
    }
  };

  const handleSubsectionClick = (sectionId: string, subsectionId: string) => {
    setCurrentSection(sectionId);
    setCurrentSubsection(subsectionId);
    if (onSectionChange) {
      onSectionChange(sectionId, subsectionId);
    }
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <ShopChooser />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gérer son shop</SidebarGroupLabel>
          <SidebarMenu>
            {sections &&
              sections.map((item) =>
                item.subsections ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={currentSection === item.id}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subsections &&
                            item.subsections.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  onClick={() =>
                                    handleSubsectionClick(item.id, subItem.id)
                                  }
                                  isActive={
                                    currentSection === item.id &&
                                    currentSubsection === subItem.id
                                  }
                                >
                                  {subItem.title}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleSectionClick(item.id)}
                      isActive={currentSection === item.id}
                      tooltip={item.title}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Paramètres</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleSectionClick("billing")}
                isActive={currentSection === "billing"}
                tooltip="Facturation"
              >
                <CircleDollarSign className="h-5 w-5" />
                <span>Facturation</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
