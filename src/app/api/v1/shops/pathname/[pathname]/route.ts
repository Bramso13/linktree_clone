import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ pathname: string }> }) {
  const params = await props.params;
  try {
    const shop = await prisma.shop.findUnique({
      where: {
        pathName: params.pathname,
      },
      include: {
        styleComponents: true,
      },
    });

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Boutique non trouvée" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Erreur lors de la récupération de la boutique:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}
