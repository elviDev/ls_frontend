"use client";

import type React from "react";
import { apiClient } from "@/lib/api-client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Save, BookOpen, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAudiobookStore } from "@/stores/audiobook-store";
import { useCreateChapter } from "@/hooks/use-audiobooks";

export default function NewChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const audiobookId = params.id as string;
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentAudiobook } = useAudiobookStore();
  const createChapter = useCreateChapter();

  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [trackNumber, setTrackNumber] = useState<number>(1);
  const [isDraft, setIsDraft] = useState(true);
  const [isLoadingNextTrackNumber, setIsLoadingNextTrackNumber] =
    useState(true);
  const [transcriptTab, setTranscriptTab] = useState("write");
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [isTranscriptSaving, setIsTranscriptSaving] = useState(false);

  useEffect(() => {
    const fetchNextTrackNumber = async () => {
      try {
        setIsLoadingNextTrackNumber(true);
        const chapters = (await apiClient.request(
          `/audiobooks/${audiobookId}/chapters`
        )) as any[];
        const maxTrackNumber =
          chapters.length > 0
            ? Math.max(...chapters.map((ch: any) => ch.trackNumber))
            : 0;
        setTrackNumber(maxTrackNumber + 1);
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      } finally {
        setIsLoadingNextTrackNumber(false);
      }
    };

    fetchNextTrackNumber();
  }, [audiobookId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const audioUrl = URL.createObjectURL(file);
      setAudioPreview(audioUrl);

      const audio = new Audio(audioUrl);
      audio.onloadedmetadata = () => {
        setDuration(Math.floor(audio.duration));
      };
    }
  };

  const handleTranscriptFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setTranscriptFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTranscriptText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !audioFile || !duration) {
      toast({
        title: "Missing Required Fields",
        description:
          "Please provide a title, audio file, and ensure the duration is detected.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("audioFile", audioFile);
      formData.append("duration", duration.toString());
      formData.append("trackNumber", trackNumber.toString());
      formData.append("status", isDraft ? "DRAFT" : "PUBLISHED");

      if (transcriptText.trim()) {
        formData.append("transcript", transcriptText.trim());
      }

      await createChapter.mutateAsync({ audiobookId, data: formData });
      router.push(`/dashboard/audiobooks/${audiobookId}/chapters`);
    } catch (error: any) {
      console.error("Error creating chapter:", error);
    }
  };

  const handleSaveTranscript = async (asDraft = true) => {
    if (!transcriptText.trim()) {
      toast({
        title: "No Transcript Content",
        description: "Please add some transcript content before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsTranscriptSaving(true);
    try {
      toast({
        title: "Transcript Ready",
        description: "Transcript will be saved when you create the chapter.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save transcript.",
        variant: "destructive",
      });
    } finally {
      setIsTranscriptSaving(false);
    }
  };

  const downloadTranscript = () => {
    if (!transcriptText) return;

    const blob = new Blob([transcriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "chapter"}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Add New Chapter
            </h1>
            <p className="text-slate-500 mt-1">
              Create a new chapter for your audiobook with transcript
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/audiobooks/${audiobookId}/chapters`)
            }
          >
            Back to Chapters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chapter Details
              </CardTitle>
              <CardDescription>
                Basic information about the chapter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Chapter Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chapter title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackNumber">Track Number</Label>
                <Input
                  id="trackNumber"
                  type="number"
                  value={trackNumber}
                  onChange={(e) => setTrackNumber(Number(e.target.value))}
                  min={1}
                  disabled={isLoadingNextTrackNumber}
                  placeholder={
                    isLoadingNextTrackNumber ? "Loading..." : "Track number"
                  }
                />
                {!isLoadingNextTrackNumber && (
                  <p className="text-xs text-slate-500">
                    Suggested next track number: {trackNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isDraft">Save as Draft</Label>
                  <Switch
                    id="isDraft"
                    checked={isDraft}
                    onCheckedChange={setIsDraft}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {isDraft
                    ? "Chapter will be saved as draft"
                    : "Chapter will be published immediately"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioFile">Audio File</Label>
                <Input
                  id="audioFile"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                />
                {audioPreview && duration && (
                  <div className="mt-2">
                    <audio ref={audioRef} controls className="w-full">
                      <source src={audioPreview} />
                    </audio>
                    <p className="text-xs text-slate-500 mt-1">
                      Duration: {formatDuration(duration)}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={createChapter.isPending || !title || !audioFile}
                className="w-full"
              >
                {createChapter.isPending ? "Creating..." : "Create Chapter"}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transcript
              </CardTitle>
              <CardDescription>
                Add or upload a transcript for this chapter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={transcriptTab} onValueChange={setTranscriptTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="write">Write Transcript</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>

                <TabsContent value="write" className="space-y-4">
                  <Textarea
                    placeholder="Type or paste your transcript here..."
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    rows={15}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleSaveTranscript(true)}
                      disabled={isTranscriptSaving || !transcriptText.trim()}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadTranscript}
                      disabled={!transcriptText.trim()}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <Label htmlFor="transcriptFile" className="cursor-pointer">
                      <span className="text-lg font-medium text-slate-700">
                        Upload Transcript File
                      </span>
                      <p className="text-slate-500 mt-1">
                        Supports .txt, .srt, .vtt files
                      </p>
                    </Label>
                    <Input
                      id="transcriptFile"
                      type="file"
                      accept=".txt,.srt,.vtt"
                      onChange={handleTranscriptFileChange}
                      className="hidden"
                    />
                  </div>

                  {transcriptFile && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="font-medium text-slate-700">
                        Uploaded: {transcriptFile.name}
                      </p>
                      <p className="text-slate-500 text-sm">
                        File content loaded into transcript editor
                      </p>
                    </div>
                  )}

                  {transcriptText && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="bg-slate-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                          {transcriptText}
                        </pre>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
