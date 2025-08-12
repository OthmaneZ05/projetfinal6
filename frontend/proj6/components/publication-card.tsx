"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FavoriteButton } from "@/components/favorite-button"
import { MapPin, Eye, Euro } from "lucide-react"
import type { Publication } from "@/lib/publications"
import { CONDITION_LABELS, CONDITION_COLORS } from "@/lib/publications"

interface PublicationCardProps {
  publication: Publication
  onQuickView?: (publication: Publication) => void
}

export function PublicationCard({ publication, onQuickView }: PublicationCardProps) {
  const mainImage = publication.images[0] || "/placeholder.svg?height=200&width=300"

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(publication)
  }

  return (
    <Link href={`/publications/${publication.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={mainImage || "/placeholder.svg"}
            alt={publication.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges et actions */}
          <div className="absolute top-3 left-3">
            <Badge className={CONDITION_COLORS[publication.condition]}>{CONDITION_LABELS[publication.condition]}</Badge>
          </div>

          <div className="absolute top-3 right-3 flex space-x-2">
            <FavoriteButton publicationId={publication.id} size="sm" />
            {onQuickView && (
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3 text-xs"
                onClick={handleQuickView}
              >
                Aperçu
              </Button>
            )}
          </div>

          {!publication.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Non disponible
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {publication.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2">{publication.description}</p>

            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {publication.location}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-lg font-bold text-primary">
                <Euro className="h-4 w-4 mr-1" />
                {publication.price_per_day}€/jour
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                {publication.view_count}
              </div>
            </div>

            {publication.deposit_required > 0 && (
              <div className="text-xs text-muted-foreground">Caution : {publication.deposit_required}€</div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
