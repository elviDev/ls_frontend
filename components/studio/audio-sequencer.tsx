"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Edit,
  Volume2,
  Layers,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";

interface SoundEffect {
  id: string;
  name: string;
  category: "jingle" | "transition" | "effect" | "voice" | "music";
  duration: number;
  volume: number;
  file: string;
  color?: string;
}

interface SequenceItem {
  id: string;
  soundId: string;
  startTime: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  crossfade: number;
  layer: number;
  sound?: SoundEffect;
}

interface AudioSequencerProps {
  sounds: SoundEffect[];
  onSequencePlay: (sequence: SequenceItem[]) => void;
  onSequenceStop: () => void;
}

export function AudioSequencer({
  sounds,
  onSequencePlay,
  onSequenceStop,
}: AudioSequencerProps) {
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [zoom, setZoom] = useState(10);
  const [previewingSound, setPreviewingSound] = useState<string | null>(null);
  const [isLoadingSequence, setIsLoadingSequence] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const playbackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const maxEndTime = sequence.reduce((max, item) => {
      const sound = sounds.find((s) => s.id === item.soundId);
      const endTime = item.startTime + (sound?.duration || 0);
      return Math.max(max, endTime);
    }, 0);
    setTotalDuration(maxEndTime);
  }, [sequence, sounds]);

  const addToSequence = (soundId: string, startTime: number = currentTime) => {
    const sound = sounds.find((s) => s.id === soundId);
    if (!sound) return;

    const newItem: SequenceItem = {
      id: Date.now().toString(),
      soundId,
      startTime,
      volume: sound.volume,
      fadeIn: 0,
      fadeOut: 0,
      crossfade: 0,
      layer: 0,
      sound,
    };

    setSequence((prev) =>
      [...prev, newItem].sort((a, b) => a.startTime - b.startTime)
    );
    setShowAddDialog(false);
  };

  const updateSequenceItem = (
    itemId: string,
    updates: Partial<SequenceItem>
  ) => {
    setSequence((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const removeFromSequence = (itemId: string) => {
    setSequence((prev) => prev.filter((item) => item.id !== itemId));
    if (selectedItem === itemId) {
      setSelectedItem(null);
    }
  };

  const playSequence = async () => {
    if (sequence.length === 0) return;

    setIsPlaying(true);
    setCurrentTime(0);

    const scheduledItems = sequence
      .map((item) => {
        const sound = sounds.find((s) => s.id === item.soundId);
        if (!sound) return null;

        return {
          ...item,
          sound,
          scheduledTime: item.startTime * 1000,
        };
      })
      .filter(Boolean);

    const startTime = Date.now();
    playbackRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(elapsed);

      scheduledItems.forEach((item) => {
        if (!item) return;

        const shouldPlay =
          elapsed >= item.startTime && elapsed < item.startTime + 0.1;
        if (shouldPlay) {
          playScheduledItem(item);
        }
      });

      if (elapsed >= totalDuration) {
        stopSequence();
      }
    }, 100);

    onSequencePlay(sequence);
  };

  const playScheduledItem = async (item: any) => {
    try {
      if (!audioRefs.current[item.id]) {
        const audio = new Audio(item.sound.file);
        audio.volume = (item.volume / 100) * (item.sound.volume / 100);
        audioRefs.current[item.id] = audio;
      }

      const audio = audioRefs.current[item.id];

      if (item.crossfade > 0) {
        audio.volume = 0;
        audio.play();

        const fadeSteps = item.crossfade * 10;
        let step = 0;
        const fadeInterval = setInterval(() => {
          step++;
          const progress = step / fadeSteps;
          audio.volume =
            (item.volume / 100) * (item.sound.volume / 100) * progress;

          if (step >= fadeSteps) {
            clearInterval(fadeInterval);
          }
        }, 100);
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error("Error playing scheduled item:", error);
    }
  };

  const stopSequence = () => {
    setIsPlaying(false);
    setCurrentTime(0);

    if (playbackRef.current) {
      clearInterval(playbackRef.current);
    }

    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    onSequenceStop();
  };

  const previewSound = async (sound: SoundEffect) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }

    if (previewingSound === sound.id) {
      setPreviewingSound(null);
      return;
    }

    try {
      const audio = new Audio(sound.file);
      audio.volume = sound.volume / 100;
      previewAudioRef.current = audio;

      setPreviewingSound(sound.id);

      audio.addEventListener("ended", () => {
        setPreviewingSound(null);
        previewAudioRef.current = null;
      });

      await audio.play();
    } catch (error) {
      console.error("Error previewing sound:", error);
      setPreviewingSound(null);
    }
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setPreviewingSound(null);
  };

  const loadSequentialSequence = () => {
    if (sounds.length === 0) return;

    setIsLoadingSequence(true);

    let currentTime = 0;
    const sequentialItems: SequenceItem[] = sounds.map((sound, index) => {
      const item: SequenceItem = {
        id: `seq-${Date.now()}-${index}`,
        soundId: sound.id,
        startTime: currentTime,
        volume: sound.volume,
        fadeIn: 0,
        fadeOut: 0.5,
        crossfade: index > 0 ? 0.5 : 0,
        layer: 0,
        sound,
      };

      currentTime += sound.duration;
      return item;
    });

    setSequence(sequentialItems);
    setIsLoadingSequence(false);
  };

  const saveSequence = () => {
    const sequenceData = {
      sequence,
      totalDuration,
      created: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(sequenceData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sequence-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSequence = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.sequence) {
          setSequence(data.sequence);
        }
      } catch (error) {
        console.error("Error loading sequence:", error);
      }
    };
    reader.readAsText(file);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Audio Sequencer
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </Badge>
              <div className="flex items-center gap-1">
                <Label htmlFor="zoom" className="text-sm">
                  Zoom:
                </Label>
                <Slider
                  id="zoom"
                  min={5}
                  max={50}
                  step={5}
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Button
              onClick={isPlaying ? stopSequence : playSequence}
              variant={isPlaying ? "destructive" : "default"}
              size="sm"
            >
              {isPlaying ? (
                <Square className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isPlaying ? "Stop" : "Play"}
            </Button>
            <Button
              onClick={() => setCurrentTime(0)}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            <Button
              onClick={loadSequentialSequence}
              variant="outline"
              size="sm"
              disabled={isLoadingSequence}
            >
              <Plus className="h-4 w-4" />
              Auto Sequence
            </Button>
          </div>

          <div className="relative border rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <div
              ref={timelineRef}
              className="relative h-32 overflow-x-auto"
              style={{ width: Math.max(300, totalDuration * zoom) }}
            >
              <div className="absolute top-0 left-0 right-0 h-6 border-b bg-white dark:bg-gray-800">
                {Array.from(
                  { length: Math.ceil(totalDuration) + 1 },
                  (_, i) => (
                    <div
                      key={i}
                      className="absolute text-xs text-gray-500 flex items-center"
                      style={{ left: i * zoom, top: 2 }}
                    >
                      {formatTime(i)}
                    </div>
                  )
                )}
              </div>

              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{ left: currentTime * zoom }}
              />

              <div className="absolute top-6 left-0 right-0 bottom-0">
                {sequence.map((item, i) => {
                  const sound = sounds.find((s) => s.id === item.soundId);
                  if (!sound) return null;

                  return (
                    <div
                      key={item.id}
                      className={`absolute h-8 rounded border-2 cursor-pointer transition-colors ${
                        selectedItem === item.id
                          ? "border-blue-500 bg-blue-100 dark:bg-blue-900"
                          : "border-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                      style={{
                        left: item.startTime * zoom,
                        width: sound.duration * zoom,
                        top: i * 32,
                      }}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <div className="px-2 py-1 text-xs truncate">
                        <div className="font-medium">{sound.name}</div>
                        <div className="text-gray-500">
                          {formatTime(sound.duration)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Sound Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {sounds.map((sound) => (
                  <div
                    key={sound.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{sound.name}</div>
                      <div className="text-xs text-gray-500">
                        {sound.category} • {formatTime(sound.duration)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => previewSound(sound)}
                      >
                        {previewingSound === sound.id ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addToSequence(sound.id, currentTime)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {selectedItem &&
          (() => {
            const item = sequence.find((s) => s.id === selectedItem);
            if (!item) return null;

            const sound = sounds.find((s) => s.id === item.soundId);
            if (!sound) return null;

            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Item Properties
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromSequence(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="startTime">Start Time (seconds)</Label>
                    <Input
                      id="startTime"
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.startTime}
                      onChange={(e) =>
                        updateSequenceItem(item.id, {
                          startTime: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="volume">Volume (%)</Label>
                    <Slider
                      id="volume"
                      min={0}
                      max={100}
                      step={1}
                      value={[item.volume]}
                      onValueChange={(value) =>
                        updateSequenceItem(item.id, { volume: value[0] })
                      }
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {item.volume}%
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="fadeIn">Fade In (seconds)</Label>
                    <Input
                      id="fadeIn"
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.fadeIn}
                      onChange={(e) =>
                        updateSequenceItem(item.id, {
                          fadeIn: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="fadeOut">Fade Out (seconds)</Label>
                    <Input
                      id="fadeOut"
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.fadeOut}
                      onChange={(e) =>
                        updateSequenceItem(item.id, {
                          fadeOut: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })()}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveSequence} variant="outline" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Sequence
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <label>
                <Upload className="h-4 w-4 mr-2" />
                Load Sequence
                <input
                  type="file"
                  accept=".json"
                  onChange={loadSequence}
                  className="hidden"
                />
              </label>
            </Button>
            <Button
              onClick={() => setSequence([])}
              variant="outline"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button
              onClick={stopPreview}
              variant="outline"
              className="flex-1"
              disabled={!previewingSound}
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sound to Sequence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Start Time (seconds)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={currentTime}
                onChange={(e) =>
                  setCurrentTime(parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {sounds.map((sound) => (
                  <div
                    key={sound.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{sound.name}</div>
                      <div className="text-xs text-gray-500">
                        {sound.category} • {formatTime(sound.duration)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToSequence(sound.id, currentTime)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
