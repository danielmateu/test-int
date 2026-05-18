import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Seleccionar fecha" }: DatePickerProps) {
  // Try to parse the incoming value if it exists, otherwise keep it undefined
  let dateValue: Date | undefined = undefined;
  if (value) {
    // Basic attempt to parse a format like "MM/yyyy" or "yyyy-MM-dd"
    // Since we output as string, we need to handle parsing.
    // To keep it simple, we'll assume the string could be ISO or just a display string.
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      dateValue = parsed;
    }
  }

  const handleSelect = (date: Date | undefined) => {
    if (date && onChange) {
      // Format to a readable month/year string for the CV
      const formatted = format(date, "MMM yyyy", { locale: es });
      // Capitalize first letter
      const finalFormat = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      onChange(finalFormat);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? value : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}
