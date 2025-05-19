import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password } = body;

    // Vérifier si l'email existe déjà
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { user: null, message: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 10);

    // Créer le nouvel utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        hashedPassword: hashedPassword,
      },
    });

    // Supprimer le mot de passe de la réponse
    const { hashedPassword: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { user: userWithoutPassword, message: "Utilisateur créé avec succès" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
