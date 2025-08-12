"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ImageGallery } from "@/components/image-gallery"
import { PriceCalculator } from "@/components/price-calculator"
import { LocationMap } from "@/components/location-map"
import { OwnerCard } from "@/components/owner-card"
import { SimilarItems } from "@/components/similar-items"
import { FavoriteButton } from "@/components/favorite-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Share2, MapPin, Eye, Shield, MessageCircle, Flag } from "lucide-react"
import {
  PublicationsAPI,
  type Publication,
  CONDITION_LABELS,
  CONDITION_COLORS,
  CATEGORY_LABELS,
} from "@/lib/publications"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { addDays } from "date-fns"

export default function PublicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()

  const [publication, setPublication] = useState<Publication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const publicationId = Number(params.id)

  useEffect(() => {
    if (publicationId) {
      loadPublication()
    }
  }, [publicationId])

  const loadPublication = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await PublicationsAPI.getPublication(publicationId)
      setPublication(data)
    } catch (err) {
      setError("Publication non trouvée")
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de charger cette publication",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && publication) {
      try {
        await navigator.share({
          title: publication.title,
          text: publication.description,
          url: window.location.href,
        })
      } catch (err) {
        // Fallback: copier l'URL
        navigator.clipboard.writeText(window.location.href)
        addToast({
          type: "success",
          title: "Lien copié",
          description: "Le lien a été copié dans le presse-papiers",
        })
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href)
      addToast({
        type: "success",
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papiers",
      })
    }
  }

  const handleBooking = (startDate: Date, endDate: Date, total: number) => {
    addToast({
      type: "success",
      title: "Réservation initiée",
      description: `Redirection vers le processus de réservation pour ${total}€`,
    })
    // Ici, rediriger vers la page de réservation
    // router.push(`/booking/${publicationId}?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
  }

  const handleContact = () => {
    addToast({
      type: "info",
      title: "Messagerie",
      description: "Redirection vers la messagerie avec le propriétaire",
    })
    // Ici, ouvrir la messagerie ou rediriger
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <Skeleton className="h-6 w-96" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div>
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Publication non trouvée</h1>
            <p className="text-muted-foreground mb-6">Cette publication n'existe pas ou a été supprimée.</p>
            <Button onClick={() => router.push("/publications")}>Retour au catalogue</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Dates indisponibles simulées
  const unavailableDates = [
    addDays(new Date(), 5),
    addDays(new Date(), 6),
    addDays(new Date(), 12),
    addDays(new Date(), 20),
  ]

  // Propriétaire simulé
  const owner = {
    id: "1",
    first_name: "Marie",
    last_name: "Dupont",
    avatar: "/placeholder.svg?height=64&width=64",
    rating: 4.8,
    reviewCount: 23,
    memberSince: "2022-03-15",
    responseRate: 95,
    isVerified: true,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/publications">Publications</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/publications?category=${publication.category}`}>
                  {CATEGORY_LABELS[publication.category]}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{publication.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Galerie d'images */}
              <ImageGallery images={publication.images} title={publication.title} />

              {/* En-tête */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-3">{publication.title}</h1>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge variant="secondary">{CATEGORY_LABELS[publication.category]}</Badge>
                      <Badge className={CONDITION_COLORS[publication.condition]}>
                        {CONDITION_LABELS[publication.condition]}
                      </Badge>
                      {!publication.is_available && <Badge variant="destructive">Non disponible</Badge>}
                    </div>

                    <div className="flex items-center text-muted-foreground space-x-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {publication.location}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {publication.view_count} vues
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <FavoriteButton publicationId={publication.id} size="lg" />
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{publication.description}</p>
                </div>
              </div>

              <Separator />

              {/* Propriétaire */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Propriétaire</h2>
                <OwnerCard owner={owner} onContact={handleContact} />
              </div>

              <Separator />

              {/* Localisation */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Localisation</h2>
                <LocationMap location={publication.location} approximateAddress="Secteur République - Bastille" />
              </div>

              {/* Sécurité */}
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Votre sécurité</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Ne payez jamais en dehors de la plateforme</li>
                      <li>• Vérifiez l'état du matériel avant utilisation</li>
                      <li>• Communiquez via notre messagerie sécurisée</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Calculateur de prix */}
              <PriceCalculator
                pricePerDay={publication.price_per_day}
                depositRequired={publication.deposit_required}
                unavailableDates={unavailableDates}
                onBooking={handleBooking}
              />

              {/* Actions rapides */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Poser une question
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                  <Flag className="h-4 w-4 mr-2" />
                  Signaler cette annonce
                </Button>
              </div>
            </div>
          </div>

          {/* Publications similaires */}
          <SimilarItems
            currentPublicationId={publication.id}
            category={publication.category}
            location={publication.location}
            className="mt-16"
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
