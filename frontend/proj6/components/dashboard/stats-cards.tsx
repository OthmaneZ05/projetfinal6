"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Eye, Euro, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  stats: {
    totalPublications: number
    totalViews: number
    totalRevenue: number
    activePublications: number
  }
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: "Publications totales",
      value: stats.totalPublications,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      change: "+12%",
    },
    {
      title: "Vues totales",
      value: stats.totalViews,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      change: "+8%",
    },
    {
      title: "Revenus estimés",
      value: `${stats.totalRevenue}€`,
      icon: Euro,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      change: "+15%",
    },
    {
      title: "Publications actives",
      value: stats.activePublications,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      change: "+3%",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card
            key={index}
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <Icon className={cn("h-4 w-4", card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{card.value}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {card.change} ce mois
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
