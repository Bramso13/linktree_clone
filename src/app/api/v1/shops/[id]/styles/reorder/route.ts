import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request, props: { params: Promise<{ shopId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { components } = await request.json();

    // Vérifier que la boutique appartient à l'utilisateur
    const shop = await prisma.shop.findFirst({
      where: {
        id: params.shopId,
        userId: session.user.id,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Boutique non trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour l'ordre de chaque composant
    const updatePromises = components.map(
      ({ id, order }: { id: string; order: number }) =>
        prisma.styleComponent.update({
          where: { id },
          data: { order },
        })
    );

    await Promise.all(updatePromises);

    // Récupérer les composants mis à jour
    const updatedComponents = await prisma.styleComponent.findMany({
      where: {
        shopId: params.shopId,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      message: "Ordre mis à jour avec succès",
      data: updatedComponents,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'ordre" },
      { status: 500 }
    );
  }
}
