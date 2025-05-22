import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { paymentIntent, paymentIntentClientSecret, linkId } =
      await req.json();

    if (!paymentIntent || !paymentIntentClientSecret) {
      return NextResponse.json(
        { error: "Paramètres de paiement manquants" },
        { status: 400 }
      );
    }
    if (!linkId) {
      return NextResponse.json(
        { error: "ID de lien manquant" },
        { status: 400 }
      );
    }

    // Récupérer le PaymentIntent depuis Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntent);

    // Vérifier que le client secret correspond
    if (intent.client_secret !== paymentIntentClientSecret) {
      return NextResponse.json(
        { error: "Client secret invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour le lien avec le stripeId
    const link = await prisma.link.update({
      where: {
        id: linkId,
      },
      data: {
        payment: {
          create: {
            stripeId: paymentIntent,
          },
        },
      },
    });

    // Récupérer l'URL du lien depuis les métadonnées
    const linkUrl = link.url;

    return NextResponse.json({
      status: intent.status,
      linkUrl,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du paiement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification du paiement" },
      { status: 500 }
    );
  }
}
