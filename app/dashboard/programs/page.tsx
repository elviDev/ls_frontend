"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Radio,
  User,
  Clock,
  Tv,
} from "lucide-react";
import { usePrograms, useDeleteProgram } from "@/hooks/use-programs";
import {
  useProgramStore,
  ProgramCategory,
  ProgramStatus,
} from "@/stores/program-store";

const categoryColors = {
  TALK_SHOW: "bg-emerald-100 text-emerald-800",
  MUSIC: "bg-amber-100 text-amber-800",
  TECHNOLOGY: "bg-green-100 text-green-800",
  BUSINESS: "bg-yellow-100 text-yellow-800",
  INTERVIEW: "bg-teal-100 text-teal-800",
  SPORTS: "bg-lime-100 text-lime-800",
  NEWS: "bg-gray-100 text-gray-800",
  ENTERTAINMENT: "bg-amber-100 text-amber-800",
  EDUCATION: "bg-emerald-100 text-emerald-800",
};

const statusColors = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  INACTIVE: "bg-amber-100 text-amber-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

export default function ProgramsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { programs, setPrograms } = useProgramStore();
  const { data: allPrograms, isLoading } = usePrograms(); // Load all programs
  const deleteProgram = useDeleteProgram();

  // Update store when data loads
  useEffect(() => {
    if (allPrograms && allPrograms.length > 0) {
      setPrograms(allPrograms);
    }
  }, [allPrograms, setPrograms]);

  // Client-side filtering
  const filteredPrograms = useMemo(() => {
    if (!programs) return [];

    return programs.filter((program) => {
      const matchesSearch =
        !search ||
        program.title.toLowerCase().includes(search.toLowerCase()) ||
        program.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || program.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || program.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [programs, search, categoryFilter, statusFilter]);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;
    deleteProgram.mutate(id);
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900">
            Programs
          </h1>
          <p className="text-emerald-600">
            Manage your radio programs and shows
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/programs/new")}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Program
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="TALK_SHOW">Talk Show</SelectItem>
                <SelectItem value="MUSIC">Music</SelectItem>
                <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="INTERVIEW">Interview</SelectItem>
                <SelectItem value="SPORTS">Sports</SelectItem>
                <SelectItem value="NEWS">News</SelectItem>
                <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                <SelectItem value="EDUCATION">Education</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Programs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPrograms && filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredPrograms.map((program) => (
            <Card
              key={program.id}
              className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              {/* Image Section */}
              <div className="relative">
                {program.image ? (
                  <div className="relative w-full h-48 overflow-hidden">
                    <img
                      src={program.image.replace(
                        "/raw/upload/",
                        "/image/upload/"
                      )}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                    <Radio className="h-12 w-12 text-emerald-600" />
                  </div>
                )}

                {/* Status Badge Overlay */}
                <div className="absolute top-3 right-3">
                  <Badge
                    className={`${statusColors[program.status as keyof typeof statusColors]} shadow-sm`}
                  >
                    {program.status}
                  </Badge>
                </div>

                {/* Action Buttons Overlay */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                      onClick={() =>
                        router.push(`/dashboard/programs/${program.slug}`)
                      }
                      title="View Program"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                      onClick={() =>
                        router.push(`/dashboard/programs/${program.id}/edit`)
                      }
                      title="Edit Program"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <CardContent className="p-4 space-y-3">
                {/* Title and Category */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-gray-900">
                      {program.title}
                    </h3>
                  </div>

                  <Badge
                    variant="secondary"
                    className={`${categoryColors[program.category as keyof typeof categoryColors]} text-xs`}
                  >
                    {formatCategory(program.category)}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {program.description}
                </p>

                {/* Host and Schedule Info */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">
                      {program.host.firstName} {program.host.lastName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span>{program.schedule}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Radio className="h-3 w-3" />
                      <span>{program._count.episodes} episodes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tv className="h-3 w-3" />
                      <span>{program._count.broadcasts} broadcasts</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() =>
                        router.push(`/dashboard/programs/${program.id}`)
                      }
                    >
                      <Radio className="h-3 w-3 mr-1" />
                      Episodes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(program.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radio className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No programs found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first program
            </p>
            <Button
              onClick={() => router.push("/dashboard/programs/new")}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
