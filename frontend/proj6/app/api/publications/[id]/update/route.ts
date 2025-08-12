import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const publicationId = Number.parseInt(params.id)

    // Simulation de mise à jour
    const updatedPublication = {
      id: publicationId,
      ...body,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(updatedPublication)
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}
