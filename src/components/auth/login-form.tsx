"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import { Icons } from "../icons";

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      // Gérer l'erreur ici
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="nom@exemple.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Se connecter
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continuer avec
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        >
          <Icons.gitHub className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </div>
  );
}
