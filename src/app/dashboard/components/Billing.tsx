import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";

const Billing = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          Tarification Simple et Transparente
        </h1>
        <p className="text-xl text-muted-foreground">
          Créez votre page de liens gratuitement, nous prenons juste une petite
          commission sur les transactions
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Carte Gratuit */}
        <Card className="relative overflow-hidden border-2 border-primary/20">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg text-sm font-medium">
            Recommandé
          </div>
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Gratuit</h2>
              <p className="text-muted-foreground">
                Commencez à créer votre page de liens dès maintenant
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">0€</span>
                <span className="text-muted-foreground ml-2">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Aucun frais mensuel, aucun frais caché
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Création illimitée de liens</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Personnalisation complète</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Statistiques détaillées</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Support prioritaire</span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Carte Commission */}
        <Card className="bg-muted/50">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Commission sur les Transactions
              </h2>
              <p className="text-muted-foreground">
                Une petite commission pour maintenir le service
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">2%</span>
                <span className="text-muted-foreground ml-2">
                  par transaction
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Seulement sur les liens payants
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-background p-4 rounded-lg">
                <h3 className="font-medium mb-2">Exemple</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix du lien</span>
                    <span>10€</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Notre commission (2%)</span>
                    <span>0.20€</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Vous recevez</span>
                    <span>9.80€</span>
                  </div>
                </div>
              </div>
            </div>

            <ul className="space-y-4">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Paiements sécurisés</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Virements automatiques</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span>Reçus fiscaux inclus</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Questions fréquentes</h2>
        <div className="grid md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
          <div>
            <h3 className="font-medium mb-2">
              Comment sont calculés les frais ?
            </h3>
            <p className="text-muted-foreground">
              Nous prenons simplement 2% sur chaque transaction payante. Par
              exemple, si vous vendez un lien à 100€, vous recevrez 98€.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              Quand recevrai-je mes paiements ?
            </h3>
            <p className="text-muted-foreground">
              Les paiements sont automatiquement transférés sur votre compte
              bancaire chaque semaine, sans frais supplémentaires.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Y a-t-il des frais cachés ?</h3>
            <p className="text-muted-foreground">
              Non, aucun frais caché. Vous ne payez que 2% sur les transactions
              payantes, c'est tout.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              Comment fonctionnent les liens gratuits ?
            </h3>
            <p className="text-muted-foreground">
              Les liens gratuits sont entièrement gratuits, sans aucune
              commission. Vous pouvez en créer autant que vous le souhaitez.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
