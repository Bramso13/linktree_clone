import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Schéma de validation pour la création d'un shop
const createShopSchema = z.object({
  name: z.string().min(1).max(100),
  pathName: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
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

// GET /api/v1/shops
export async function GET(req: Request) {
  try {
    console.log("get shops");
    const session = await getServerSession(authOptions);
    console.log("session", session);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        },
        { status: 401 }
      );
    }
    console.log("session", session);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

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
    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where: { userId: user?.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.shop.count({
        where: { userId: user?.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { shops },
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}

// POST /api/v1/shops
export async function POST(req: Request) {
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

    const body = await req.json();
    const validatedData = createShopSchema.parse(body);

    // Vérifier si le name ou pathName existe déjà
    const existingShop = await prisma.shop.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { pathName: validatedData.pathName },
        ],
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
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Non authentifié" },
        },
        { status: 401 }
      );
    }
    const shop = await prisma.shop.create({
      data: {
        ...validatedData,
        userId: user?.id,
      },
    });

    return NextResponse.json({ success: true, data: shop }, { status: 201 });
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

    console.error("Error creating shop:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Erreur serveur" },
      },
      { status: 500 }
    );
  }
}
