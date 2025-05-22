"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkId = searchParams.get("linkId");
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paymentIntent = searchParams.get("payment_intent");
    const paymentIntentClientSecret = searchParams.get(
      "payment_intent_client_secret"
    );

    if (!paymentIntent || !paymentIntentClientSecret) {
      setStatus("error");
      setError("Paramètres de paiement manquants");
      return;
    }

    // Vérifier le statut du paiement
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch("/api/v1/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentIntent,
            paymentIntentClientSecret,
            linkId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Erreur lors de la vérification du paiement"
          );
        }

        if (data.status === "succeeded") {
          setStatus("success");

          // Rediriger vers le lien après 3 secondes
          setTimeout(() => {
            if (data.url) {
              window.location.href = data.url;
            }
          }, 1000);
        } else {
          setStatus("error");
          setError("Le paiement n'a pas été complété");
        }
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      }
    };
    const getLink = async () => {
      const response = await fetch(`/api/v1/links/${linkId}`);
      const data = await response.json();
      setData(data);
    };
    getLink();

    checkPaymentStatus();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md w-full text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Vérification du paiement en cours...</p>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <p>{error}</p>
          </div>
          <Button onClick={() => router.back()}>Retour</Button>
        </Card>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md w-full text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Paiement réussi !</h1>
          <p className="text-muted-foreground mb-6">
            Vous allez être redirigé vers le contenu dans quelques secondes...
          </p>
          <Button
            variant="outline"
            className="mb-4 w-full"
            onClick={() => {
              if (searchParams.get("payment_intent")) {
                window.location.href = data.url;
              }
            }}
          >
            Accéder au contenu
          </Button>
          <Button onClick={() => router.back()}>Retour</Button>
        </Card>
      </div>
    </Suspense>
  );
}
