"use client"

import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BroadcastFilters, Program } from "../types"

interface BroadcastFiltersProps {
  filters: BroadcastFilters
  programs: Program[]
  onFiltersChange: (filters: BroadcastFilters) => void
}

export function BroadcastFiltersComponent({ filters, programs, onFiltersChange }: BroadcastFiltersProps) {
  const updateFilter = (key: keyof BroadcastFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search broadcasts..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => updateFilter("search", "")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Select value={filters.program} onValueChange={(value) => updateFilter("program", value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            <SelectItem value="null">No Program</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={filters.status} onValueChange={(value) => updateFilter("status", value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="LIVE">Live</TabsTrigger>
          <TabsTrigger value="SCHEDULED">Scheduled</TabsTrigger>
          <TabsTrigger value="READY">Ready</TabsTrigger>
          <TabsTrigger value="ENDED">Ended</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}