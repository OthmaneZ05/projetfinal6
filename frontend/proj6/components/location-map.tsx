"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation } from "lucide-react"
import Image from "next/image"

interface LocationMapProps {
  location: string
  approximateAddress?: string
  className?: string
}

export function LocationMap({ location, approximateAddress, className }: LocationMapProps) {
  // Simulation d'une carte - en production, utiliser Google Maps, Mapbox, etc.
  const mapImageUrl = "/placeholder.svg?height=300&width=400&text=Carte+de+" + encodeURIComponent(location)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Localisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Carte simulée */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
          <Image src={mapImageUrl || "/placeholder.svg"} alt={`Carte de ${location}`} fill className="object-cover" />
          {/* Pin de localisation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Informations de localisation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {location}
            </Badge>
          </div>

          {approximateAddress && <p className="text-sm text-muted-foreground">{approximateAddress}</p>}

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Navigation className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Localisation approximative</p>
                <p>
                  L'adresse exacte sera communiquée après confirmation de la réservation pour des raisons de sécurité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
