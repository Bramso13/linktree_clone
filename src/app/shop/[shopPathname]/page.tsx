"use server";
import prisma from "@/lib/prisma";
import { ShopProvider } from "../context/ShopContext";
import ShopViewer from "./components/ShopViewer";
const generateMetadata = async ({
  params,
}: {
  params: { shopPathname: string };
}) => {
  const shop = await prisma.shop.findUnique({
    where: { pathName: params.shopPathname },
  });

  return {
    title: shop?.name,
    description: shop?.description,
  };
};

export default async function ShopPage({
  params,
}: {
  params: { shopPathname: string };
}) {
  return (
    <ShopProvider shopPathname={params.shopPathname}>
      <ShopViewer />
    </ShopProvider>
  );
}
