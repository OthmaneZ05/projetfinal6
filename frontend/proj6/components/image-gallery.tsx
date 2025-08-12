"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  if (!images.length) {
    return (
      <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Aucune image disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted group">
        <Image
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />

        {/* Bouton zoom */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsZoomOpen(true)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Indicateurs */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex ? "bg-white" : "bg-white/50",
                  )}
                  onClick={() => goToImage(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                index === currentIndex ? "border-primary" : "border-transparent hover:border-muted-foreground",
              )}
              onClick={() => goToImage(index)}
            >
              <Image src={image || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Modal zoom */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setIsZoomOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="relative aspect-[4/3]">
              <Image
                src={images[currentIndex] || "/placeholder.svg"}
                alt={`${title} - Image ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="flex justify-center space-x-2 p-4">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      index === currentIndex ? "bg-primary" : "bg-muted hover:bg-muted-foreground",
                    )}
                    onClick={() => goToImage(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
