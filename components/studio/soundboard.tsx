"use client";

import { useState, useRef, useEffect } from "react";
import { useAudioAssets } from "@/hooks/use-audio-assets";
import { defaultRadioSounds, generateDemoAudio } from "@/lib/default-sounds";
import { AudioSequencer } from "./audio-sequencer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Zap,
  Music,
  Bell,
  Mic,
  Radio,
  Clock,
  AlertCircle,
  Trash2,
  Upload,
  Download,
  Settings,
  RotateCcw,
  FastForward,
  Rewind,
  Repeat,
} from "lucide-react";

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

interface SoundEffect {
  id: string;
  name: string;
  category: "jingle" | "transition" | "effect" | "voice" | "music";
  duration: number;
  volume: number;
  file: string;
  hotkey?: string;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  color?: string;
  tags?: string[];
  asset?: Asset;
}

interface SoundboardProps {
  isLive: boolean;
  onSoundPlay: (sound: SoundEffect) => void;
  onSoundStop: (soundId: string) => void;
}

export function Soundboard({
  isLive,
  onSoundPlay,
  onSoundStop,
}: SoundboardProps) {
  const [sounds, setSounds] = useState<SoundEffect[]>([]);

  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [masterVolume, setMasterVolume] = useState(75);

  // Update all playing audio volumes when master volume changes
  useEffect(() => {
    Object.entries(audioRefs.current).forEach(([soundId, audio]) => {
      if (playingSounds.has(soundId)) {
        const sound = sounds.find((s) => s.id === soundId);
        if (sound) {
          audio.volume = (sound.volume / 100) * (masterVolume / 100);
        }
      }
    });
  }, [masterVolume, playingSounds, sounds]);
  const [searchTerm, setSearchTerm] = useState("");
  const [soundProgress, setSoundProgress] = useState<{ [key: string]: number }>(
    {}
  );

  // Asset management
  const { assets, loading, fetchAssets, uploadAsset } = useAudioAssets();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    name: "",
    description: "",
    category: "effect" as SoundEffect["category"],
    tags: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const progressIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const audioContextRef = useRef<AudioContext | null>(null);

  const categories = [
    { value: "all", label: "All Sounds", icon: Zap },
    { value: "jingle", label: "Jingles", icon: Radio },
    { value: "transition", label: "Transitions", icon: FastForward },
    { value: "effect", label: "Effects", icon: Bell },
    { value: "voice", label: "Voice", icon: Mic },
    { value: "music", label: "Music Beds", icon: Music },
  ];

  const filteredSounds = sounds.filter((sound) => {
    const matchesCategory =
      selectedCategory === "all" || sound.category === selectedCategory;
    const matchesSearch =
      sound.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sound.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const handleSoundPlay = async (sound: SoundEffect) => {
    try {
      // Check if sound has audio file
      if (!sound.asset?.url && !sound.file) {
        console.error("Sound has no audio file:", sound.name);
        toast.error(`No audio file for ${sound.name}`);
        return;
      }

      // Initialize audio context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      // Create or get audio element
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio();
        audio.src = sound.asset?.url || sound.file || "";
        audio.volume = (sound.volume / 100) * (masterVolume / 100);
        audio.loop = sound.loop || false;
        audio.crossOrigin = "anonymous";
        audioRefs.current[sound.id] = audio;
      }

      const audio = audioRefs.current[sound.id];
      audio.volume = (sound.volume / 100) * (masterVolume / 100);

      setPlayingSounds((prev) => new Set([...prev, sound.id]));
      setSoundProgress((prev) => ({ ...prev, [sound.id]: 0 }));

      // Play the audio
      await audio.play();

      // Start progress tracking
      progressIntervals.current[sound.id] = setInterval(() => {
        if (audio.ended && !audio.loop) {
          handleSoundStop(sound.id);
          return;
        }

        const progress = audio.duration
          ? (audio.currentTime / audio.duration) * 100
          : 0;
        setSoundProgress((prev) => ({ ...prev, [sound.id]: progress }));

        if (progress >= 100 && !audio.loop) {
          handleSoundStop(sound.id);
        }
      }, 100);

      // Handle audio ended event
      audio.onended = () => {
        if (!audio.loop) {
          handleSoundStop(sound.id);
        }
      };

      onSoundPlay(sound);
    } catch (error) {
      console.error("Error playing sound:", error);
      toast.error(`Failed to play ${sound.name}`);
    }
  };

  const handleSoundStop = (soundId: string) => {
    // Stop actual audio
    if (audioRefs.current[soundId]) {
      audioRefs.current[soundId].pause();
      audioRefs.current[soundId].currentTime = 0;
    }

    setPlayingSounds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(soundId);
      return newSet;
    });

    if (progressIntervals.current[soundId]) {
      clearInterval(progressIntervals.current[soundId]);
      delete progressIntervals.current[soundId];
    }

    setSoundProgress((prev) => ({ ...prev, [soundId]: 0 }));
    onSoundStop(soundId);
  };

  const handleStopAll = () => {
    // Stop all audio elements
    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    playingSounds.forEach((soundId) => {
      handleSoundStop(soundId);
    });
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.icon : Zap;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  // Load sounds from audio assets and add default sounds
  useEffect(() => {
    fetchAssets({ type: "jingle,effect,voice" });
  }, [fetchAssets]);

  // Convert assets to sound effects and add default radio sounds
  useEffect(() => {
    const assetSounds: SoundEffect[] = assets.map((asset, index) => {
      let metadata: any = {};
      try {
        metadata = asset.tags ? JSON.parse(asset.tags) : {};
      } catch (error) {
        metadata = { tags: asset.tags ? asset.tags.split(",") : [] };
      }
      const audioType = (metadata as any).audioType || "effect";

      return {
        id: asset.id,
        name: asset.description || asset.originalName,
        category: audioType as SoundEffect["category"],
        duration: (metadata as any).duration || 30,
        volume: 75,
        file: asset.url,
        hotkey: `F${(index % 12) + 1}`,
        fadeIn: 0,
        fadeOut: 0.5,
        color: getCategoryColor(audioType),
        tags: (metadata as any).tags || [audioType],
        asset: asset as Asset,
      };
    });

    const defaultSounds: SoundEffect[] = defaultRadioSounds.map((sound) => ({
      ...sound,
      file: generateDemoAudio(sound),
    }));

    setSounds([...defaultSounds, ...assetSounds]);
  }, [assets]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "jingle":
        return "bg-blue-500";
      case "transition":
        return "bg-green-500";
      case "effect":
        return "bg-yellow-500";
      case "voice":
        return "bg-purple-500";
      case "music":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Audio Sequencer */}
      <AudioSequencer
        sounds={sounds}
        onSequencePlay={(sequence) => {
          sequence.forEach((item) => {
            const sound = sounds.find((s) => s.id === item.soundId);
            if (sound) {
              setTimeout(() => handleSoundPlay(sound), item.startTime * 1000);
            }
          });
        }}
        onSequenceStop={() => {
          handleStopAll();
        }}
      />

      {/* Traditional Soundboard */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">
                Quick Access Soundboard
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={playingSounds.size > 0 ? "destructive" : "outline"}
                className="text-xs"
              >
                {playingSounds.size} Playing
              </Badge>
              {playingSounds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleStopAll}
                  className="h-7 sm:h-8 text-xs"
                >
                  <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Stop All</span>
                  <span className="sm:hidden">Stop</span>
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">Master:</span>
              <Slider
                value={[masterVolume]}
                onValueChange={(value) => setMasterVolume(value[0])}
                max={100}
                step={1}
                className="w-16 sm:w-24"
              />
              <span className="text-xs sm:text-sm text-slate-500 w-8">
                {masterVolume}%
              </span>
            </div>

            <div className="flex-1">
              <Input
                placeholder="Search sounds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 sm:h-10 text-sm"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-40 h-8 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-sm">{category.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Sound Grid */}
          <ScrollArea className="h-64 sm:h-96">
            {loading ? (
              <div className="text-center py-8 text-sm">Loading sounds...</div>
            ) : filteredSounds.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No sounds available. Upload audio files to get started.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {filteredSounds.map((sound) => {
                  const isPlaying = playingSounds.has(sound.id);
                  const progress = soundProgress[sound.id] || 0;
                  const Icon = getCategoryIcon(sound.category);
                  const hasAudio = sound.asset?.url || sound.file;

                  return (
                    <div key={sound.id} className="relative">
                      <Button
                        variant="outline"
                        className={`w-full h-20 sm:h-24 p-2 sm:p-3 flex flex-col items-center justify-center space-y-1 relative overflow-hidden transition-all ${
                          isPlaying
                            ? "border-2 border-blue-500 bg-blue-50 shadow-lg transform scale-105"
                            : "hover:bg-slate-50"
                        } ${!hasAudio ? "opacity-50 cursor-not-allowed border-red-200" : ""}`}
                        onClick={() => {
                          if (!hasAudio) {
                            toast.error("No audio file available");
                            return;
                          }
                          isPlaying
                            ? handleSoundStop(sound.id)
                            : handleSoundPlay(sound);
                        }}
                        disabled={!hasAudio}
                      >
                        {/* Progress Background */}
                        {isPlaying && (
                          <div
                            className="absolute inset-0 bg-blue-100 transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          />
                        )}

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center space-y-1">
                          <div className="flex items-center gap-1">
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                            {!hasAudio ? (
                              <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />
                            ) : isPlaying ? (
                              <Square className="h-2 w-2 sm:h-3 sm:w-3" />
                            ) : (
                              <Play className="h-2 w-2 sm:h-3 sm:w-3" />
                            )}
                          </div>
                          <div className="text-center">
                            <div className="text-xs sm:text-sm font-medium leading-tight truncate max-w-full">
                              {sound.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDuration(sound.duration)}
                            </div>
                          </div>
                        </div>

                        {/* Hotkey Badge */}
                        {sound.hotkey && (
                          <Badge
                            variant="secondary"
                            className="absolute top-1 right-1 text-xs h-3 sm:h-4 px-1 hidden sm:inline-flex"
                          >
                            {sound.hotkey}
                          </Badge>
                        )}

                        {/* Loop Indicator */}
                        {sound.loop && (
                          <Repeat className="absolute bottom-1 right-1 h-2 w-2 sm:h-3 sm:w-3 text-slate-400" />
                        )}

                        {/* Volume Indicator */}
                        <div className="absolute bottom-1 left-1 text-xs text-slate-400 hidden sm:block">
                          {sound.volume}%
                        </div>
                      </Button>

                      {/* Progress Bar */}
                      {isPlaying && (
                        <Progress
                          value={progress}
                          className="absolute -bottom-1 left-0 right-0 h-1"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Quick Access Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const jingle = sounds.find((s) => s.category === "jingle");
                if (jingle) handleSoundPlay(jingle);
              }}
              disabled={!sounds.find((s) => s.category === "jingle")}
              className="h-7 sm:h-8 text-xs"
            >
              <Radio className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Jingle</span>
              <span className="sm:hidden">Jing</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const transition = sounds.find(
                  (s) => s.category === "transition"
                );
                if (transition) handleSoundPlay(transition);
              }}
              disabled={!sounds.find((s) => s.category === "transition")}
              className="h-7 sm:h-8 text-xs"
            >
              <FastForward className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Trans</span>
              <span className="sm:hidden">Tran</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const effect = sounds.find((s) => s.category === "effect");
                if (effect) handleSoundPlay(effect);
              }}
              disabled={!sounds.find((s) => s.category === "effect")}
              className="h-7 sm:h-8 text-xs"
            >
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              FX
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const voice = sounds.find((s) => s.category === "voice");
                if (voice) handleSoundPlay(voice);
              }}
              disabled={!sounds.find((s) => s.category === "voice")}
              className="h-7 sm:h-8 text-xs"
            >
              <Mic className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Voice</span>
              <span className="sm:hidden">Vox</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopAll}
              disabled={playingSounds.size === 0}
              className="h-7 sm:h-8 text-xs col-span-3 sm:col-span-1"
            >
              <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Stop
            </Button>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(true)}
              className="flex items-center gap-2 h-8 sm:h-10 text-xs sm:text-sm"
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Upload Sound Effects</span>
              <span className="sm:hidden">Upload Sounds</span>
            </Button>
          </div>

          {/* Currently Playing */}
          {playingSounds.size > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-medium">
                Currently Playing:
              </h4>
              <div className="space-y-1">
                {Array.from(playingSounds).map((soundId) => {
                  const sound = sounds.find((s) => s.id === soundId);
                  if (!sound) return null;

                  const progress = soundProgress[soundId] || 0;
                  const Icon = getCategoryIcon(sound.category);

                  return (
                    <div
                      key={soundId}
                      className="flex items-center gap-2 sm:gap-3 p-2 bg-slate-50 rounded"
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium truncate">
                            {sound.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSoundStop(soundId)}
                            className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                          >
                            <Square className="h-2 w-2 sm:h-3 sm:w-3" />
                          </Button>
                        </div>
                        <Progress value={progress} className="h-1 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Dialog */}
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-sm sm:text-base">
                  Upload Sound Effect
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Upload audio files for jingles, effects, transitions, and
                  voice clips.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="sound-file" className="text-xs sm:text-sm">
                    Audio File
                  </Label>
                  <Input
                    id="sound-file"
                    type="file"
                    accept="audio/*"
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadForm((prev) => ({
                          ...prev,
                          file,
                          name: file.name.replace(/\.[^/.]+$/, ""),
                        }));
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="sound-name" className="text-xs sm:text-sm">
                    Name
                  </Label>
                  <Input
                    id="sound-name"
                    value={uploadForm.name}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Sound effect name"
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="sound-category"
                    className="text-xs sm:text-sm"
                  >
                    Category
                  </Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        category: value as SoundEffect["category"],
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jingle">Jingle</SelectItem>
                      <SelectItem value="effect">Effect</SelectItem>
                      <SelectItem value="voice">Voice</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="sound-description"
                    className="text-xs sm:text-sm"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="sound-description"
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of the sound effect"
                    className="text-xs sm:text-sm min-h-[60px] sm:min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="sound-tags" className="text-xs sm:text-sm">
                    Tags (comma separated)
                  </Label>
                  <Input
                    id="sound-tags"
                    value={uploadForm.tags}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        tags: e.target.value,
                      }))
                    }
                    placeholder="e.g. applause, crowd, positive"
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!uploadForm.file || !uploadForm.name) return;

                      setIsUploading(true);
                      try {
                        const audioType =
                          uploadForm.category === "transition"
                            ? "effect"
                            : (uploadForm.category as
                                | "jingle"
                                | "effect"
                                | "voice"
                                | "music");

                        const metadata: any = {
                          title: uploadForm.name,
                          audioType,
                        };
                        if (uploadForm.description) {
                          metadata.description = uploadForm.description;
                        }
                        const tagsArray = uploadForm.tags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);
                        if (tagsArray.length) {
                          metadata.tags = tagsArray;
                        }

                        await uploadAsset(uploadForm.file, metadata);

                        toast.success("Sound effect uploaded successfully");
                        setIsUploadDialogOpen(false);
                        setUploadForm({
                          file: null,
                          name: "",
                          description: "",
                          category: "effect",
                          tags: "",
                        });
                        fetchAssets({ type: "jingle,effect,voice" });
                      } catch (error) {
                        console.error("Upload failed:", error);
                        toast.error("Failed to upload sound effect");
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    disabled={
                      !uploadForm.file || !uploadForm.name || isUploading
                    }
                    className="h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
