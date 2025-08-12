"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Upload, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export function ImageUpload({ images, onImagesChange, maxImages = 5, className }: ImageUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remainingSlots = maxImages - images.length
      const filesToProcess = acceptedFiles.slice(0, remainingSlots)

      filesToProcess.forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          onImagesChange([...images, result])
        }
        reader.readAsDataURL(file)
      })
    },
    [images, maxImages, onImagesChange],
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: maxImages,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    disabled: images.length >= maxImages,
  })

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Zone de drop */}
      {images.length < maxImages && (
        <Card
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-primary/50",
            isDragActive && "border-primary bg-primary/5",
            images.length >= maxImages && "opacity-50 cursor-not-allowed",
          )}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">
                {isDragActive ? "Déposez vos images ici" : "Ajoutez vos images"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Glissez-déposez vos images ou cliquez pour sélectionner
                <br />
                Maximum {maxImages} images • JPG, PNG, WebP
              </p>
              <Button variant="outline" type="button">
                <ImageIcon className="h-4 w-4 mr-2" />
                Choisir des images
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aperçu des images */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Images sélectionnées ({images.length}/{maxImages})
            </h4>
            <p className="text-sm text-muted-foreground">Glissez pour réorganiser</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="group relative overflow-hidden">
                <div className="aspect-square relative">
                  <Image src={image || "/placeholder.svg"} alt={`Image ${index + 1}`} fill className="object-cover" />

                  {/* Badge première image */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Principal
                    </div>
                  )}

                  {/* Bouton supprimer */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            La première image sera utilisée comme image principale de votre annonce.
          </p>
        </div>
      )}
    </div>
  )
}
