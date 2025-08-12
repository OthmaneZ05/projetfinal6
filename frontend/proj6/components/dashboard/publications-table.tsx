"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, Eye, Plus } from "lucide-react"
import type { UserPublication } from "@/lib/dashboard-api"
import { CATEGORY_LABELS, CONDITION_COLORS, CONDITION_LABELS } from "@/lib/publications"
import { useToast } from "@/components/ui/toast"
import Link from "next/link"
import Image from "next/image"
import { Package } from "lucide-react" // Import the Package component

interface PublicationsTableProps {
  publications: UserPublication[]
  isLoading?: boolean
  onToggleAvailability: (id: number) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function PublicationsTable({ publications, isLoading, onToggleAvailability, onDelete }: PublicationsTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({})
  const { addToast } = useToast()

  const handleToggleAvailability = async (id: number) => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }))
    try {
      await onToggleAvailability(id)
      addToast({
        type: "success",
        title: "Disponibilité mise à jour",
        description: "Le statut de votre publication a été modifié",
      })
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de modifier la disponibilité",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await onDelete(deleteId)
      addToast({
        type: "success",
        title: "Publication supprimée",
        description: "Votre publication a été supprimée avec succès",
      })
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de supprimer la publication",
      })
    } finally {
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 animate-pulse">
                <div className="h-12 w-12 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (publications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes publications</CardTitle>
          <CardDescription>Gérez vos annonces et suivez leurs performances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune publication</h3>
            <p className="text-muted-foreground mb-6">Commencez par créer votre première annonce</p>
            <Link href="/publications/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer une publication
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mes publications</CardTitle>
            <CardDescription>Gérez vos annonces et suivez leurs performances</CardDescription>
          </div>
          <Link href="/publications/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle publication
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix/jour</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Vues</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publications.map((publication) => (
                  <TableRow key={publication.id}>
                    <TableCell>
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={publication.images[0] || "/placeholder.svg"}
                          alt={publication.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium line-clamp-1">{publication.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{publication.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{CATEGORY_LABELS[publication.category]}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{publication.price_per_day}€</TableCell>
                    <TableCell>
                      <Badge className={CONDITION_COLORS[publication.condition]}>
                        {CONDITION_LABELS[publication.condition]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                        {publication.view_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={publication.is_available}
                        onCheckedChange={() => handleToggleAvailability(publication.id)}
                        disabled={loadingStates[publication.id]}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/publications/${publication.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/publications/edit/${publication.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(publication.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la publication</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
