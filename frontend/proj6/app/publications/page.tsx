"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PublicationCard } from "@/components/publication-card"
import { PublicationSkeleton } from "@/components/publication-skeleton"
import { FilterSidebar } from "@/components/filter-sidebar"
import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { EmptyState } from "@/components/empty-state"
import { QuickViewModal } from "@/components/quick-view-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Filter, SlidersHorizontal } from "lucide-react"
import { PublicationsAPI, type Publication, type PublicationFilters } from "@/lib/publications"
import { useToast } from "@/components/ui/toast"

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<PublicationFilters>({})
  const [sortBy, setSortBy] = useState<string>("date_desc")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [quickViewPublication, setQuickViewPublication] = useState<Publication | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const { addToast } = useToast()

  // Initialiser les filtres depuis l'URL
  useEffect(() => {
    const initialFilters: PublicationFilters = {
      search: searchParams.get("search") || undefined,
      location: searchParams.get("location") || undefined,
      category: searchParams.get("category") || undefined,
      min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
      max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      sort: (searchParams.get("sort") as any) || "date_desc",
    }

    setFilters(initialFilters)
    setSortBy(initialFilters.sort || "date_desc")
    setCurrentPage(initialFilters.page || 1)
  }, [searchParams])

  // Charger les publications
  useEffect(() => {
    loadPublications()
  }, [filters, sortBy, currentPage])

  const loadPublications = async () => {
    setIsLoading(true)
    try {
      const response = await PublicationsAPI.getPublications({
        ...filters,
        sort: sortBy as any,
        page: currentPage,
      })

      setPublications(response.publications)
      setTotalPages(response.total_pages)
      setTotal(response.total)
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de charger les publications",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateURL = (newFilters: PublicationFilters, newSort?: string, newPage?: number) => {
    const params = new URLSearchParams()

    const allFilters = { ...newFilters }
    if (newSort) allFilters.sort = newSort as any
    if (newPage) allFilters.page = newPage

    Object.entries(allFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString())
      }
    })

    router.push(`/publications?${params.toString()}`)
  }

  const handleFiltersChange = (newFilters: PublicationFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateURL(newFilters, sortBy, 1)
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setCurrentPage(1)
    updateURL(filters, newSort, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL(filters, sortBy, page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearch = (query: string, location: string) => {
    const newFilters = {
      ...filters,
      search: query || undefined,
      location: location || undefined,
    }
    handleFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    setFilters({})
    setSortBy("date_desc")
    setCurrentPage(1)
    router.push("/publications")
  }

  const handleQuickView = (publication: Publication) => {
    setQuickViewPublication(publication)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero avec recherche */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                Découvrez nos <span className="text-primary">publications</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Trouvez le matériel parfait pour vos projets parmi {total} annonces disponibles
              </p>
            </div>

            <SearchBar onSearch={handleSearch} initialQuery={filters.search} initialLocation={filters.location} />
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filtres - Desktop */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />
              </div>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1">
              {/* Barre d'outils */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? "Chargement..." : `${total} résultat${total > 1 ? "s" : ""}`}
                  </p>

                  {/* Bouton filtres mobile */}
                  <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtres
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <FilterSidebar
                        filters={filters}
                        onFiltersChange={(newFilters) => {
                          handleFiltersChange(newFilters)
                          setShowMobileFilters(false)
                        }}
                        className="border-0 shadow-none"
                      />
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="flex items-center gap-4">
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
              </div>

              {/* Grille des publications */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <PublicationSkeleton key={index} />
                  ))}
                </div>
              ) : publications.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {publications.map((publication) => (
                      <PublicationCard key={publication.id} publication={publication} onQuickView={handleQuickView} />
                    ))}
                  </div>

                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
              ) : (
                <EmptyState
                  title="Aucune publication trouvée"
                  description="Essayez de modifier vos critères de recherche ou explorez d'autres catégories."
                  action={{
                    label: "Effacer les filtres",
                    onClick: clearAllFilters,
                  }}
                  showCreateButton
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal Quick View */}
      <QuickViewModal
        publication={quickViewPublication}
        isOpen={!!quickViewPublication}
        onClose={() => setQuickViewPublication(null)}
      />
    </div>
  )
}
