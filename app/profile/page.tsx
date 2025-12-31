"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Heart,
  Clock,
  Music,
  Headphones,
  Mic,
  Users,
  Play,
  BookOpen,
  Star,
  TrendingUp,
  BarChart,
  Shield,
  MapPin,
  Briefcase
} from "lucide-react"
import { useProfile, useUpdateProfile, useFavorites, UserProfile, StaffProfile } from "@/hooks/use-profile"
import { useAuthStore } from "@/stores/auth-store"

const userProfileSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional()
})

const staffProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  profileImage: z.string().optional()
})

type UserProfileData = z.infer<typeof userProfileSchema>
type StaffProfileData = z.infer<typeof staffProfileSchema>

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { data: profileData, isLoading, error } = useProfile()
  const { data: favorites } = useFavorites()
  const updateProfile = useUpdateProfile()
  const [isEditing, setIsEditing] = useState(false)

  const isStaff = user?.userType === 'staff'
  const profile = profileData?.profile

  const userForm = useForm<UserProfileData>({
    resolver: zodResolver(userProfileSchema)
  })

  const staffForm = useForm<StaffProfileData>({
    resolver: zodResolver(staffProfileSchema)
  })

  const form = isStaff ? staffForm : userForm

  // Set form values when profile data loads
  React.useEffect(() => {
    if (profile && !isEditing) {
      if (isStaff) {
        const staffProfile = profile as StaffProfile
        staffForm.reset({
          firstName: staffProfile.firstName || '',
          lastName: staffProfile.lastName || '',
          bio: staffProfile.bio || '',
          phone: staffProfile.phone || '',
          address: staffProfile.address || '',
          emergencyContact: staffProfile.emergencyContact || '',
          profileImage: staffProfile.profileImage || ''
        })
      } else {
        const userProfile = profile as UserProfile
        userForm.reset({
          name: userProfile.name || '',
          username: userProfile.username || '',
          bio: userProfile.bio || '',
          profileImage: userProfile.profileImage || ''
        })
      }
    }
  }, [profile, isEditing, isStaff, staffForm, userForm])

  const onSubmit = async (data: UserProfileData | StaffProfileData) => {
    try {
      await updateProfile.mutateAsync(data)
      setIsEditing(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getDisplayName = () => {
    if (!profile) return 'User'
    if (isStaff) {
      const staffProfile = profile as StaffProfile
      return `${staffProfile.firstName || ''} ${staffProfile.lastName || ''}`.trim() || 'Staff Member'
    } else {
      const userProfile = profile as UserProfile
      return userProfile.name || userProfile.username || 'User'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="h-96 bg-muted rounded"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="text-muted-foreground mt-2">{error?.message || 'Unable to load profile'}</p>
        </div>
      </div>
    )
  }

  const displayName = getDisplayName()

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.profileImage || ''} />
                  <AvatarFallback className="text-lg">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{displayName}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                {profile.email}
              </CardDescription>
              {isStaff && (
                <div className="flex justify-center gap-2 mt-2">
                  <Badge variant="secondary">{(profile as StaffProfile).role}</Badge>
                  {(profile as StaffProfile).department && (
                    <Badge variant="outline">{(profile as StaffProfile).department}</Badge>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {((isStaff && (profile as StaffProfile).bio) || (!isStaff && (profile as UserProfile).bio)) && (
                <div>
                  <p className="text-sm font-medium mb-1">Bio</p>
                  <p className="text-sm text-muted-foreground">
                    {isStaff ? (profile as StaffProfile).bio : (profile as UserProfile).bio}
                  </p>
                </div>
              )}
              
              {isStaff && (
                <>
                  {(profile as StaffProfile).phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {(profile as StaffProfile).phone}
                    </div>
                  )}
                  {(profile as StaffProfile).position && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      {(profile as StaffProfile).position}
                    </div>
                  )}
                  {(profile as StaffProfile).address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {(profile as StaffProfile).address}
                    </div>
                  )}
                </>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Joined {formatDate(profile.createdAt)}
              </div>

              {/* Stats */}
              <div className="pt-4 border-t space-y-3">
                {isStaff ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Content Created</span>
                      <span className="font-medium">{profileData?.stats?.contentCreated || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Broadcasts Hosted</span>
                      <span className="font-medium">{profileData?.stats?.broadcastsHosted || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Favorites</span>
                      <span className="font-medium">{profileData?.stats?.favoritesCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Reviews</span>
                      <span className="font-medium">{(profile as UserProfile)._count?.reviews || 0}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {isStaff ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={staffForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={staffForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={staffForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={staffForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={staffForm.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emergency Contact</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <FormField
                          control={userForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={updateProfile.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {!isStaff && <TabsTrigger value="favorites">Favorites</TabsTrigger>}
                {isStaff && <TabsTrigger value="content">My Content</TabsTrigger>}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                      </div>
                      {isStaff ? (
                        <>
                          <div>
                            <label className="text-sm font-medium">Role</label>
                            <p className="text-sm text-muted-foreground mt-1">{(profile as StaffProfile).role}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Department</label>
                            <p className="text-sm text-muted-foreground mt-1">{(profile as StaffProfile).department || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <div className="mt-1">
                              <Badge variant={(profile as StaffProfile).isActive ? 'default' : 'secondary'}>
                                {(profile as StaffProfile).isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-sm font-medium">Username</label>
                            <p className="text-sm text-muted-foreground mt-1">{(profile as UserProfile).username || 'N/A'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {!isStaff && (
                <TabsContent value="favorites" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Favorites
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {favorites && Array.isArray(favorites) && favorites.length > 0 ? (
                        <div className="space-y-4">
                          {favorites.map((favorite: any) => (
                            <div key={favorite.id} className="flex items-center gap-4 p-4 border rounded-lg">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                {favorite.podcast ? <Mic className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">
                                  {favorite.podcast?.title || favorite.audiobook?.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {favorite.podcast?.description || favorite.audiobook?.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">No favorites yet</h3>
                          <p className="text-muted-foreground">Start exploring content to add favorites</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {isStaff && (
                <TabsContent value="content" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mic className="h-5 w-5" />
                          Podcasts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{(profile as StaffProfile)._count.podcasts}</div>
                          <p className="text-sm text-muted-foreground">Created</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Audiobooks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{(profile as StaffProfile)._count.audiobooks}</div>
                          <p className="text-sm text-muted-foreground">Created</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Broadcasts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{(profile as StaffProfile)._count.hostedBroadcasts}</div>
                          <p className="text-sm text-muted-foreground">Hosted</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}