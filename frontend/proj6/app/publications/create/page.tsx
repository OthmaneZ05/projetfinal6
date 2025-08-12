"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/image-upload"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { DashboardAPI, type CreatePublicationData } from "@/lib/dashboard-api"
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/lib/publications"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/components/ui/toast"
import Link from "next/link"

export default function CreatePublicationPage() {
  const [formData, setFormData] = useState<CreatePublicationData>({
    title: "",
    description: "",
    category: "",
    price_per_day: 0,
    deposit_required: 0,
    location: "",
    condition: "",
    images: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { user } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Le titre est requis"
    if (!formData.description.trim()) newErrors.description = "La description est requise"
    if (!formData.category) newErrors.category = "La catégorie est requise"
    if (formData.price_per_day <= 0) newErrors.price_per_day = "Le prix doit être supérieur à 0"
    if (!formData.location.trim()) newErrors.location = "La localisation est requise"
    if (!formData.condition) newErrors.condition = "L'état est requis"
    if (formData.images.length === 0) newErrors.images = "Au moins une image est requise"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await DashboardAPI.createPublication(formData)
      addToast({
        type: "success",
        title: "Publication créée",
        description: "Votre annonce a été publiée avec succès !",
      })
      router.push("/dashboard/publications")
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreatePublicationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/publications">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Créer une publication</h1>
              <p className="text-muted-foreground">Partagez votre matériel avec la communauté</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulaire principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Informations de base */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de base</CardTitle>
                    <CardDescription>Décrivez votre matériel de manière claire et attractive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre de l'annonce *</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Perceuse sans fil Bosch Professional"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className={errors.title ? "border-red-500" : ""}
                      />
                      {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Décrivez votre matériel, son état, ses spécificités..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className={errors.description ? "border-red-500" : ""}
                      />
                      {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Catégorie *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                            <SelectValue placeholder="Choisir une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>État *</Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value) => handleInputChange("condition", value)}
                        >
                          <SelectTrigger className={errors.condition ? "border-red-500" : ""}>
                            <SelectValue placeholder="État du matériel" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.condition && <p className="text-sm text-red-500">{errors.condition}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Photos *</CardTitle>
                    <CardDescription>Ajoutez des photos de qualité pour attirer plus de locataires</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(images) => handleInputChange("images", images)}
                      maxImages={5}
                    />
                    {errors.images && <p className="text-sm text-red-500 mt-2">{errors.images}</p>}
                  </CardContent>
                </Card>

                {/* Localisation et prix */}
                <Card>
                  <CardHeader>
                    <CardTitle>Localisation et tarifs</CardTitle>
                    <CardDescription>Définissez où récupérer le matériel et vos tarifs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation *</Label>
                      <Input
                        id="location"
                        placeholder="Ex: Paris 11ème, Lyon 2ème..."
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className={errors.location ? "border-red-500" : ""}
                      />
                      {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Prix par jour (€) *</Label>
                        <Input
                          id="price"
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="15.00"
                          value={formData.price_per_day || ""}
                          onChange={(e) => handleInputChange("price_per_day", Number.parseFloat(e.target.value) || 0)}
                          className={errors.price_per_day ? "border-red-500" : ""}
                        />
                        {errors.price_per_day && <p className="text-sm text-red-500">{errors.price_per_day}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deposit">Caution (€)</Label>
                        <Input
                          id="deposit"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="50.00"
                          value={formData.deposit_required || ""}
                          onChange={(e) =>
                            handleInputChange("deposit_required", Number.parseFloat(e.target.value) || 0)
                          }
                        />
                        <p className="text-xs text-muted-foreground">Optionnel - Caution de sécurité</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Aperçu */}
              <div className="space-y-6">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Aperçu
                    </CardTitle>
                    <CardDescription>Voici comment votre annonce apparaîtra</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.images.length > 0 && (
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                        <img
                          src={formData.images[0] || "/placeholder.svg"}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-2">{formData.title || "Titre de votre annonce"}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {formData.description || "Description de votre matériel..."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.category && (
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[formData.category as keyof typeof CATEGORY_LABELS]}
                        </Badge>
                      )}
                      {formData.condition && (
                        <Badge variant="outline">
                          {CONDITION_LABELS[formData.condition as keyof typeof CONDITION_LABELS]}
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Prix par jour</span>
                        <span className="font-semibold">{formData.price_per_day || 0}€</span>
                      </div>
                      {formData.deposit_required > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Caution</span>
                          <span className="text-sm">{formData.deposit_required}€</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link href="/dashboard/publications">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Publication...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Publier l'annonce
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
