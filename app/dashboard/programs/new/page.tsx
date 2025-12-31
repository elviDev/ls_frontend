"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useCreateProgram } from "@/hooks/use-programs";
import { useStaff } from "@/hooks/use-staff";
import { useGenres } from "@/hooks/use-genres";
import { useAssets } from "@/hooks/use-assets";
import { ProgramCategory, ProgramStatus } from "@/stores/program-store";

export default function NewProgramPage() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { data: staffData } = useStaff();
  const { data: genres } = useGenres();
  const { data: assetsData } = useAssets({ type: 'IMAGE', perPage: 50, page: 1, search: '' });
  const createProgram = useCreateProgram();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as ProgramCategory | "",
    schedule: "",
    hostId: "",
    genreId: "",
    status: "ACTIVE" as ProgramStatus,
    image: "" as string | undefined,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedImage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData
    };

    // Handle image separately if needed
    if (uploadedFile) {
      const formDataWithFile = new FormData();
      Object.entries(submitData).forEach(([key, value]) => {
        if (value) formDataWithFile.append(key, value);
      });
      formDataWithFile.append("image", uploadedFile);
      createProgram.mutate(formDataWithFile, {
        onSuccess: () => router.push("/dashboard/programs"),
      });
    } else {
      if (selectedImage) {
        (submitData as any).image = selectedImage;
      }
      createProgram.mutate(submitData, {
        onSuccess: () => router.push("/dashboard/programs"),
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Program
        </h1>
        <p className="text-muted-foreground">
          Add a new radio program to your lineup
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Program Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: value as ProgramCategory,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ProgramCategory.TALK_SHOW}>
                          Talk Show
                        </SelectItem>
                        <SelectItem value={ProgramCategory.MUSIC}>
                          Music
                        </SelectItem>
                        <SelectItem value={ProgramCategory.TECHNOLOGY}>
                          Technology
                        </SelectItem>
                        <SelectItem value={ProgramCategory.BUSINESS}>
                          Business
                        </SelectItem>
                        <SelectItem value={ProgramCategory.INTERVIEW}>
                          Interview
                        </SelectItem>
                        <SelectItem value={ProgramCategory.SPORTS}>
                          Sports
                        </SelectItem>
                        <SelectItem value={ProgramCategory.NEWS}>
                          News
                        </SelectItem>
                        <SelectItem value={ProgramCategory.ENTERTAINMENT}>
                          Entertainment
                        </SelectItem>
                        <SelectItem value={ProgramCategory.EDUCATION}>
                          Education
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: value as ProgramStatus,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ProgramStatus.ACTIVE}>
                          Active
                        </SelectItem>
                        <SelectItem value={ProgramStatus.INACTIVE}>
                          Inactive
                        </SelectItem>
                        <SelectItem value={ProgramStatus.ARCHIVED}>
                          Archived
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        schedule: e.target.value,
                      }))
                    }
                    placeholder="e.g., Weekdays, 9AM - 11AM"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="host">Host</Label>
                    <Select
                      value={formData.hostId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, hostId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select host" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffData?.staff?.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="genre">Genre (Optional)</Label>
                    <Select
                      value={formData.genreId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, genreId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres?.map((genre) => (
                          <SelectItem key={genre.id} value={genre.id}>
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="assets" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assets">From Assets</TabsTrigger>
                    <TabsTrigger value="upload">Upload New</TabsTrigger>
                  </TabsList>

                  <TabsContent value="assets" className="space-y-4">
                    {selectedImage && (
                      <div className="mb-4">
                        <Label>Current Selection</Label>
                        <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                          <Image
                            src={selectedImage}
                            alt="Selected image"
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setSelectedImage("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {assetsData?.assets?.map((asset) => (
                        <div
                          key={asset.id}
                          className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                            selectedImage === asset.url ? "border-primary" : "border-muted"
                          }`}
                          onClick={() => {
                            setSelectedImage(asset.url);
                            setUploadedFile(null);
                            setPreviewUrl("");
                          }}
                        >
                          <Image
                            src={asset.url}
                            alt={asset.originalName}
                            width={100}
                            height={100}
                            className="w-full h-20 object-cover"
                          />
                          {selectedImage === asset.url && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Badge>Selected</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    {previewUrl ? (
                      <div className="relative">
                        <Label>Upload Preview</Label>
                        <div className="relative w-full h-32 border rounded-lg overflow-hidden mt-2">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setUploadedFile(null);
                              setPreviewUrl("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload image
                          </p>
                        </label>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createProgram.isPending}
                className="flex-1"
              >
                {createProgram.isPending ? "Creating..." : "Create Program"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
