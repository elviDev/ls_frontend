"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePrograms } from "@/hooks/use-programs";

export default function FeaturedPrograms() {
  const { data: programs = [], isLoading } = usePrograms({ featured: true, limit: 3 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden h-full animate-pulse">
            <div className="h-40 bg-gray-200"></div>
            <CardContent className="p-5">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {programs.map((program) => (
        <Link href={`/programs/${program.slug}`} key={program.id}>
          <Card className="overflow-hidden hover:shadow-md transition-all h-full">
            <div className="relative h-40">
              <Image
                src={program.image || "/placeholder.svg?height=200&width=400"}
                alt={program.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-brand-600 hover:bg-brand-700">
                  {program.category.replace("_", " ")}
                </Badge>
              </div>
            </div>
            <CardContent className="p-5">
              <h3 className="font-semibold text-lg mb-1">{program.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {program.host
                  ? `with ${program.host.firstName} ${program.host.lastName}`
                  : "No host assigned"}
              </p>
              <div className="text-xs font-medium bg-purple-100 text-brand-800 px-3 py-1 rounded-full inline-block">
                {program.schedule}
              </div>
              {program._count && (program._count.broadcasts > 0 || program._count.episodes > 0) && (
                <p className="text-xs text-muted-foreground mt-2">
                  {program._count.broadcasts || 0} broadcasts •{" "}
                  {program._count.episodes || 0} episodes
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
      {programs.length === 0 && !isLoading && (
        <div className="col-span-3 text-center py-8">
          <p className="text-muted-foreground">
            No programs available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
