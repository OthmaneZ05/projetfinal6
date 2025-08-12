"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { PublicationsTable } from "@/components/dashboard/publications-table"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3 } from "lucide-react"
import { DashboardAPI, type DashboardStats, type UserPublication } from "@/lib/dashboard-api"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [publications, setPublications] = useState<UserPublication[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingPublications, setIsLoadingPublications] = useState(true)

  const { user } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    loadDashboardData()
  }, [user, router])

  const loadDashboardData = async () => {
    try {
      // Charger les statistiques
      const statsData = await DashboardAPI.getDashboardStats()
      setStats(statsData)
      setIsLoadingStats(false)

      // Charger les publications
      const publicationsData = await DashboardAPI.getUserPublications(1, 5)
      setPublications(publicationsData.publications)
      setIsLoadingPublications(false)
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
      })
      setIsLoadingStats(false)
      setIsLoadingPublications(false)
    }
  }

  const handleToggleAvailability = async (id: number) => {
    await DashboardAPI.toggleAvailability(id)
    // Recharger les publications
    const publicationsData = await DashboardAPI.getUserPublications(1, 5)
    setPublications(publicationsData.publications)
  }

  const handleDeletePublication = async (id: number) => {
    await DashboardAPI.deletePublication(id)
    // Recharger les publications
    const publicationsData = await DashboardAPI.getUserPublications(1, 5)
    setPublications(publicationsData.publications)
  }

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
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Bonjour {user.first_name}, voici un aperçu de votre activité</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/publications">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Voir tout
                </Button>
              </Link>
              <Link href="/publications/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle publication
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            {/* Cartes statistiques */}
            <StatsCards
              stats={
                stats || {
                  totalPublications: 0,
                  totalViews: 0,
                  totalRevenue: 0,
                  activePublications: 0,
                }
              }
              isLoading={isLoadingStats}
            />

            {/* Graphique d'activité */}
            <ActivityChart data={stats?.monthlyViews || []} isLoading={isLoadingStats} />

            {/* Tableau des publications récentes */}
            <PublicationsTable
              publications={publications}
              isLoading={isLoadingPublications}
              onToggleAvailability={handleToggleAvailability}
              onDelete={handleDeletePublication}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
