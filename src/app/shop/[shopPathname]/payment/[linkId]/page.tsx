"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Initialiser Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const PaymentForm = ({
  linkId,
  amount,
}: {
  linkId: string;
  amount: number;
}) => {
  // je suis la
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/shop/payment/success?linkId=${linkId}`,
        },
      });

      if (submitError) {
        setError(submitError.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue lors du paiement");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Paiement</h2>
        <p className="text-muted-foreground">
          Montant à payer : {amount.toFixed(2)}€
        </p>
      </div>

      <div className="mb-6">
        <PaymentElement />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <Button type="submit" disabled={!stripe || processing} className="w-full">
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          "Payer"
        )}
      </Button>
    </form>
  );
};

export default function PaymentPage(props: {
  params: Promise<{ linkId: string }>;
}) {
  const params = use(props.params);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        // Récupérer le montant du lien
        const linkResponse = await fetch(`/api/v1/links/${params.linkId}`);
        const linkData = await linkResponse.json();

        if (!linkResponse.ok) {
          throw new Error(
            linkData.error || "Erreur lors de la récupération du lien"
          );
        }

        setAmount(linkData.price);

        // Créer l'intention de paiement
        const response = await fetch("/api/v1/payment/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            linkId: params.linkId,
            amount: linkData.price,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Erreur lors de la création du paiement"
          );
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [params.linkId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!clientSecret || !amount) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="p-6 max-w-md w-full">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
            },
          }}
        >
          <PaymentForm linkId={params.linkId} amount={amount} />
        </Elements>
      </Card>
    </div>
  );
}
