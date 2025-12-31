"use client"

import { useState } from "react"
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, User, Loader2 } from "lucide-react";
import { usePrograms } from "@/hooks/use-programs";

const categories = [
  { label: "All", value: "all" },
  { label: "Talk Show", value: "TALK_SHOW" },
  { label: "Music", value: "MUSIC" },
  { label: "Technology", value: "TECHNOLOGY" },
  { label: "Business", value: "BUSINESS" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Sports", value: "SPORTS" },
  { label: "News", value: "NEWS" },
  { label: "Entertainment", value: "ENTERTAINMENT" },
  { label: "Education", value: "EDUCATION" }
];

export default function ProgramsPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  
  const { data: programs = [], isLoading, error } = usePrograms(
    activeCategory === "all" ? {} : { category: activeCategory }
  );

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading programs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Programs</h1>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Failed to load programs. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Programs</h1>
        <p className="text-xl text-muted-foreground">
          Discover our diverse lineup of shows covering everything from music
          and technology to business and culture.
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="mb-12">
        <TabsList className="flex flex-wrap h-auto p-1 mb-8">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="mb-1"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent
            key={category.value}
            value={category.value}
            className="mt-0"
          >
            {programs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No programs found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                  <Link href={`/programs/${program.slug}`} key={program.id}>
                    <Card className="overflow-hidden hover:shadow-md transition-all h-full">
                      <div className="relative h-48">
                        <Image
                          src={program.image || "/placeholder.svg"}
                          alt={program.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-brand-600 hover:bg-brand-700">
                            {program.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg mb-1">
                          {program.title}
                        </h3>
                        <div className="flex items-center mb-3 text-sm text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          <span>{program.host ? `${program.host.firstName} ${program.host.lastName}` : 'No host assigned'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {program.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-auto">
                          <div className="text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200 px-3 py-1 rounded-full inline-flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {program.schedule}
                          </div>
                          <div className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1 rounded-full inline-flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {program._count.episodes} episodes
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
