"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"
import { CATEGORY_LABELS, CONDITION_LABELS, type PublicationFilters } from "@/lib/publications"

interface FilterSidebarProps {
  filters: PublicationFilters
  onFiltersChange: (filters: PublicationFilters) => void
  className?: string
}

export function FilterSidebar({ filters, onFiltersChange, className }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([filters.min_price || 0, filters.max_price || 200])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.category ? [filters.category] : [])
  const [selectedConditions, setSelectedConditions] = useState<string[]>(filters.condition || [])
  const [location, setLocation] = useState(filters.location || "")

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    onFiltersChange({
      ...filters,
      min_price: value[0],
      max_price: value[1],
    })
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    let newCategories: string[]
    if (checked) {
      newCategories = [...selectedCategories, category]
    } else {
      newCategories = selectedCategories.filter((c) => c !== category)
    }
    setSelectedCategories(newCategories)
    onFiltersChange({
      ...filters,
      category: newCategories.length === 1 ? newCategories[0] : undefined,
    })
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    let newConditions: string[]
    if (checked) {
      newConditions = [...selectedConditions, condition]
    } else {
      newConditions = selectedConditions.filter((c) => c !== condition)
    }
    setSelectedConditions(newConditions)
    onFiltersChange({
      ...filters,
      condition: newConditions.length > 0 ? newConditions : undefined,
    })
  }

  const handleLocationChange = (value: string) => {
    setLocation(value)
    onFiltersChange({
      ...filters,
      location: value || undefined,
    })
  }

  const clearAllFilters = () => {
    setPriceRange([0, 200])
    setSelectedCategories([])
    setSelectedConditions([])
    setLocation("")
    onFiltersChange({})
  }

  const activeFiltersCount =
    (filters.min_price && filters.min_price > 0 ? 1 : 0) +
    (filters.max_price && filters.max_price < 200 ? 1 : 0) +
    selectedCategories.length +
    selectedConditions.length +
    (location ? 1 : 0)

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Localisation */}
        <div className="space-y-2">
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            placeholder="Ville, arrondissement..."
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
          />
        </div>

        {/* Prix */}
        <div className="space-y-4">
          <Label>Prix par jour</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={200}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{priceRange[0]}€</span>
            <span>{priceRange[1]}€</span>
          </div>
        </div>

        {/* Catégories */}
        <div className="space-y-3">
          <Label>Catégories</Label>
          <div className="space-y-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${key}`}
                  checked={selectedCategories.includes(key)}
                  onCheckedChange={(checked) => handleCategoryChange(key, checked as boolean)}
                />
                <Label htmlFor={`category-${key}`} className="text-sm font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* État */}
        <div className="space-y-3">
          <Label>État</Label>
          <div className="space-y-2">
            {Object.entries(CONDITION_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${key}`}
                  checked={selectedConditions.includes(key)}
                  onCheckedChange={(checked) => handleConditionChange(key, checked as boolean)}
                />
                <Label htmlFor={`condition-${key}`} className="text-sm font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
