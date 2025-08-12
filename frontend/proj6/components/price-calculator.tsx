"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Calculator, Euro } from "lucide-react"
import { format, differenceInDays, addDays, isBefore, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface PriceCalculatorProps {
  pricePerDay: number
  depositRequired: number
  unavailableDates?: Date[]
  onBooking?: (startDate: Date, endDate: Date, total: number) => void
}

export function PriceCalculator({
  pricePerDay,
  depositRequired,
  unavailableDates = [],
  onBooking,
}: PriceCalculatorProps) {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [isEndOpen, setIsEndOpen] = useState(false)

  const today = startOfDay(new Date())
  const maxDate = addDays(today, 365) // Réservation max 1 an à l'avance

  // Calculer le nombre de jours et le prix total
  const days = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0
  const subtotal = days * pricePerDay
  const total = subtotal + depositRequired

  // Vérifier si les dates sont disponibles
  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      (unavailableDate) => format(date, "yyyy-MM-dd") === format(unavailableDate, "yyyy-MM-dd"),
    )
  }

  // Réinitialiser la date de fin si elle devient invalide
  useEffect(() => {
    if (startDate && endDate && isBefore(endDate, startDate)) {
      setEndDate(undefined)
    }
  }, [startDate, endDate])

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date)
    setIsStartOpen(false)
    // Si la date de fin est antérieure à la nouvelle date de début, la réinitialiser
    if (date && endDate && isBefore(endDate, date)) {
      setEndDate(undefined)
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date)
    setIsEndOpen(false)
  }

  const handleBooking = () => {
    if (startDate && endDate && onBooking) {
      onBooking(startDate, endDate, total)
    }
  }

  const isBookingValid = startDate && endDate && days > 0

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Calculateur de prix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prix de base */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary flex items-center justify-center">
            <Euro className="h-6 w-6 mr-1" />
            {pricePerDay}€
          </div>
          <p className="text-sm text-muted-foreground">par jour</p>
        </div>

        {/* Sélection des dates */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Date de début */}
            <div>
              <label className="text-sm font-medium mb-2 block">Début</label>
              <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM", { locale: fr }) : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateSelect}
                    disabled={(date) => isBefore(date, today) || isDateUnavailable(date)}
                    fromDate={today}
                    toDate={maxDate}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date de fin */}
            <div>
              <label className="text-sm font-medium mb-2 block">Fin</label>
              <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    disabled={!startDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM", { locale: fr }) : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateSelect}
                    disabled={(date) => !startDate || isBefore(date, startDate) || isDateUnavailable(date)}
                    fromDate={startDate}
                    toDate={maxDate}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Durée sélectionnée */}
          {isBookingValid && (
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                {days} jour{days > 1 ? "s" : ""} sélectionné{days > 1 ? "s" : ""}
              </Badge>
            </div>
          )}
        </div>

        {/* Calcul du prix */}
        {isBookingValid && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>
                {pricePerDay}€ × {days} jour{days > 1 ? "s" : ""}
              </span>
              <span>{subtotal}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Caution</span>
              <span>{depositRequired}€</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{subtotal}€</span>
            </div>
            <p className="text-xs text-muted-foreground">La caution vous sera restituée après retour du matériel</p>
          </div>
        )}

        {/* Bouton de réservation */}
        <Button
          className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          disabled={!isBookingValid}
          onClick={handleBooking}
        >
          {isBookingValid ? `Réserver pour ${subtotal}€` : "Sélectionnez vos dates"}
        </Button>

        {/* Dates indisponibles */}
        {unavailableDates.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Dates indisponibles :</p>
            <div className="flex flex-wrap gap-1">
              {unavailableDates.slice(0, 5).map((date, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {format(date, "dd/MM", { locale: fr })}
                </Badge>
              ))}
              {unavailableDates.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{unavailableDates.length - 5} autres
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
