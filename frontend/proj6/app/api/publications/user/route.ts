import { type NextRequest, NextResponse } from "next/server"

// Simulation de données utilisateur
const mockUserPublications = [
  {
    id: 1,
    title: "Perceuse sans fil Bosch",
    description: "Perceuse professionnelle en excellent état",
    category: "bricolage",
    price_per_day: 15,
    deposit_required: 50,
    location: "Paris 11ème",
    condition: "excellent",
    is_available: true,
    images: ["/placeholder.svg?height=200&width=300&text=Perceuse"],
    view_count: 45,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "Vélo électrique Decathlon",
    description: "Vélo électrique parfait pour la ville",
    category: "transport",
    price_per_day: 25,
    deposit_required: 200,
    location: "Paris 11ème",
    condition: "bon",
    is_available: false,
    images: ["/placeholder.svg?height=200&width=300&text=Vélo"],
    view_count: 78,
    created_at: "2024-01-10T14:30:00Z",
    updated_at: "2024-01-20T09:15:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Simulation de pagination
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPublications = mockUserPublications.slice(startIndex, endIndex)

    return NextResponse.json({
      publications: paginatedPublications,
      total: mockUserPublications.length,
      page,
      per_page: limit,
      total_pages: Math.ceil(mockUserPublications.length / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
