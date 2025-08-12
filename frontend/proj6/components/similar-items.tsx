"use client"

import { useState, useEffect } from "react"
import { PublicationCard } from "@/components/publication-card"
import { PublicationSkeleton } from "@/components/publication-skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { PublicationsAPI, type Publication } from "@/lib/publications"
import { useToast } from "@/components/ui/toast"

interface SimilarItemsProps {
  currentPublicationId: number
  category: string
  location: string
  className?: string
}

export function SimilarItems({ currentPublicationId, category, location, className }: SimilarItemsProps) {
  const [publications, setPublications] = useState<Publication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { addToast } = useToast()

  const itemsPerPage = 3
  const maxIndex = Math.max(0, publications.length - itemsPerPage)

  useEffect(() => {
    loadSimilarItems()
  }, [currentPublicationId, category, location])

  const loadSimilarItems = async () => {
    setIsLoading(true)
    try {
      const response = await PublicationsAPI.getPublications({
        category,
        location,
        page: 1,
      })

      // Filtrer la publication actuelle et limiter à 6 résultats
      const filtered = response.publications.filter((pub) => pub.id !== currentPublicationId).slice(0, 6)

      setPublications(filtered)
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de charger les publications similaires",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + itemsPerPage, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0))
  }

  if (isLoading) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold mb-6">Publications similaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <PublicationSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (publications.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Publications similaires</h2>

        {publications.length > itemsPerPage && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={prevSlide} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextSlide} disabled={currentIndex >= maxIndex}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
        >
          {publications.map((publication) => (
            <div key={publication.id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3">
              <PublicationCard publication={publication} />
            </div>
          ))}
        </div>
      </div>

      {/* Indicateurs */}
      {publications.length > itemsPerPage && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: Math.ceil(publications.length / itemsPerPage) }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(currentIndex / itemsPerPage) === index ? "bg-primary" : "bg-muted hover:bg-muted-foreground"
              }`}
              onClick={() => setCurrentIndex(index * itemsPerPage)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
