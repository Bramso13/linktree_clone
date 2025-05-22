import { useNavigation } from "@/app/dashboard/context/NavigationContext";
import ShopEditor from "./ShopEditor";
import { Shop } from "@prisma/client";
import LinkEditor from "./LinkEditor";
import Analytics from "./Analytics";
import Billing from "./Billing";
import DashboardLoading from "./loading/DashboardLoading";
import InformationsShopEditor from "./InformationsShopEditor";
const DashboardContent = () => {
  const { currentSection, shop } = useNavigation();

  if (!shop) {
    return <DashboardLoading />;
  }

  switch (currentSection) {
    case "informations":
      return <InformationsShopEditor />;
    case "edition":
      return <ShopEditor />;
    case "links":
      return <LinkEditor />;
    case "analytics":
      if (shop) {
        return <Analytics shop={shop} />;
      }
    case "billing":
      return <Billing />;
    default:
      return <div>Dashboard</div>;
  }
};

export default DashboardContent;
