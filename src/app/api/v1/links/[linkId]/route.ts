import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request, props: { params: Promise<{ linkId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const link = await prisma.link.findFirst({
      where: {
        id: params.linkId,
        shop: {
          userId: session.user.id,
        },
      },
      include: {
        shop: true,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      id: link.id,
      url: link.url,
      paid: link.paid,
      price: link.price,
      shopId: link.shopId,
      shopName: link.shop.name,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du lien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du lien" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, props: { params: Promise<{ linkId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { url, paid, price } = body;

    // Vérifier que le lien appartient à la boutique de l'utilisateur
    const existingLink = await prisma.link.findFirst({
      where: {
        id: params.linkId,
        shop: {
          userId: session.user.id,
        },
      },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    }

    // Mettre à jour le lien
    const updatedLink = await prisma.link.update({
      where: {
        id: params.linkId,
      },
      data: {
        url,
        paid,
        price: paid ? price : null,
      },
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du lien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du lien" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ linkId: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que le lien appartient à la boutique de l'utilisateur
    const existingLink = await prisma.link.findFirst({
      where: {
        id: params.linkId,
        shop: {
          userId: session.user.id,
        },
      },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    }

    // Supprimer le lien
    await prisma.link.delete({
      where: {
        id: params.linkId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du lien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du lien" },
      { status: 500 }
    );
  }
}
