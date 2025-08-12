"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, Plus, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Rechercher", href: "/search" },
    { name: "Catalogue", href: "/publications" },
    { name: "Publier", href: "/publier" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">L</span>
            </div>
            <span className="text-xl font-bold text-primary">Loc'Partage</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <ModeToggle />
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  {user.first_name}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Déconnexion
                </Button>
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Publier
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push("/auth/login")}>
                  <User className="h-4 w-4 mr-2" />
                  Se connecter
                </Button>
                <Button
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  onClick={() => router.push("/auth/register")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publier
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t">
                    {user ? (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start mb-2"
                          onClick={() => {
                            router.push("/profile")
                            setIsOpen(false)
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Mon profil
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start mb-2"
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                        >
                          Déconnexion
                        </Button>
                        <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                          <Plus className="h-4 w-4 mr-2" />
                          Publier une annonce
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start mb-2"
                          onClick={() => {
                            router.push("/auth/login")
                            setIsOpen(false)
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Se connecter
                        </Button>
                        <Button
                          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                          onClick={() => {
                            router.push("/auth/register")
                            setIsOpen(false)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer un compte
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
