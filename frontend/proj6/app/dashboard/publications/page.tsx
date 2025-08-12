"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PublicationsTable } from "@/components/dashboard/publications-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"
import { DashboardAPI, type UserPublication } from "@/lib/dashboard-api"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardPublicationsPage() {
  const [publications, setPublications] = useState<UserPublication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { user } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    loadPublications()
  }, [user, router])

  const loadPublications = async () => {
    setIsLoading(true)
    try {
      const data = await DashboardAPI.getUserPublications()
      setPublications(data.publications)
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de charger vos publications",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAvailability = async (id: number) => {
    await DashboardAPI.toggleAvailability(id)
    loadPublications()
  }

  const handleDeletePublication = async (id: number) => {
    await DashboardAPI.deletePublication(id)
    loadPublications()
  }

  // Filtrer les publications
  const filteredPublications = publications.filter((pub) => {
    const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && pub.is_available) ||
      (statusFilter === "unavailable" && !pub.is_available)

    return matchesSearch && matchesStatus
  })

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Mes publications</h1>
              <p className="text-muted-foreground">Gérez toutes vos annonces en un seul endroit</p>
            </div>
            <Link href="/publications/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle publication
              </Button>
            </Link>
          </div>

          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher une publication..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les publications</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="unavailable">Non disponibles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          <PublicationsTable
            publications={filteredPublications}
            isLoading={isLoading}
            onToggleAvailability={handleToggleAvailability}
            onDelete={handleDeletePublication}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
