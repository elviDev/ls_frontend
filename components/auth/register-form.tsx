"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRegister } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Users, UserCheck } from "lucide-react"

type UserType = 'user' | 'staff'
type StaffRole = 'ADMIN' | 'HOST' | 'CO_HOST' | 'PRODUCER' | 'SOUND_ENGINEER' | 'CONTENT_MANAGER' | 'TECHNICAL_SUPPORT'

export function RegisterForm() {
  const [userType, setUserType] = useState<UserType>('user')
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    bio: '',
    phone: '',
    
    // User fields
    name: '',
    
    // Staff fields
    firstName: '',
    lastName: '',
    role: '' as StaffRole,
    department: '',
    position: '',
    address: '',
    emergencyContact: '',
  })
  const [error, setError] = useState<string | null>(null)
  const registerMutation = useRegister()
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    // User type specific validation
    if (userType === 'user' && !formData.name) {
      setError("Name is required for user registration")
      return
    }

    if (userType === 'staff') {
      if (!formData.firstName || !formData.lastName || !formData.username || !formData.role) {
        setError("First name, last name, username, and role are required for staff registration")
        return
      }
    }

    // Prepare data based on user type
    const registrationData = {
      userType,
      email: formData.email,
      password: formData.password,
      ...(userType === 'user' ? {
        name: formData.name,
        username: formData.username || undefined,
        bio: formData.bio || undefined,
        phone: formData.phone || undefined,
      } : {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        role: formData.role,
        bio: formData.bio || undefined,
        department: formData.department || undefined,
        position: formData.position || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        emergencyContact: formData.emergencyContact || undefined,
      })
    }

    registerMutation.mutate(registrationData)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="text-gray-500 dark:text-gray-400">Choose your account type and enter your information</p>
      </div>

      {/* User Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant={userType === 'user' ? 'default' : 'outline'}
          onClick={() => setUserType('user')}
          className="h-20 flex-col gap-2"
        >
          <Users className="h-6 w-6" />
          <span>Regular User</span>
        </Button>
        <Button
          type="button"
          variant={userType === 'staff' ? 'default' : 'outline'}
          onClick={() => setUserType('staff')}
          className="h-20 flex-col gap-2"
        >
          <UserCheck className="h-6 w-6" />
          <span>Staff Member</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={registerMutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username {userType === 'staff' && '*'}</Label>
            <Input
              id="username"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              disabled={registerMutation.isPending}
              required={userType === 'staff'}
            />
          </div>
        </div>

        {/* User Type Specific Fields */}
        {userType === 'user' ? (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={registerMutation.isPending}
              required
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={registerMutation.isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={registerMutation.isPending}
                required
              />
            </div>
          </div>
        )}

        {/* Staff Role Selection */}
        {userType === 'staff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOST">Host</SelectItem>
                  <SelectItem value="CO_HOST">Co-Host</SelectItem>
                  <SelectItem value="PRODUCER">Producer</SelectItem>
                  <SelectItem value="SOUND_ENGINEER">Sound Engineer</SelectItem>
                  <SelectItem value="CONTENT_MANAGER">Content Manager</SelectItem>
                  <SelectItem value="TECHNICAL_SUPPORT">Technical Support</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="Broadcasting"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={registerMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={registerMutation.isPending}
            />
          </div>
          {userType === 'staff' && (
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                placeholder="Senior Host"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                disabled={registerMutation.isPending}
              />
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={registerMutation.isPending}
            rows={3}
          />
        </div>

        {/* Staff Additional Fields */}
        {userType === 'staff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={registerMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                placeholder="Jane Doe - +1 (555) 987-6543"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                disabled={registerMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={registerMutation.isPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password *</Label>
            <PasswordInput
              id="confirm-password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              disabled={registerMutation.isPending}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating account..." : `Register as ${userType === 'user' ? 'User' : 'Staff'}`}
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/signin" className="underline">
          Sign in
        </Link>
      </div>
      
      {userType === 'staff' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Staff accounts require approval from an administrator before you can log in.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}