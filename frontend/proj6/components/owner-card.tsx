"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageCircle, Shield, Calendar } from "lucide-react"

interface Owner {
  id: string
  first_name: string
  last_name: string
  avatar?: string
  rating?: number
  reviewCount?: number
  memberSince: string
  responseRate?: number
  isVerified?: boolean
}

interface OwnerCardProps {
  owner: Owner
  onContact?: () => void
  className?: string
}

export function OwnerCard({ owner, onContact, className }: OwnerCardProps) {
  const memberSinceYear = new Date(owner.memberSince).getFullYear()

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <Avatar className="w-16 h-16">
            <AvatarImage src={owner.avatar || "/placeholder.svg"} alt={`${owner.first_name} ${owner.last_name}`} />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {owner.first_name[0]}
              {owner.last_name[0]}
            </AvatarFallback>
          </Avatar>

          {/* Informations */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {owner.first_name} {owner.last_name[0]}.
                </h3>
                {owner.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>

              {/* Rating */}
              {owner.rating && (
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(owner.rating!) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{owner.rating}</span>
                  <span className="text-sm text-muted-foreground">({owner.reviewCount} avis)</span>
                </div>
              )}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Membre depuis {memberSinceYear}
              </div>
              {owner.responseRate && (
                <div className="text-muted-foreground">Taux de réponse : {owner.responseRate}%</div>
              )}
            </div>

            {/* Bouton contact */}
            <Button onClick={onContact} className="w-full sm:w-auto bg-transparent" variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contacter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
