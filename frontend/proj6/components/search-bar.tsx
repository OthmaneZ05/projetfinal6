"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, X } from "lucide-react"
import { PublicationsAPI } from "@/lib/publications"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSearch: (query: string, location: string) => void
  initialQuery?: string
  initialLocation?: string
  className?: string
}

export function SearchBar({ onSearch, initialQuery = "", initialLocation = "", className }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !locationInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLocationChange = async (value: string) => {
    setLocation(value)

    if (value.length > 2) {
      setIsLoading(true)
      try {
        const suggestions = await PublicationsAPI.searchLocations(value)
        setLocationSuggestions(suggestions)
        setShowSuggestions(true)
      } catch (error) {
        console.error("Erreur lors de la recherche de localisation:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setLocationSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion)
    setShowSuggestions(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, location)
    setShowSuggestions(false)
  }

  const clearLocation = () => {
    setLocation("")
    setShowSuggestions(false)
    locationInputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        {/* Recherche textuelle */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Que cherchez-vous ?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Localisation avec autocomplete */}
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={locationInputRef}
            type="text"
            placeholder="Où ?"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            onFocus={() => location.length > 2 && setShowSuggestions(true)}
            className="pl-10 pr-10 h-12"
          />
          {location && (
            <button
              type="button"
              onClick={clearLocation}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Suggestions de localisation */}
          {showSuggestions && locationSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {locationSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bouton de recherche */}
        <Button
          type="submit"
          size="lg"
          className="h-12 px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
      </div>
    </form>
  )
}
