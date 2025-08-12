"use client"

export interface UserPublication {
  id: number
  title: string
  description: string
  category: "bricolage" | "sport" | "jardinage" | "electromenager" | "transport" | "autre"
  price_per_day: number
  deposit_required: number
  location: string
  condition: "neuf" | "excellent" | "bon" | "acceptable"
  is_available: boolean
  images: string[]
  view_count: number
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalPublications: number
  totalViews: number
  totalRevenue: number
  activePublications: number
  monthlyViews: { date: string; views: number }[]
  categoryDistribution: { category: string; count: number }[]
}

export interface CreatePublicationData {
  title: string
  description: string
  category: string
  price_per_day: number
  deposit_required: number
  location: string
  condition: string
  images: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_PUBLICATIONS;

export class DashboardAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  static async getUserPublications(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/publications/user?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des publications")
    }

    return response.json()
  }

  static async createPublication(data: CreatePublicationData) {
    const response = await fetch(`${API_BASE_URL}/publications/create`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Erreur lors de la création")
    }

    return response.json()
  }

  static async updatePublication(id: number, data: Partial<CreatePublicationData>) {
    const response = await fetch(`${API_BASE_URL}/publications/${id}/update`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour")
    }

    return response.json()
  }

  static async deletePublication(id: number) {
    const response = await fetch(`${API_BASE_URL}/publications/${id}/delete`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression")
    }

    return response.json()
  }

  static async toggleAvailability(id: number) {
    const response = await fetch(`${API_BASE_URL}/publications/${id}/toggle-availability`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour")
    }

    return response.json()
  }

  static async getDashboardStats(): Promise<DashboardStats> {
    // Simulation des statistiques
    return {
      totalPublications: 12,
      totalViews: 1247,
      totalRevenue: 850,
      activePublications: 8,
      monthlyViews: [
        { date: "2024-01-01", views: 45 },
        { date: "2024-01-02", views: 52 },
        { date: "2024-01-03", views: 38 },
        { date: "2024-01-04", views: 61 },
        { date: "2024-01-05", views: 55 },
        { date: "2024-01-06", views: 67 },
        { date: "2024-01-07", views: 43 },
      ],
      categoryDistribution: [
        { category: "bricolage", count: 5 },
        { category: "sport", count: 3 },
        { category: "jardinage", count: 2 },
        { category: "transport", count: 2 },
      ],
    }
  }
}
