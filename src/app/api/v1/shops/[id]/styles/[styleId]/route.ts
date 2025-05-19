import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const createStyleComponentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  details: z.object({ key: z.string(), value: z.string() }).optional(),
  order: z.number().int().min(0),
});

// Schéma de validation pour la mise à jour d'un style component
const updateStyleComponentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  details: z.object({ key: z.string(), value: z.string() }).optional(),
  order: z.number().int().min(0).optional(),
});

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

    const body = await req.json();
    const validatedData = createStyleComponentSchema.parse(body);

    const newStyle = await prisma.styleComponent.create({
      data: {
        ...validatedData,
        shopId: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: newStyle,
    });
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

// GET /api/v1/shops/:id/styles/:styleId
export async function GET(req: Request, props: { params: Promise<{ id: string; styleId: string }> }) {
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

    const style = await prisma.styleComponent.findUnique({
      where: { id: params.styleId },
    });

    if (!style) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Style non trouvé" },
        },
        { status: 404 }
      );
    }

    if (style.shopId !== params.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Non autorisé" },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: style,
    });
  } catch (error) {
    console.error("Error fetching style:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}

// PUT /api/v1/shops/:id/styles/:styleId
export async function PUT(req: Request, props: { params: Promise<{ id: string; styleId: string }> }) {
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

    const style = await prisma.styleComponent.findUnique({
      where: { id: params.styleId },
    });

    if (!style) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Style non trouvé" },
        },
        { status: 404 }
      );
    }

    if (style.shopId !== params.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Non autorisé" },
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updatedStyle = await prisma.styleComponent.update({
      where: { id: params.styleId },
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: updatedStyle,
    });
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

    console.error("Error updating style:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/shops/:id/styles/:styleId
export async function DELETE(req: Request, props: { params: Promise<{ id: string; styleId: string }> }) {
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

    const style = await prisma.styleComponent.findUnique({
      where: { id: params.styleId },
    });

    if (!style) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Style non trouvé" },
        },
        { status: 404 }
      );
    }

    if (style.shopId !== params.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Non autorisé" },
        },
        { status: 403 }
      );
    }

    await prisma.styleComponent.delete({
      where: { id: params.styleId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting style:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}
