'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLogin } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const t = useTranslations('auth');
  const tValidation = useTranslations('validation');
  const tAlerts = useTranslations('loginAlerts');
  const [showPassword, setShowPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const loginMutation = useLogin();
  const searchParams = useSearchParams();
  const router = useRouter();
  const verified = searchParams.get('verified');
  const error = searchParams.get('error');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error: any) {
      // Check if error is about unverified email
      if (error?.message?.includes('verify your email')) {
        setUnverifiedEmail(data.email);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    setIsResending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Verification email sent! Please check your inbox.');
        setUnverifiedEmail(null);
      } else {
        toast.error(data.error || 'Failed to resend verification email');
      }
    } catch (err) {
      toast.error('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t('signInTitle')}</CardTitle>
        <CardDescription className="text-center">
          {t('signInDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Verification Status Alert */}
        {verified === 'true' && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {tAlerts('emailVerifiedSuccess')}
            </AlertDescription>
          </Alert>
        )}
        {verified === 'false' && (
          <Alert className="mb-4 border-red-500 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error ? decodeURIComponent(error) : tAlerts('emailVerificationFailed')}
            </AlertDescription>
          </Alert>
        )}

        {/* Unverified Email Alert with Resend Button */}
        {unverifiedEmail && (
          <Alert className="mb-4 border-yellow-500 bg-yellow-50">
            <Mail className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <p className="mb-2">{tAlerts('emailNotVerified')}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleResendVerification}
                disabled={isResending}
                className="mt-2"
              >
                {isResending ? tAlerts('sending') : tAlerts('resendVerification')}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('enterEmail')}
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('enterPassword')}
                {...register('password')}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
              />
              <Label htmlFor="rememberMe" className="text-sm">
                {t('rememberMe')}
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              {t('forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? t('signingIn') : t('signIn')}
          </Button>

          <div className="text-center text-sm">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              {t('signUp')}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}