import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Schéma de validation pour la mise à jour d'un shop
const updateShopSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  pathName: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string(),
      })
    )
    .optional(),
});

// GET /api/v1/shops/:id
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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
      include: { styleComponents: true },
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

    return NextResponse.json({
      success: true,
      data: shop,
    });
  } catch (error) {
    console.error("Error fetching shop:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}

// PUT /api/v1/shops/:id
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateShopSchema.parse(body);

    // Vérifier si le nouveau name ou pathName existe déjà
    if (validatedData.name || validatedData.pathName) {
      const existingShop = await prisma.shop.findFirst({
        where: {
          OR: [
            { name: validatedData.name },
            { pathName: validatedData.pathName },
          ],
          NOT: { id: params.id },
        },
      });

      if (existingShop) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CONFLICT",
              message: "Un shop avec ce nom ou ce chemin existe déjà",
            },
          },
          { status: 409 }
        );
      }
    }

    const updatedShop = await prisma.shop.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: updatedShop,
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

    console.error("Error updating shop:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/shops/:id
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    await prisma.shop.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error("Error deleting shop:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}
