"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radio,
  Calendar,
  Clock,
  Play,
  Settings,
  Edit3,
  Share2,
  Crown,
  MoreHorizontal,
  ChevronLeft,
  Activity,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useBroadcastById,
  useDeleteBroadcast,
  useBroadcastSettings,
  useUpdateBroadcastSettings,
  useAddGuest,
  useRemoveGuest,
  useStartBroadcast,
  useEndBroadcast,
} from "@/hooks/use-broadcasts";
import { CreateBroadcastDialog } from "../components/create-broadcast-dialog";
import { useBroadcastStore } from "@/stores/broadcast-store";

export default function BroadcastDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState("overview");
  const { setSelectedBroadcast, setFormData, resetForm } = useBroadcastStore();

  // Queries
  const { data: broadcast, isLoading, error } = useBroadcastById(slug);
  const { data: settings } = useBroadcastSettings(slug);

  // Mutations
  const deleteBroadcastMutation = useDeleteBroadcast();
  const updateSettingsMutation = useUpdateBroadcastSettings();
  const addGuestMutation = useAddGuest();
  const removeGuestMutation = useRemoveGuest();
  const startBroadcastMutation = useStartBroadcast();
  const endBroadcastMutation = useEndBroadcast();

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddGuestDialogOpen, setIsAddGuestDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Form states
  const [newGuest, setNewGuest] = useState({
    name: "",
    title: "",
    role: "",
  });
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when data changes
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Set selected broadcast in store
  useEffect(() => {
    if (broadcast) {
      setSelectedBroadcast(broadcast);
    }
  }, [broadcast, setSelectedBroadcast]);

  const handleDeleteBroadcast = async () => {
    if (
      confirm(
        `Are you sure you want to delete "${(broadcast as any)?.title || "this broadcast"}"?`
      )
    ) {
      await deleteBroadcastMutation.mutateAsync(slug);
      router.push("/dashboard/broadcasts");
    }
  };

  const handleAddGuest = async () => {
    if (!newGuest.name.trim() || !newGuest.role.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    await addGuestMutation.mutateAsync({
      broadcastId: slug,
      guest: {
        name: newGuest.name.trim(),
        title: newGuest.title.trim() || undefined,
        role: newGuest.role.trim(),
      },
    });
    setNewGuest({ name: "", title: "", role: "" });
    setIsAddGuestDialogOpen(false);
  };

  const handleRemoveGuest = async (guestId: string) => {
    await removeGuestMutation.mutateAsync({ broadcastId: slug, guestId });
  };

  const handleSaveSettings = async () => {
    if (!localSettings) return;
    await updateSettingsMutation.mutateAsync({
      id: slug,
      settings: localSettings,
    });
  };

  const handleStartBroadcast = async () => {
    await startBroadcastMutation.mutateAsync(slug);
  };

  const handleEndBroadcast = async () => {
    await endBroadcastMutation.mutateAsync(slug);
  };

  const openEditDialog = () => {
    if (broadcast) {
      // Populate form with existing broadcast data
      const startTime = new Date((broadcast as any).startTime);
      const endTime = new Date((broadcast as any).endTime);

      setFormData({
        title: (broadcast as any).title || "",
        description: (broadcast as any).description || "",
        startTime: startTime,
        endTime: endTime,
        startTimeHour: startTime.getHours().toString().padStart(2, "0"),
        startTimeMinute: startTime.getMinutes().toString().padStart(2, "0"),
        endTimeHour: endTime.getHours().toString().padStart(2, "0"),
        endTimeMinute: endTime.getMinutes().toString().padStart(2, "0"),
        hostId: (broadcast as any).hostId || "",
        programId: (broadcast as any).programId || "",
        bannerId: (broadcast as any).bannerId || "",
        staff: (broadcast as any).staff || [],
        guests: (broadcast as any).guests || [],
      });

      setIsEditDialogOpen(true);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return (
          <Badge variant="destructive" className="animate-pulse">
            <Radio className="h-4 w-4 mr-2" />
            LIVE NOW
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Clock className="h-4 w-4 mr-2" />
            Scheduled
          </Badge>
        );
      case "ENDED":
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200"
          >
            <Activity className="h-4 w-4 mr-2" />
            Ended
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !broadcast) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radio className="h-16 w-16 text-slate-300 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Broadcast Not Found
            </h2>
            <p className="text-slate-500 text-center mb-6">
              The broadcast you're looking for doesn't exist or has been
              removed.
            </p>
            <Button
              onClick={() => router.push("/dashboard/broadcasts")}
              className="w-full"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Broadcasts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/live` : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-6 py-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/broadcasts")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Broadcast Details</h1>
              <p className="text-slate-500 mt-1">
                Manage and monitor your broadcast
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(broadcast as any).status === "SCHEDULED" && (
              <Button
                onClick={handleStartBroadcast}
                disabled={startBroadcastMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {startBroadcastMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Go Live
              </Button>
            )}
            {(broadcast as any).status === "LIVE" && (
              <>
                <Button
                  onClick={() =>
                    router.push(
                      `/dashboard/broadcasts/${(broadcast as any).slug}/studio`
                    )
                  }
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Enter Studio
                </Button>
                <Button
                  onClick={handleEndBroadcast}
                  disabled={endBroadcastMutation.isPending}
                  variant="outline"
                >
                  {endBroadcastMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Activity className="h-4 w-4 mr-2" />
                  )}
                  End Broadcast
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={openEditDialog}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Broadcast
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteBroadcast}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden">
          {(broadcast as any).banner && (
            <div className="aspect-video w-full bg-gray-100">
              <img
                src={(broadcast as any).banner.url}
                alt={(broadcast as any).title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              {getStatusBadge((broadcast as any).status)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                  {(broadcast as any).title || "Untitled Broadcast"}
                </h1>
                <p className="text-lg text-slate-600 mb-6">
                  {(broadcast as any).description || "No description available"}
                </p>

                {/* Host Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-500 text-white">
                      {(broadcast as any).hostUser
                        ? `${(broadcast as any).hostUser.firstName}${(broadcast as any).hostUser.lastName}`.substring(
                            0,
                            2
                          )
                        : "H"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {(broadcast as any).hostUser
                          ? `${(broadcast as any).hostUser.firstName} ${(broadcast as any).hostUser.lastName}`
                          : "Host"}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-800 border-purple-200"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        HOST
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Card */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Calendar className="h-5 w-5" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Start Time</p>
                    <p className="font-semibold text-blue-900">
                      {new Date((broadcast as any).startTime).toLocaleString()}
                    </p>
                  </div>
                  {(broadcast as any).endTime && (
                    <div>
                      <p className="text-sm text-blue-700 mb-1">End Time</p>
                      <p className="font-semibold text-blue-900">
                        {new Date((broadcast as any).endTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team & Guests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stream Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Stream details and configuration will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Staff Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Broadcast Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(broadcast as any).staff?.map((staffMember: any) => (
                      <div
                        key={staffMember.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <Avatar>
                          <AvatarFallback>
                            {staffMember.user
                              ? `${staffMember.user.firstName}${staffMember.user.lastName}`.substring(
                                  0,
                                  2
                                )
                              : "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {staffMember.user
                              ? `${staffMember.user.firstName} ${staffMember.user.lastName}`
                              : "Staff Member"}
                          </p>
                          <Badge variant="outline">{staffMember.role}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Guests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      Guests ({(broadcast as any).guests?.length || 0})
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setIsAddGuestDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Guest
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(broadcast as any).guests?.map((guest: any) => (
                      <div
                        key={guest.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-green-500 text-white">
                              {guest.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{guest.name}</p>
                            <p className="text-sm text-slate-500">
                              {guest.role}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveGuest(guest.id)}
                          disabled={removeGuestMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                    {(!(broadcast as any).guests ||
                      (broadcast as any).guests.length === 0) && (
                      <p className="text-slate-500 text-center py-8">
                        No guests added
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Analytics data will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {localSettings ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Broadcast Settings</span>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={updateSettingsMutation.isPending}
                    >
                      {updateSettingsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Settings
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-Record</p>
                      <p className="text-sm text-slate-500">
                        Automatically save broadcast recording
                      </p>
                    </div>
                    <Switch
                      checked={(localSettings as any)?.autoRecord || false}
                      onCheckedChange={(checked) =>
                        setLocalSettings({
                          ...(localSettings as any),
                          autoRecord: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Chat</p>
                      <p className="text-sm text-slate-500">
                        Allow viewers to chat during broadcast
                      </p>
                    </div>
                    <Switch
                      checked={(localSettings as any)?.chatEnabled || false}
                      onCheckedChange={(checked) =>
                        setLocalSettings({
                          ...(localSettings as any),
                          chatEnabled: checked,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Settings className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Settings not available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <CreateBroadcastDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            // Refetch will happen automatically via TanStack Query
          }}
          editingBroadcast={broadcast}
        />

        {/* Add Guest Dialog */}
        <Dialog
          open={isAddGuestDialogOpen}
          onOpenChange={setIsAddGuestDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Guest</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newGuest.name}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Title (Optional)</Label>
                <Input
                  value={newGuest.title}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input
                  value={newGuest.role}
                  onChange={(e) =>
                    setNewGuest({ ...newGuest, role: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddGuestDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddGuest}
                disabled={addGuestMutation.isPending}
              >
                {addGuestMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  "Add Guest"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Broadcast</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Public Link</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(shareUrl)}
                  >
                    {copySuccess ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      "Copy"
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsShareDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
