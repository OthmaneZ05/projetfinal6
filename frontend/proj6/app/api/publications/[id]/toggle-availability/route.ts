import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const publicationId = Number.parseInt(params.id)

    // Simulation de toggle
    const updatedPublication = {
      id: publicationId,
      is_available: Math.random() > 0.5, // Simulation
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(updatedPublication)
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}
