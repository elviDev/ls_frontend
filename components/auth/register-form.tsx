"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
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
  const t = useTranslations()
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
      setError(t('validation.required'))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('validation.passwordsDoNotMatch'))
      return
    }

    if (formData.password.length < 8) {
      setError(t('validation.passwordTooShort'))
      return
    }

    // User type specific validation
    if (userType === 'user' && !formData.name) {
      setError(t('validation.required'))
      return
    }

    if (userType === 'staff') {
      if (!formData.firstName || !formData.lastName || !formData.username || !formData.role) {
        setError(t('validation.required'))
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

    try {
      await registerMutation.mutateAsync(registrationData)
    } catch (error: any) {
      setError(error.message || 'Registration failed')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t('register.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('register.description')}</p>
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
          <span>{t('register.userType.user')}</span>
        </Button>
        <Button
          type="button"
          variant={userType === 'staff' ? 'default' : 'outline'}
          onClick={() => setUserType('staff')}
          className="h-20 flex-col gap-2"
        >
          <UserCheck className="h-6 w-6" />
          <span>{t('register.userType.staff')}</span>
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
            <Label htmlFor="email">{t('auth.email')} *</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('register.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={registerMutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t('auth.username')} {userType === 'staff' && '*'}</Label>
            <Input
              id="username"
              placeholder={t('register.usernamePlaceholder')}
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
            <Label htmlFor="name">{t('forms.fullName')} *</Label>
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
              <Label htmlFor="firstName">{t('auth.firstName')} *</Label>
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
              <Label htmlFor="lastName">{t('auth.lastName')} *</Label>
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
              <Label htmlFor="role">{t('register.role')} *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('register.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOST">{t('register.roles.HOST')}</SelectItem>
                  <SelectItem value="CO_HOST">{t('register.roles.CO_HOST')}</SelectItem>
                  <SelectItem value="PRODUCER">{t('register.roles.PRODUCER')}</SelectItem>
                  <SelectItem value="SOUND_ENGINEER">{t('register.roles.SOUND_ENGINEER')}</SelectItem>
                  <SelectItem value="CONTENT_MANAGER">{t('register.roles.CONTENT_MANAGER')}</SelectItem>
                  <SelectItem value="TECHNICAL_SUPPORT">{t('register.roles.TECHNICAL_SUPPORT')}</SelectItem>
                  <SelectItem value="ADMIN">{t('register.roles.ADMIN')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">{t('register.department')}</Label>
              <Input
                id="department"
                placeholder={t('register.departmentPlaceholder')}
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
            <Label htmlFor="phone">{t('auth.phone')}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('register.phonePlaceholder')}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={registerMutation.isPending}
            />
          </div>
          {userType === 'staff' && (
            <div className="space-y-2">
              <Label htmlFor="position">{t('register.position')}</Label>
              <Input
                id="position"
                placeholder={t('register.positionPlaceholder')}
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                disabled={registerMutation.isPending}
              />
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">{t('auth.bio')}</Label>
          <Textarea
            id="bio"
            placeholder={t('forms.tellUsAboutYourself')}
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
              <Label htmlFor="address">{t('forms.address')}</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={registerMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">{t('forms.emergencyContact')}</Label>
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
            <Label htmlFor="password">{t('auth.password')} *</Label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={registerMutation.isPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t('auth.confirmPassword')} *</Label>
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
          {registerMutation.isPending ? t('loading.creatingAccount') : userType === 'user' ? t('register.registerAsUser') : t('register.registerAsStaff')}
        </Button>
      </form>

      <div className="text-center text-sm">
        {t('register.alreadyHaveAccount')}{" "}
        <Link href="/signin" className="underline">
          {t('register.signIn')}
        </Link>
      </div>
      
      {userType === 'staff' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('register.staffApprovalRequired')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}