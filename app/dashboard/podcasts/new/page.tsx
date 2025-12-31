"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  FileAudio,
  Image as ImageIcon,
  Save,
  Eye,
  Clock,
  User,
  Tag,
  Calendar,
  Mic,
  Users,
  Mail,
  UserPlus,
  Send,
  Search,
  Music,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useGenres,
  useCreatePodcast,
  usePodcast,
  useUpdatePodcast,
} from "@/hooks/use-podcasts";
import { usePodcastStore } from "@/stores/podcast-store";
import { useUsers, useSearchUser } from "@/hooks/use-users";
import { useStaff } from "@/hooks/use-staff";
import { useAssets } from "@/hooks/use-assets";
import { DatePicker } from "@/components/ui/date-picker";

const podcastSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.string().optional(),
  hostId: z.string().min(1, "Host is required"),
  genreId: z.string().min(1, "Genre is required"),
  releaseDate: z.string().min(1, "Release date is required"),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

type PodcastFormData = z.infer<typeof podcastSchema>;

type Genre = {
  id: string;
  name: string;
  slug: string;
};

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type Guest = {
  id?: string;
  name: string;
  email: string;
  isExistingUser: boolean;
  invitationSent?: boolean;
};

type Asset = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
  url: string;
  description?: string;
  tags?: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export default function NewPodcastPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setPodcasts } = usePodcastStore();
  const { data: genres } = useGenres();
  const { data: users = [] } = useUsers();
  const searchUserMutation = useSearchUser();
  const { data: assetsData } = useAssets();
  const assets = assetsData?.assets || [];
  const createPodcast = useCreatePodcast();
  const updatePodcast = useUpdatePodcast();

  // Check if we're in edit mode
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("edit");
    setEditId(id);
    setIsEditMode(!!id);
  }, []);

  // Fetch podcast data if in edit mode
  const { data: existingPodcast } = usePodcast(editId || "");

  const { data: staffData } = useStaff();
  const staff = staffData?.staff || [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Asset management
  const [selectedCoverAssetId, setSelectedCoverAssetId] = useState("");
  const [isImageAssetDialogOpen, setIsImageAssetDialogOpen] = useState(false);
  const [imageAssetSearchQuery, setImageAssetSearchQuery] = useState("");
  const [uploadingNewAsset, setUploadingNewAsset] = useState(false);

  // Guest management
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestDialog, setGuestDialog] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [searchingUsers, setSearchingUsers] = useState(false);

  const form = useForm<PodcastFormData>({
    resolver: zodResolver(podcastSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      hostId: "",
      genreId: "",
      releaseDate: new Date().toISOString().split("T")[0],
      tags: "",
      status: "draft",
    },
  });

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (
      isEditMode &&
      existingPodcast &&
      staff.length > 0 &&
      genres &&
      genres.length > 0
    ) {
      console.log("=== EDIT MODE DATA POPULATION ===");
      console.log("Existing podcast data:", existingPodcast);
      console.log("Available staff:", staff);
      console.log("Available genres:", genres);

      const formData = {
        title: existingPodcast.title || "",
        description: existingPodcast.description || "",
        category: existingPodcast.category || "",
        hostId: existingPodcast.hostId || existingPodcast.authorId || "", // Use the hostId field returned by backend
        genreId: existingPodcast.genreId || "",
        releaseDate: existingPodcast.releaseDate
          ? new Date(existingPodcast.releaseDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        tags: existingPodcast.tags || "",
        status: (existingPodcast.status?.toLowerCase() === "published"
          ? "published"
          : "draft") as "draft" | "published",
      };

      console.log("Form data being set:", formData);
      console.log(
        "Host mapping - authorId:",
        existingPodcast.authorId,
        "staff member found:",
        staff.find((s) => s.id === existingPodcast.authorId)
      );
      console.log(
        "Genre mapping - genreId:",
        existingPodcast.genreId,
        "genre found:",
        genres?.find((g) => g.id === existingPodcast.genreId)
      );

      // Use setValue for each field to ensure Select components update
      Object.entries(formData).forEach(([key, value]) => {
        form.setValue(key as keyof PodcastFormData, value);
      });

      // Set existing image
      if (existingPodcast.coverImage || existingPodcast.image) {
        setImagePreview(
          existingPodcast.coverImage || existingPodcast.image || null
        );
      }

      // Set existing tags
      if (existingPodcast.tags) {
        const tagArray = existingPodcast.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        setTags(tagArray);
      }
    }
  }, [isEditMode, existingPodcast, staff, genres, form]);

  const addGuest = async () => {
    if (!guestName.trim() || !guestEmail.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both name and email for the guest",
        variant: "destructive",
      });
      return;
    }

    // Check if email is already in guests list
    if (guests.some((g) => g.email === guestEmail)) {
      toast({
        title: "Duplicate guest",
        description: "This guest is already added",
        variant: "destructive",
      });
      return;
    }

    // Search for existing user
    setSearchingUsers(true);
    try {
      const existingUser = await searchUserMutation.mutateAsync(guestEmail);

      const newGuest: Guest = {
        id: existingUser?.id,
        name: existingUser?.name || guestName,
        email: guestEmail,
        isExistingUser: !!existingUser,
        invitationSent: false,
      };

      setGuests([...guests, newGuest]);
      setGuestName("");
      setGuestEmail("");
      setGuestDialog(false);

      toast({
        title: "Guest added",
        description: existingUser
          ? `${existingUser.name} (existing user) added as guest`
          : `${guestName} will receive an invitation email`,
      });
    } catch (error) {
      console.error("Failed to search user:", error);
      toast({
        title: "Error",
        description: "Failed to search for user",
        variant: "destructive",
      });
    } finally {
      setSearchingUsers(false);
    }
  };

  const removeGuest = (email: string) => {
    setGuests(guests.filter((g) => g.email !== email));
  };

  const sendGuestInvitations = async (
    podcastId: string,
    podcastTitle: string
  ) => {
    const invitationsToSend = guests.filter((g) => !g.isExistingUser);

    if (invitationsToSend.length === 0) return;

    try {
      await apiClient.request("/podcasts/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          podcastId,
          podcastTitle,
          guests: invitationsToSend,
        }),
      });

      toast({
        title: "Invitations sent",
        description: `${invitationsToSend.length} guest invitation(s) sent successfully`,
      });
    } catch (error) {
      console.error("Failed to send invitations:", error);
    }
  };

  const notifyExistingUsers = async (
    podcastId: string,
    podcastTitle: string
  ) => {
    const existingUserGuests = guests.filter((g) => g.isExistingUser);

    if (existingUserGuests.length === 0) return;

    try {
      await apiClient.request("/podcasts/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          podcastId,
          podcastTitle,
          userIds: existingUserGuests.map((g) => g.id).filter(Boolean),
        }),
      });

      toast({
        title: "Notifications sent",
        description: `${existingUserGuests.length} user(s) notified about the podcast invitation`,
      });
    } catch (error) {
      console.error("Failed to send notifications:", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setCoverImage(file);
        setSelectedCoverAssetId("");
        const url = URL.createObjectURL(file);
        setImagePreview(url);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleCoverAssetSelect = (assetId: string) => {
    setSelectedCoverAssetId(assetId);
    setCoverImage(null);
    const selectedAsset = assets.find((asset) => asset.id === assetId);
    if (selectedAsset) {
      setImagePreview(selectedAsset.url);
    }
    setIsImageAssetDialogOpen(false);
  };

  const uploadNewAsset = async (
    file: File,
    type: "IMAGE" | "AUDIO"
  ): Promise<void> => {
    setUploadingNewAsset(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", `Podcast ${type.toLowerCase()} asset`);
      formData.append("tags", `podcast,${type.toLowerCase()}`);

      const newAsset = await apiClient.request("/assets", {
        method: "POST",
        body: formData,
      });

      if (type === "IMAGE") {
        handleCoverAssetSelect((newAsset as any).id);
      }
      toast({
        title: "Success",
        description: "Asset uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload asset",
        variant: "destructive",
      });
    } finally {
      setUploadingNewAsset(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      form.setValue("tags", newTags.join(", "));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags.join(", "));
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const onSubmit = async (data: PodcastFormData) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add cover image
      if (selectedCoverAssetId) {
        console.log("Adding imageAssetId:", selectedCoverAssetId);
        formData.append("imageAssetId", selectedCoverAssetId);
      } else if (coverImage) {
        console.log("Adding coverImage file:", coverImage.name);
        formData.append("coverImage", coverImage);
      }

      // Log all form data
      console.log("Form data being sent:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Add guests data
      formData.append("guests", JSON.stringify(guests));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      let response;
      if (isEditMode && editId) {
        response = await updatePodcast.mutateAsync({
          id: editId,
          data: formData,
        });
      } else {
        response = await createPodcast.mutateAsync(formData);
      }

      const podcast = response as any;

      // Send invitations and notifications only for new podcasts
      if (!isEditMode) {
        await Promise.all([
          sendGuestInvitations(podcast.id, data.title),
          notifyExistingUsers(podcast.id, data.title),
        ]);
      }

      toast({
        title: "Success",
        description: isEditMode
          ? `Podcast "${data.title}" updated successfully!`
          : `Podcast series "${data.title}" created successfully! Now you can add episodes with audio content.`,
      });

      router.push(`/dashboard/podcasts/${podcast.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message ||
          `Failed to ${isEditMode ? "update" : "create"} podcast`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Podcast" : "Create New Podcast"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update your podcast series details"
              : "Create a podcast series. You'll add episodes with audio content separately."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Enter the basic details for your podcast series
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter podcast series title..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your podcast episode..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of your podcast series
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technology">
                              Technology
                            </SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="entertainment">
                              Entertainment
                            </SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="health">
                              Health & Wellness
                            </SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="news">
                              News & Politics
                            </SelectItem>
                            <SelectItem value="comedy">Comedy</SelectItem>
                            <SelectItem value="music">Music</SelectItem>
                            <SelectItem value="arts">Arts & Culture</SelectItem>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                            <SelectItem value="true-crime">
                              True Crime
                            </SelectItem>
                            <SelectItem value="lifestyle">Lifestyle</SelectItem>
                            <SelectItem value="religion">
                              Religion & Spirituality
                            </SelectItem>
                            <SelectItem value="society">
                              Society & Culture
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose a category that best describes your podcast
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hostId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select host from staff" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {staff.map((member: any) => (
                              <SelectItem key={member.id} value={member.id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>
                                    {member.name ||
                                      `${member.firstName || ""} ${member.lastName || ""}`.trim()}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {member.role}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select a staff member to host this podcast series
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Guest Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Guests
                      </CardTitle>
                      <CardDescription>
                        Invite guests to participate in your podcast
                      </CardDescription>
                    </div>
                    <Dialog open={guestDialog} onOpenChange={setGuestDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Guest
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Guest</DialogTitle>
                          <DialogDescription>
                            Add a guest to your podcast. They'll receive an
                            invitation to participate.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="guestName">Guest Name *</Label>
                            <Input
                              id="guestName"
                              placeholder="Enter guest's full name"
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="guestEmail">Email Address *</Label>
                            <Input
                              id="guestEmail"
                              type="email"
                              placeholder="guest@example.com"
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              We'll check if they have an existing account or
                              send an invitation
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setGuestDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={addGuest} disabled={searchingUsers}>
                            {searchingUsers ? "Checking..." : "Add Guest"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {guests.length > 0 ? (
                    <div className="space-y-3">
                      {guests.map((guest) => (
                        <div
                          key={guest.email}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{guest.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {guest.email}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {guest.isExistingUser ? (
                                <Badge variant="secondary">
                                  <User className="h-3 w-3 mr-1" />
                                  Existing User
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Will Invite
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeGuest(guest.email)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No guests added yet</p>
                      <p className="text-sm">
                        Click "Add Guest" to invite participants
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Media Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Media Files
                  </CardTitle>
                  <CardDescription>
                    Upload cover image for your podcast. Audio will be added as
                    episodes after creation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Cover Image Upload */}
                  <div className="space-y-4">
                    <Label>Cover Image</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      {coverImage || selectedCoverAssetId ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                              {(selectedCoverAssetId &&
                                assets.find(
                                  (asset) => asset.id === selectedCoverAssetId
                                )?.url) ||
                              imagePreview ? (
                                <img
                                  src={
                                    selectedCoverAssetId
                                      ? assets.find(
                                          (asset) =>
                                            asset.id === selectedCoverAssetId
                                        )?.url
                                      : imagePreview || undefined
                                  }
                                  alt="Cover preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">
                                {selectedCoverAssetId
                                  ? assets.find(
                                      (asset) =>
                                        asset.id === selectedCoverAssetId
                                    )?.originalName || "Selected Asset"
                                  : coverImage?.name || ""}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCoverAssetId
                                  ? "From asset library"
                                  : coverImage
                                    ? `${(coverImage.size / (1024 * 1024)).toFixed(2)} MB`
                                    : ""}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setCoverImage(null);
                                setImagePreview(null);
                                setSelectedCoverAssetId("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Choose cover image
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Recommended: 1400x1400px, JPG or PNG
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <Dialog
                              open={isImageAssetDialogOpen}
                              onOpenChange={setIsImageAssetDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <Search className="h-4 w-4 mr-2" />
                                  Choose from Assets
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Select Cover Image</DialogTitle>
                                  <DialogDescription>
                                    Choose an image from your asset library or
                                    upload a new one
                                  </DialogDescription>
                                </DialogHeader>
                                <Tabs
                                  defaultValue="existing"
                                  className="w-full"
                                >
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="existing">
                                      Existing Assets
                                    </TabsTrigger>
                                    <TabsTrigger value="upload">
                                      Upload New
                                    </TabsTrigger>
                                  </TabsList>
                                  <TabsContent
                                    value="existing"
                                    className="space-y-4"
                                  >
                                    <div className="relative">
                                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="Search assets..."
                                        value={imageAssetSearchQuery}
                                        onChange={(e) =>
                                          setImageAssetSearchQuery(
                                            e.target.value
                                          )
                                        }
                                        className="pl-9"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                                      {assets
                                        .filter(
                                          (asset) =>
                                            asset.originalName
                                              .toLowerCase()
                                              .includes(
                                                imageAssetSearchQuery.toLowerCase()
                                              ) ||
                                            asset.description
                                              ?.toLowerCase()
                                              .includes(
                                                imageAssetSearchQuery.toLowerCase()
                                              )
                                        )
                                        .map((asset) => (
                                          <div
                                            key={asset.id}
                                            className={`border rounded-lg p-2 cursor-pointer hover:bg-muted transition-colors ${
                                              selectedCoverAssetId === asset.id
                                                ? "border-primary bg-primary/10"
                                                : ""
                                            }`}
                                            onClick={() =>
                                              setSelectedCoverAssetId(asset.id)
                                            }
                                          >
                                            <div className="aspect-square rounded overflow-hidden mb-2">
                                              <img
                                                src={asset.url}
                                                alt={asset.originalName}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                            <p className="text-xs font-medium truncate">
                                              {asset.originalName}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                              {asset.description ||
                                                "No description"}
                                            </p>
                                          </div>
                                        ))}
                                    </div>
                                    {assets.length === 0 && (
                                      <div className="text-center py-8">
                                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                          No image assets found
                                        </p>
                                      </div>
                                    )}
                                  </TabsContent>
                                  <TabsContent
                                    value="upload"
                                    className="space-y-4"
                                  >
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                      <div className="space-y-2 mb-4">
                                        <p className="text-sm font-medium">
                                          Upload new cover image
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          This will be saved to your asset
                                          library for future use
                                        </p>
                                      </div>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            await uploadNewAsset(file, "IMAGE");
                                          }
                                        }}
                                        disabled={uploadingNewAsset}
                                      />
                                      {uploadingNewAsset && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                          Uploading...
                                        </p>
                                      )}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setIsImageAssetDialogOpen(false);
                                      setImageAssetSearchQuery("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      setIsImageAssetDialogOpen(false);
                                      setImageAssetSearchQuery("");
                                      if (selectedCoverAssetId) {
                                        setCoverImage(null);
                                        setImagePreview(null);
                                      }
                                    }}
                                    disabled={!selectedCoverAssetId}
                                  >
                                    Use Selected Image
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <div className="relative flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full pointer-events-none"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload New Image
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {isSubmitting && uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="genreId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genres &&
                              genres.map((genre) => (
                                <SelectItem key={genre.id} value={genre.id}>
                                  {genre.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Date *</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={
                              field.value ? new Date(field.value) : undefined
                            }
                            onDateChange={(date) =>
                              field.onChange(
                                date?.toISOString().split("T")[0] || ""
                              )
                            }
                            placeholder="Select release date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                      />
                      <Button type="button" size="icon" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Publishing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Publishing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                Draft
                              </div>
                            </SelectItem>
                            <SelectItem value="published">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                Published
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Drafts are only visible to staff members
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting
                        ? isEditMode
                          ? "Updating..."
                          : "Creating..."
                        : isEditMode
                          ? "Update Podcast"
                          : "Create Podcast"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Guest Summary */}
              {guests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Guest Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total guests:
                      </span>
                      <span className="font-medium">{guests.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Existing users:
                      </span>
                      <span className="font-medium">
                        {guests.filter((g) => g.isExistingUser).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        New invitations:
                      </span>
                      <span className="font-medium">
                        {guests.filter((g) => !g.isExistingUser).length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
