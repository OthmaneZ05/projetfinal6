"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ActivityChartProps {
  data: { date: string; views: number }[]
  isLoading?: boolean
}

export function ActivityChart({ data, isLoading }: ActivityChartProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in-up animate-delay-200">
      <CardHeader>
        <CardTitle>Activité des 7 derniers jours</CardTitle>
        <CardDescription>Nombre de vues de vos publications</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
              }
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              }
              formatter={(value) => [`${value} vues`, "Vues"]}
            />
            <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
