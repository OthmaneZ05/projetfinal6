"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FloatingLabelInput } from "@/components/ui/floating-label-input"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/components/ui/toast"
import { validateName, validateEmail } from "@/lib/validation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { User, Mail, Calendar, Loader2, Edit, Save, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const { addToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const firstNameError = validateName(formData.first_name, "Le prénom")
    if (firstNameError) newErrors.first_name = firstNameError

    const lastNameError = validateName(formData.last_name, "Le nom")
    if (lastNameError) newErrors.last_name = lastNameError

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await updateProfile(formData)
      setIsEditing(false)
      addToast({
        type: "success",
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès !",
      })
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur de mise à jour",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      })
    }
    setErrors({})
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Vous devez être connecté pour accéder à cette page.</p>
              <Button asChild>
                <a href="/auth/login">Se connecter</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* En-tête du profil */}
          <div className="text-center animate-fade-in-up">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={`${user.first_name} ${user.last_name}`} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {user.first_name[0]}
                {user.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold">Mon Profil</h1>
            <p className="text-muted-foreground">Gérez vos informations personnelles</p>
          </div>

          {/* Informations du profil */}
          <Card className="shadow-lg animate-fade-in-up animate-delay-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>Vos informations de base sur Loc'Partage</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      label="Prénom"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      error={errors.first_name}
                      disabled={isSubmitting}
                    />
                    <FloatingLabelInput
                      label="Nom"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      error={errors.last_name}
                      disabled={isSubmitting}
                    />
                  </div>

                  <FloatingLabelInput
                    label="Adresse email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    error={errors.email}
                    disabled={isSubmitting}
                  />

                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Sauvegarder
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                      <X className="mr-2 h-4 w-4" />
                      Annuler
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                      <p className="text-lg">{user.first_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nom</label>
                      <p className="text-lg">{user.last_name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-lg flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Membre depuis</label>
                    <p className="text-lg flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {new Date(user.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistiques utilisateur */}
          <Card className="shadow-lg animate-fade-in-up animate-delay-400">
            <CardHeader>
              <CardTitle>Mes statistiques</CardTitle>
              <CardDescription>Votre activité sur Loc'Partage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Objets loués</div>
                </div>
                <div className="text-center p-4 bg-secondary/5 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">0</div>
                  <div className="text-sm text-muted-foreground">Objets proposés</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Avis reçus</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
