import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()

    // Validation basiquef
    const requiredFields = ["title", "description", "category", "price_per_day", "location", "condition"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Le champ ${field} est requis` }, { status: 400 })
      }
    }

    // Simulation de création
    const newPublication = {
      id: Date.now(),
      ...body,
      is_available: true,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(newPublication, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
