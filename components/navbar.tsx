import Link from "next/link"
import { AuthNav } from "@/components/auth/auth-nav"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTranslations } from "next-intl"

export function Navbar() {
  const t = useTranslations('navbar');
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          {t('nextAuth')}
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-primary">
            {t('home')}
          </Link>
          <AuthNav />
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
