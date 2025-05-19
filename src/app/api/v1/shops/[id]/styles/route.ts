import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Schéma de validation pour la création/mise à jour d'un style component
const styleComponentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  details: z.object({}).optional(),
  order: z.number().int().min(0),
});

// GET /api/v1/shops/:id/styles
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        },
        { status: 401 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
    });

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Shop non trouvé" },
        },
        { status: 404 }
      );
    }
    if (!session.user.email) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        },
        { status: 401 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (shop.userId !== user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Non autorisé" },
        },
        { status: 403 }
      );
    }

    const styles = await prisma.styleComponent.findMany({
      where: { shopId: params.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: { styles },
    });
  } catch (error) {
    console.error("Error fetching styles:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}

// POST /api/v1/shops/:id/styles
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        },
        { status: 401 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
    });

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Shop non trouvé" },
        },
        { status: 404 }
      );
    }
    if (!session.user.email) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        },
        { status: 401 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (shop.userId !== user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Non autorisé" },
        },
        { status: 403 }
      );
    }

    if (shop.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Non autorisé" },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = styleComponentSchema.parse(body);

    const style = await prisma.styleComponent.create({
      data: {
        ...body,
        shopId: params.id,
      },
    });

    return NextResponse.json({ success: true, data: style }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: error.errors },
        },
        { status: 422 }
      );
    }

    console.error("Error creating style:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/shops/:id/styles/reorder
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        },
        { status: 401 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
    });

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Shop non trouvé" },
        },
        { status: 404 }
      );
    }
    if (!session.user.email) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        },
        { status: 401 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (shop.userId !== user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Non autorisé" },
        },
        { status: 403 }
      );
    }
    if (shop.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Non autorisé" },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const reorderSchema = z.array(
      z.object({
        id: z.string(),
        order: z.number().int().min(0),
      })
    );
    const validatedData = reorderSchema.parse(body);

    // Mettre à jour l'ordre de chaque style component
    await Promise.all(
      validatedData.map(({ id, order }) =>
        prisma.styleComponent.update({
          where: { id },
          data: { order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: error.errors },
        },
        { status: 422 }
      );
    }

    console.error("Error reordering styles:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}
