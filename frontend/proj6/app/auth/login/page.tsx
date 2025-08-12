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
import { validateEmail, validatePassword } from "@/lib/validation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await login(formData.email, formData.password)
      addToast({
        type: "success",
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté !",
      })
      router.push("/")
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      })
    } finally {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Se connecter</CardTitle>
          <CardDescription>Accédez à votre compte Loc'Partage</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <FloatingLabelInput
                label="Adresse email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email}
                disabled={isSubmitting}
              />

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
            </div>

            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link href="/auth/register" className="text-primary hover:underline font-medium">
                  S'inscrire
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
