"use client"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageGallery } from "@/components/image-gallery"
import { MapPin, Eye, Euro, ExternalLink } from "lucide-react"
import { CONDITION_LABELS, CONDITION_COLORS, CATEGORY_LABELS, type Publication } from "@/lib/publications"
import Link from "next/link"

interface QuickViewModalProps {
  publication: Publication | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ publication, isOpen, onClose }: QuickViewModalProps) {
  if (!publication) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogTitle asChild>
          <VisuallyHidden>Vue rapide : {publication.title}</VisuallyHidden>
        </DialogTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Galerie d'images */}
          <div>
            <ImageGallery images={publication.images} title={publication.title} />
          </div>

          {/* Informations */}
          <div className="space-y-6">
            {/* En-tête */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold line-clamp-2">{publication.title}</h1>
                <Link href={`/publications/${publication.id}`}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary">{CATEGORY_LABELS[publication.category]}</Badge>
                <Badge className={CONDITION_COLORS[publication.condition]}>
                  {CONDITION_LABELS[publication.condition]}
                </Badge>
                {!publication.is_available && <Badge variant="destructive">Non disponible</Badge>}
              </div>

              <div className="flex items-center text-muted-foreground text-sm space-x-4">
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

            {/* Prix */}
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold text-primary flex items-center">
                <Euro className="h-6 w-6 mr-1" />
                {publication.price_per_day}€
              </div>
              <span className="text-muted-foreground">par jour</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground line-clamp-4">{publication.description}</p>
            </div>

            {/* Caution */}
            {publication.deposit_required > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Caution requise :</span> {publication.deposit_required}€
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Link href={`/publications/${publication.id}`}>
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Voir les détails complets
                </Button>
              </Link>
              <Button variant="outline" className="w-full bg-transparent">
                Contacter le propriétaire
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
