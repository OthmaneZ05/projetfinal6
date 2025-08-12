"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FloatingLabelInput } from "@/components/ui/floating-label-input"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/components/ui/toast"
import { validateEmail, validatePassword, validateName } from "@/lib/validation"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const firstNameError = validateName(formData.first_name, "Le prénom")
    if (firstNameError) newErrors.first_name = firstNameError

    const lastNameError = validateName(formData.last_name, "Le nom")
    if (lastNameError) newErrors.last_name = lastNameError

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Début de la soumission du formulaire d'inscription.");

    if (!validateForm()) {
      console.warn("Validation du formulaire échouée. Erreurs :", errors);
      return
    }

    console.log("Formulaire validé, envoi des données...");
    setIsSubmitting(true)

    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      })
      console.log("Inscription réussie, redirection...");
      addToast({
        type: "success",
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès !",
      })
      router.push("/")
    } catch (error) {
      console.error("Erreur capturée dans handleSubmit lors de l'inscription :", error);
      addToast({
        type: "error",
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      })
    } finally {
      console.log("Fin de la tentative de soumission.");
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const getPasswordStrength = (password: string) => {
    const checks = [
      password.length >= 8,
      /(?=.*[a-z])/.test(password),
      /(?=.*[A-Z])/.test(password),
      /(?=.*\d)/.test(password),
    ]
    return checks.filter(Boolean).length
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>Rejoignez la communauté Loc'Partage</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <div className="relative">
                <FloatingLabelInput
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  error={errors.password}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Indicateur de force du mot de passe */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          passwordStrength >= level
                            ? passwordStrength <= 2
                              ? "bg-red-500"
                              : passwordStrength === 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs space-y-1">
                    <div
                      className={`flex items-center ${formData.password.length >= 8 ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Au moins 8 caractères
                    </div>
                    <div
                      className={`flex items-center ${/(?=.*[a-z])/.test(formData.password) ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Une minuscule
                    </div>
                    <div
                      className={`flex items-center ${/(?=.*[A-Z])/.test(formData.password) ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Une majuscule
                    </div>
                    <div
                      className={`flex items-center ${/(?=.*\d)/.test(formData.password) ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Un chiffre
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <FloatingLabelInput
                label="Confirmer le mot de passe"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                error={errors.confirmPassword}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute right-3 top-4 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création du compte...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
