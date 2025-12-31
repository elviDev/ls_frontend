"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, FileText, Clock, Eye, Download, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAudiobookStore, Chapter } from "@/stores/audiobook-store"
import { useUpdateChapter } from "@/hooks/use-audiobooks"

export default function TranscriptEditPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const audiobookId = params.id as string
  const chapterId = params.chapterId as string
  
  const { currentAudiobook, currentChapter, setCurrentChapter } = useAudiobookStore()
  const updateChapterMutation = useUpdateChapter()
  
  const [transcript, setTranscript] = useState("")
  const [language, setLanguage] = useState("en")
  const [format, setFormat] = useState("plain_text")
  const [isEditable, setIsEditable] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    if (currentChapter) {
      setTranscript(currentChapter.transcript || "")
    }
  }, [currentChapter])

  useEffect(() => {
    const words = transcript.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [transcript])

  const handleTranscriptChange = (value: string) => {
    setTranscript(value)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!currentChapter) return

    updateChapterMutation.mutate(
      {
        audiobookId,
        chapterId,
        data: { transcript }
      },
      {
        onSuccess: (updatedChapter) => {
          const chapter = updatedChapter as Chapter
          setCurrentChapter({
            ...chapter,
            description: chapter.description || undefined,
            transcript: chapter.transcript || undefined
          })
          setHasChanges(false)
          toast({
            title: "Success",
            description: "Transcript saved successfully"
          })
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save transcript",
            variant: "destructive"
          })
        }
      }
    )
  }

  const handleAutoGenerate = async () => {
    toast({
      title: "Feature Coming Soon",
      description: "Auto-generation of transcripts will be available soon",
    })
  }

  const handleImportFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt,.srt,.vtt'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          handleTranscriptChange(content)
          toast({
            title: "Success",
            description: "Transcript imported successfully"
          })
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleExport = () => {
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentChapter?.title || 'chapter'}-transcript.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` 
                     : `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentAudiobook || !currentChapter) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading transcript...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Edit Transcript</h1>
          <p className="text-muted-foreground">
            {currentAudiobook.title} • Chapter {currentChapter.trackNumber}: {currentChapter.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportFile}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={!transcript}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || updateChapterMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateChapterMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Transcript Editor */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transcript Editor
                  </CardTitle>
                  <CardDescription>
                    Edit the transcript for this chapter
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{wordCount} words</span>
                  {hasChanges && <Badge variant="secondary">Unsaved changes</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={transcript}
                  onChange={(e) => handleTranscriptChange(e.target.value)}
                  placeholder="Enter or paste the transcript here..."
                  className="min-h-[500px] font-mono text-sm"
                  disabled={!isEditable}
                />
                
                {!transcript && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No transcript available</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={handleImportFile}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import File
                      </Button>
                      <Button variant="outline" onClick={handleAutoGenerate}>
                        <FileText className="h-4 w-4 mr-2" />
                        Auto Generate
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Chapter Info */}
          <Card>
            <CardHeader>
              <CardTitle>Chapter Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-sm text-muted-foreground">{currentChapter.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Track Number</Label>
                <p className="text-sm text-muted-foreground">Chapter {currentChapter.trackNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Duration</Label>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(currentChapter.duration)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcript Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Transcript Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plain_text">Plain Text</SelectItem>
                    <SelectItem value="srt">SRT Subtitles</SelectItem>
                    <SelectItem value="vtt">WebVTT</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Allow Editing</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow future edits to this transcript
                  </p>
                </div>
                <Switch
                  checked={isEditable}
                  onCheckedChange={setIsEditable}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleAutoGenerate}>
                <FileText className="h-4 w-4 mr-2" />
                Auto Generate
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/audiobooks/${audiobookId}/chapters/${chapterId}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Chapter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}