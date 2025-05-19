import { useNavigation } from "@/app/dashboard/context/NavigationContext";
import ShopEditor from "./ShopEditor";
import { Shop } from "@prisma/client";
import LinkEditor from "./LinkEditor";

const DashboardContent = () => {
  const { currentSection, shop } = useNavigation();

  const handleSave = async (shopData: Partial<Shop>) => {
    try {
      if (shop) {
        const response = await fetch(`/api/v1/shops/${shop.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shopData),
        });
        if (!response.ok) {
          throw new Error("Failed to save shop");
        }
        const data = await response.json();
        console.log("Shop saved successfully:", data);
      } else {
        console.error("Shop not found");
      }
    } catch (error) {
      console.error("Error saving shop:", error);
    }
  };

  switch (currentSection) {
    case "edition":
      return <ShopEditor onSave={handleSave} />;
    case "links":
      return <LinkEditor />;
    default:
      return <div>Dashboard</div>;
  }
};

export default DashboardContent;
