import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/v1/views
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { linkId, shopId, type } = body;

    if (!linkId && !shopId) {
      return NextResponse.json(
        { error: "Un lien ou une boutique doit être spécifié" },
        { status: 400 }
      );
    }

    // Obtenir l'heure actuelle arrondie à l'heure
    const now = new Date();
    now.setMinutes(0, 0, 0);

    // Créer une clé unique pour chaque combinaison
    const uniqueKey = `${now.toISOString()}_${type}_${linkId || shopId}`;

    // Chercher ou créer une entrée pour cette heure
    const view = await prisma.nbViews.findFirst({
      where: {
        date: now,
        type: type,
        ...(linkId ? { linkId } : { shopId }),
      },
    });
    if (!view) {
      await prisma.nbViews.create({
        data: {
          date: now,
          count: 1,
          type: type,
          ...(linkId ? { linkId } : { shopId }),
        },
      });
    } else {
      await prisma.nbViews.update({
        where: {
          id: view.id,
        },
        data: {
          count: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      message: "Vue enregistrée avec succès",
      data: view,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la vue:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de la vue" },
      { status: 500 }
    );
  }
}

// GET /api/v1/views
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shopId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!shopId) {
      return NextResponse.json(
        { error: "L'ID de la boutique est requis" },
        { status: 400 }
      );
    }

    // Récupérer d'abord tous les liens de la boutique avec leurs paiements
    const shopLinks = await prisma.link.findMany({
      where: { shopId },
      include: {
        payment: true,
      },
    });

    const linkIds = shopLinks.map((link) => link.id);

    // Construire la requête de base
    const where: any = {
      OR: [{ shopId }, { linkId: { in: linkIds } }],
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Récupérer les vues
    const views = await prisma.nbViews.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      include: {
        link: {
          include: {
            payment: true,
          },
        },
        shop: true,
      },
    });

    // Statistiques globales de la boutique
    const shopStats = {
      totalViews: 0,
      totalLinkClicks: 0,
      totalPaidLinkClicks: 0,
      totalRevenue: 0,
      viewsByType: {} as Record<string, { total: number; byDate: any[] }>,
      links: [] as any[],
    };

    // Grouper les vues par type et par lien
    views.forEach((view) => {
      const type = view.type || "unknown";

      // Initialiser le type s'il n'existe pas
      if (!shopStats.viewsByType[type]) {
        shopStats.viewsByType[type] = {
          total: 0,
          byDate: [],
        };
      }

      // Ajouter les statistiques par type
      shopStats.viewsByType[type].total += view.count;
      shopStats.viewsByType[type].byDate.push({
        date: view.date,
        count: view.count,
      });

      // Statistiques globales
      if (type === "page_view") {
        shopStats.totalViews += view.count;
      } else if (type === "link_click") {
        shopStats.totalLinkClicks += view.count;

        // Statistiques par lien
        const existingLink = shopStats.links.find(
          (l) => l.id === view.link?.id
        );

        if (existingLink) {
          existingLink.clicks += view.count;
        } else if (view.link) {
          // Compter le nombre de paiements Stripe pour ce lien
          const paidClicks = view.link.payment.filter(
            (p) => p.stripeId !== null
          ).length;

          shopStats.links.push({
            id: view.link.id,
            url: view.link.url,
            paid: view.link.paid,
            price: view.link.price,
            clicks: view.count,
            paidClicks,
            revenue: paidClicks * (view.link.price || 0),
          });

          // Mettre à jour les statistiques globales
          shopStats.totalPaidLinkClicks += paidClicks;
          shopStats.totalRevenue += paidClicks * (view.link.price || 0);
        }
      }
    });

    // Trier les liens par nombre de clics
    shopStats.links.sort((a, b) => b.clicks - a.clicks);

    return NextResponse.json({
      message: "Statistiques récupérées avec succès",
      data: shopStats,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
