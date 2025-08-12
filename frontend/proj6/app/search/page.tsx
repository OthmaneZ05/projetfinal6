"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PublicationCard } from "@/components/publication-card"
import { PublicationSkeleton } from "@/components/publication-skeleton"
import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, SlidersHorizontal } from "lucide-react"
import { PublicationsAPI, type Publication, type PublicationFilters } from "@/lib/publications"
import { useToast } from "@/components/ui/toast"

export default function SearchPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const [sortBy, setSortBy] = useState("date_desc")

  const searchParams = useSearchParams()
  const { addToast } = useToast()

  useEffect(() => {
    const query = searchParams.get("q") || ""
    const location = searchParams.get("location") || ""
    const page = Number(searchParams.get("page")) || 1
    const sort = searchParams.get("sort") || "date_desc"

    setSearchQuery(query)
    setSearchLocation(location)
    setCurrentPage(page)
    setSortBy(sort)

    loadPublications(query, location, page, sort)
  }, [searchParams])

  const loadPublications = async (query: string, location: string, page: number, sort: string) => {
    setIsLoading(true)
    try {
      const filters: PublicationFilters = {
        search: query || undefined,
        location: location || undefined,
        page,
        sort: sort as any,
      }

      const response = await PublicationsAPI.getPublications(filters)

      setPublications(response.publications)
      setTotalPages(response.total_pages)
      setTotal(response.total)
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de charger les résultats de recherche",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateURL = (query: string, location: string, page: number, sort: string) => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (location) params.set("location", location)
    if (page > 1) params.set("page", page.toString())
    if (sort !== "date_desc") params.set("sort", sort)

    const newURL = `/search${params.toString() ? `?${params.toString()}` : ""}`
    window.history.pushState({}, "", newURL)
  }

  const handleSearch = (query: string, location: string) => {
    setSearchQuery(query)
    setSearchLocation(location)
    setCurrentPage(1)
    updateURL(query, location, 1, sortBy)
    loadPublications(query, location, 1, sortBy)
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setCurrentPage(1)
    updateURL(searchQuery, searchLocation, 1, newSort)
    loadPublications(searchQuery, searchLocation, 1, newSort)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL(searchQuery, searchLocation, page, sortBy)
    loadPublications(searchQuery, searchLocation, page, sortBy)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchLocation("")
    setCurrentPage(1)
    setSortBy("date_desc")
    window.history.pushState({}, "", "/search")
    loadPublications("", "", 1, "date_desc")
  }

  const hasActiveSearch = searchQuery || searchLocation

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero avec recherche */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                Rechercher du <span className="text-primary">matériel</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Trouvez exactement ce dont vous avez besoin près de chez vous
              </p>
            </div>

            <SearchBar onSearch={handleSearch} initialQuery={searchQuery} initialLocation={searchLocation} />
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtres actifs */}
          {hasActiveSearch && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Recherche active :</span>
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    "{searchQuery}"
                    <button
                      onClick={() => handleSearch("", searchLocation)}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {searchLocation && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    📍 {searchLocation}
                    <button
                      onClick={() => handleSearch(searchQuery, "")}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearSearch}>
                  Effacer tout
                </Button>
              </div>
            </div>
          )}

          {/* Barre d'outils */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Recherche en cours..."
                : `${total} résultat${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`}
            </p>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Plus récent</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="popularity">Popularité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Résultats */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <PublicationSkeleton key={index} />
              ))}
            </div>
          ) : publications.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {publications.map((publication) => (
                  <PublicationCard key={publication.id} publication={publication} />
                ))}
              </div>

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          ) : (
            <EmptyState
              title={hasActiveSearch ? "Aucun résultat trouvé" : "Commencez votre recherche"}
              description={
                hasActiveSearch
                  ? "Essayez avec d'autres mots-clés ou élargissez votre zone de recherche."
                  : "Utilisez la barre de recherche ci-dessus pour trouver le matériel dont vous avez besoin."
              }
              action={
                hasActiveSearch
                  ? {
                      label: "Effacer la recherche",
                      onClick: clearSearch,
                    }
                  : undefined
              }
              showCreateButton={hasActiveSearch}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
