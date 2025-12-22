"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Plus, X, Users, UserPlus, Upload, Image } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Program, StaffMember } from "../types"

interface CreateBroadcastDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programs: Program[]
  staff: StaffMember[]
  onSuccess: () => void
}

export function CreateBroadcastDialog({ 
  open, 
  onOpenChange, 
  programs, 
  staff, 
  onSuccess 
}: CreateBroadcastDialogProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: undefined as Date | undefined,
    startTimeHour: "09",
    startTimeMinute: "00",
    endTime: undefined as Date | undefined,
    endTimeHour: "10",
    endTimeMinute: "00",
    hostId: "",
    programId: "",
    bannerId: "",
    bannerFile: null as File | null,
    staff: [] as { userId: string; role: string }[],
    guests: [] as { name: string; title: string; role: string }[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.startTime || !formData.hostId) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.endTime) {
      toast.error("Please select an end date")
      return
    }

    setIsCreating(true)
    
    try {
      let bannerId = formData.bannerId
      
      // Upload banner if file is selected
      if (formData.bannerFile) {
        setUploadingBanner(true)
        const bannerFormData = new FormData()
        bannerFormData.append('file', formData.bannerFile)
        bannerFormData.append('type', 'IMAGE')
        bannerFormData.append('description', `Banner for ${formData.title}`)
        
        const bannerResponse = await fetch('/api/admin/assets', {
          method: 'POST',
          body: bannerFormData
        })
        
        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json()
          bannerId = bannerData.id
        }
        setUploadingBanner(false)
      }
      
      const startDateTime = new Date(formData.startTime)
      startDateTime.setHours(parseInt(formData.startTimeHour), parseInt(formData.startTimeMinute))
      
      const endDateTime = formData.endTime ? new Date(formData.endTime) : new Date(startDateTime)
      endDateTime.setHours(parseInt(formData.endTimeHour), parseInt(formData.endTimeMinute))

      const response = await fetch('/api/admin/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          hostId: formData.hostId,
          programId: formData.programId || null,
          bannerId: bannerId || null,
          staff: formData.staff,
          guests: formData.guests
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create broadcast')
      }

      toast.success("Broadcast created successfully!")
      onSuccess()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        startTime: undefined,
        startTimeHour: "09",
        startTimeMinute: "00",
        endTime: undefined,
        endTimeHour: "10",
        endTimeMinute: "00",
        hostId: "",
        programId: "",
        bannerId: "",
        bannerFile: null,
        staff: [],
        guests: []
      })
    } catch (error) {
      console.error('Error creating broadcast:', error)
      toast.error("Failed to create broadcast")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Broadcast</DialogTitle>
          <DialogDescription>
            Set up a new radio broadcast or live show
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter broadcast title"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your broadcast"
                rows={3}
              />
            </div>

            <div>
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startTime ? format(formData.startTime, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startTime}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startTime: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Start Time</Label>
              <div className="flex gap-2">
                <Select value={formData.startTimeHour} onValueChange={(value) => setFormData(prev => ({ ...prev, startTimeHour: value }))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formData.startTimeMinute} onValueChange={(value) => setFormData(prev => ({ ...prev, startTimeMinute: value }))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['00', '15', '30', '45'].map(minute => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endTime ? format(formData.endTime, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endTime}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endTime: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Time</Label>
              <div className="flex gap-2">
                <Select value={formData.endTimeHour} onValueChange={(value) => setFormData(prev => ({ ...prev, endTimeHour: value }))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formData.endTimeMinute} onValueChange={(value) => setFormData(prev => ({ ...prev, endTimeMinute: value }))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['00', '15', '30', '45'].map(minute => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Host *</Label>
              <Select value={formData.hostId} onValueChange={(value) => setFormData(prev => ({ ...prev, hostId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select host" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Program</Label>
              <Select value={formData.programId} onValueChange={(value) => setFormData(prev => ({ ...prev, programId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select program (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cover Image Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              Cover Image
            </Label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {formData.bannerFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <img
                      src={URL.createObjectURL(formData.bannerFile)}
                      alt="Preview"
                      className="max-h-32 rounded-lg object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">{formData.bannerFile.name}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, bannerFile: null }))}
                      className="mt-2"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Upload a cover image for your broadcast</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFormData(prev => ({ ...prev, bannerFile: file }))
                        }
                      }}
                      className="hidden"
                      id="banner-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('banner-upload')?.click()}
                    >
                      Choose Image
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Staff Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Staff Members
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const availableStaff = staff.filter(s => 
                    s.id !== formData.hostId && 
                    !formData.staff.some(fs => fs.userId === s.id)
                  )
                  if (availableStaff.length > 0) {
                    setFormData(prev => ({
                      ...prev,
                      staff: [...prev.staff, { userId: availableStaff[0].id, role: "CO_HOST" }]
                    }))
                  }
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Staff
              </Button>
            </div>
            
            {formData.staff.map((staffMember, index) => {
              const member = staff.find(s => s.id === staffMember.userId)
              return (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <Select 
                    value={staffMember.userId} 
                    onValueChange={(value) => {
                      const newStaff = [...formData.staff]
                      newStaff[index].userId = value
                      setFormData(prev => ({ ...prev, staff: newStaff }))
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.filter(s => s.id !== formData.hostId).map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.firstName} {member.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={staffMember.role} 
                    onValueChange={(value) => {
                      const newStaff = [...formData.staff]
                      newStaff[index].role = value
                      setFormData(prev => ({ ...prev, staff: newStaff }))
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CO_HOST">Co-Host</SelectItem>
                      <SelectItem value="PRODUCER">Producer</SelectItem>
                      <SelectItem value="SOUND_ENGINEER">Sound Engineer</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        staff: prev.staff.filter((_, i) => i !== index)
                      }))
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Guests Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Guests
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    guests: [...prev.guests, { name: "", title: "", role: "Guest" }]
                  }))
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Guest
              </Button>
            </div>
            
            {formData.guests.map((guest, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 p-2 border rounded">
                <Input
                  placeholder="Guest name"
                  value={guest.name}
                  onChange={(e) => {
                    const newGuests = [...formData.guests]
                    newGuests[index].name = e.target.value
                    setFormData(prev => ({ ...prev, guests: newGuests }))
                  }}
                />
                <Input
                  placeholder="Title/Position"
                  value={guest.title}
                  onChange={(e) => {
                    const newGuests = [...formData.guests]
                    newGuests[index].title = e.target.value
                    setFormData(prev => ({ ...prev, guests: newGuests }))
                  }}
                />
                <div className="flex gap-1">
                  <Input
                    placeholder="Role"
                    value={guest.role}
                    onChange={(e) => {
                      const newGuests = [...formData.guests]
                      newGuests[index].role = e.target.value
                      setFormData(prev => ({ ...prev, guests: newGuests }))
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        guests: prev.guests.filter((_, i) => i !== index)
                      }))
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || uploadingBanner}>
              {(isCreating || uploadingBanner) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadingBanner ? 'Uploading Image...' : isCreating ? 'Creating...' : 'Create Broadcast'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}