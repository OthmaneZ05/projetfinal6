import { Search, MessageCircle, Handshake } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Recherchez",
      description:
        "Trouvez le matériel dont vous avez besoin près de chez vous parmi des milliers d'objets disponibles.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: MessageCircle,
      title: "Contactez",
      description:
        "Échangez directement avec le propriétaire pour convenir des modalités de location et poser vos questions.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: Handshake,
      title: "Récupérez",
      description:
        "Rencontrez le propriétaire, récupérez votre matériel et profitez-en ! Retournez-le à la fin de la location.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Comment ça <span className="text-primary">marche</span> ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Louer du matériel n'a jamais été aussi simple. Suivez ces 3 étapes et accédez à tout ce dont vous avez
            besoin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card
                key={index}
                className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8 text-center">
                  {/* Numéro d'étape */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>

                  {/* Icône */}
                  <div
                    className={`w-16 h-16 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-8 w-8 ${step.color}`} />
                  </div>

                  {/* Contenu */}
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 animate-fade-in-up animate-delay-400">
          <p className="text-muted-foreground mb-4">Prêt à commencer votre première location ?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Commencer à louer
            </button>
            <button className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors">
              Publier une annonce
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
