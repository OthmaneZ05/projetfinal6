"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  isLoading: boolean
  error: string | null
}

interface RegisterData {
  first_name: string
  last_name: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_USER;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger le token depuis localStorage au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token")
    if (savedToken) {
      setToken(savedToken)
      fetchUserProfile(savedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUserProfile = async (auth_token: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token invalide, le supprimer
        localStorage.removeItem("auth_token")
        setToken(null)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du profil:", err)
      localStorage.removeItem("auth_token")
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        const { access_token } = data
        setToken(access_token)
        localStorage.setItem("auth_token", access_token)
        await fetchUserProfile(access_token)
      } else {
        throw new Error(data.message || "Erreur de connexion")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    console.log("Tentative d'inscription avec les données :", userData);
    console.log("URL de l'API pour l'inscription :", `${API_BASE_URL}/users/register`);
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      console.log("Réponse brute de l'API :", response);

      const data = await response.json()
      console.log("Données de la réponse (JSON) :", data);


      if (response.ok) {
        console.log("Inscription réussie, tentative de connexion automatique.");
        // Connexion automatique après inscription
        await login(userData.email, userData.password)
      } else {
        console.error("L'API a retourné une erreur :", response.status, response.statusText, data);
        throw new Error(data.message || "Erreur lors de l'inscription")
      }
    } catch (err) {
      console.error("Erreur catchée dans la fonction register :", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (userData: Partial<User>) => {
    if (!user || !token) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/users/update/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser({ ...user, ...data })
      } else {
        throw new Error(data.message || "Erreur lors de la mise à jour")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateProfile,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
