import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/v1/shops/[id]/links
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
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

    // Récupérer tous les liens de la boutique
    const links = await prisma.link.findMany({
      where: {
        shopId: params.id,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json({
      message: "Liens récupérés avec succès",
      data: links,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des liens:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des liens" },
      { status: 500 }
    );
  }
}

// POST /api/v1/shops/[id]/links
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
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

    // Créer le nouveau lien
    const newLink = await prisma.link.create({
      data: {
        url,
        paid: paid || false,
        price: paid ? price : null,
        shopId: params.id,
      },
    });

    return NextResponse.json({
      message: "Lien créé avec succès",
      data: newLink,
    });
  } catch (error) {
    console.error("Erreur lors de la création du lien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du lien" },
      { status: 500 }
    );
  }
}
