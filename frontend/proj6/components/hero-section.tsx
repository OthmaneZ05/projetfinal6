"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  const [location, setLocation] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Rediriger vers la page de recherche avec les paramètres
    const params = new URLSearchParams()
    if (location) params.set("location", location)

    window.location.href = `/search?${params.toString()}`
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contenu textuel */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-primary">Louez</span> le matériel dont vous avez{" "}
                <span className="text-secondary">besoin</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                Découvrez une nouvelle façon de consommer. Louez du matériel entre particuliers, économisez de l'argent
                et réduisez votre impact environnemental.
              </p>
            </div>

            {/* Barre de recherche */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Où cherchez-vous ?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </form>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Objets disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5k+</div>
                <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Villes couvertes</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-slide-in-left animate-delay-200">
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/accueil.png"
                alt="Illustration de partage de matériel"
                fill
                className="object-cover"
                priority
              />
              {/* Overlay décoratif */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20" />
            </div>

            {/* Éléments décoratifs flottants */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-secondary/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/20 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
