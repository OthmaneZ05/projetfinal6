import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const publicationId = Number.parseInt(params.id)

    // Simulation de suppression
    return NextResponse.json({ message: "Publication supprimée avec succès" })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
