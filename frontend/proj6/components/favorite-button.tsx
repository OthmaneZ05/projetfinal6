"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

interface FavoriteButtonProps {
  publicationId: number
  initialIsFavorite?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function FavoriteButton({
  publicationId,
  initialIsFavorite = false,
  size = "md",
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault() // Empêcher la navigation si dans un lien
    e.stopPropagation()

    setIsLoading(true)
    try {
      // Simulation d'appel API
      await new Promise((resolve) => setTimeout(resolve, 500))

      setIsFavorite(!isFavorite)
      addToast({
        type: "success",
        title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isFavorite
          ? "Cette publication a été retirée de vos favoris"
          : "Cette publication a été ajoutée à vos favoris",
      })
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de modifier les favoris",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn(
        sizeClasses[size],
        "rounded-full p-0 hover:scale-110 transition-all duration-200",
        isFavorite && "bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30",
        className,
      )}
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500",
        )}
      />
    </Button>
  )
}
