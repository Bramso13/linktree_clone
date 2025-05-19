import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/v1/shops/[id]/links/[linkId]
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; linkId: string }> }
) {
  const { id, linkId } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que la boutique appartient à l'utilisateur
    const shop = await prisma.shop.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Boutique non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer le lien spécifique
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        shopId: id,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Lien récupéré avec succès",
      data: link,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du lien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du lien" },
      { status: 500 }
    );
  }
}

// PUT /api/v1/shops/[shopId]/links/[linkId]
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string; linkId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que la boutique appartient à l'utilisateur
    const shop = await prisma.shop.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Boutique non trouvée" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { url, paid, price } = body;

    // Validation des données
    if (!url) {
      return NextResponse.json({ error: "L'URL est requise" }, { status: 400 });
    }

    if (paid && (!price || price < 0)) {
      return NextResponse.json(
        { error: "Le prix doit être un nombre positif" },
        { status: 400 }
      );
    }

    // Mettre à jour le lien
    const updatedLink = await prisma.link.update({
      where: {
        id: params.linkId,
      },
      data: {
        url,
        paid: paid || false,
        price: paid ? price : null,
      },
    });

    return NextResponse.json({
      message: "Lien mis à jour avec succès",
      data: updatedLink,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du lien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du lien" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/shops/[shopId]/links/[linkId]
export async function DELETE(
  request: Request,
  props: { params: Promise<{ shopId: string; linkId: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

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

    // Supprimer le lien
    await prisma.link.delete({
      where: {
        id: params.linkId,
      },
    });

    return NextResponse.json({
      message: "Lien supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du lien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du lien" },
      { status: 500 }
    );
  }
}
