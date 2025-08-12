"use client"

import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import Image from "next/image"

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  showCreateButton?: boolean
}

export function EmptyState({ title, description, action, showCreateButton = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative w-64 h-64 mb-8 opacity-50">
        <Image src="/placeholder.svg?height=256&width=256" alt="Aucun résultat" fill className="object-contain" />
      </div>

      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-md">{description}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <Button onClick={action.onClick} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}

        {showCreateButton && (
          <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Publier une annonce
          </Button>
        )}
      </div>
    </div>
  )
}
