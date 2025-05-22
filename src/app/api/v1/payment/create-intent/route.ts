import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { linkId, amount } = body;

    if (!linkId || !amount) {
      return NextResponse.json(
        { error: "ID du lien et montant requis" },
        { status: 400 }
      );
    }

    // Récupérer le lien et vérifier qu'il appartient à la boutique de l'utilisateur
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
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

    // Calculer le montant en centimes (Stripe utilise les centimes)
    const amountInCents = Math.round(amount * 100);

    // Créer l'intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      metadata: {
        linkId,
        shopId: link.shop.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'intention de paiement:",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
