import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tSite = useTranslations('site');
  
  return (
    <footer className="bg-brand-700 text-white pt-12 pb-6 mt-auto">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                <span className="font-serif text-brand-700 text-lg font-bold">
                  CB
                </span>
              </div>
              <span className="font-serif font-bold text-xl text-white">
                {tSite('name')}
              </span>
            </div>
            <p className="text-brand-100 mb-4">
              {t('description')}
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-brand-200 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-brand-200 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-brand-200 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-brand-200 hover:text-white transition-colors"
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-white text-lg mb-4">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-brand-100 hover:text-white transition-colors"
                >
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/programs"
                  className="text-brand-100 hover:text-white transition-colors"
                >
                  {tNav('programs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/podcasts"
                  className="text-brand-100 hover:text-white transition-colors"
                >
                  {tNav('podcasts')}
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-brand-100 hover:text-white transition-colors"
                >
                  {tNav('events')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-brand-100 hover:text-white transition-colors"
                >
                  {tNav('contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-white text-lg mb-4">
              {t('resources')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-brand-100 hover:text-white transition-colors"
                >
                  {t('helpCenter')}
                </Link>
              </li>
              <li>
                <Link
                  href="/advertise"
                  className="text-brand-100 hover:text-white transition-colors"
                >
                  {t('advertiseWithUs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-brand-100 hover:text-white transition-colors"
                >
                  {t('careers')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-brand-100 hover:text-white transition-colors"
                >
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-brand-100 hover:text-white transition-colors"
                >
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-white text-lg mb-4">
              {t('subscribe')}
            </h3>
            <p className="text-brand-100 mb-4">
              {t('subscribeDescription')}
            </p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder={t('yourEmail')}
                className="bg-brand-600 border-brand-500 text-white placeholder:text-brand-300"
              />
              <Button className="w-full bg-white hover:bg-brand-100 text-brand-700">
                {t('subscribeButton')}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-brand-600 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-brand-200 text-sm">
            © {new Date().getFullYear()} {tSite('name')}. {t('copyright')}.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-brand-200 hover:text-white text-sm transition-colors"
            >
              {t('privacy')}
            </Link>
            <Link
              href="/terms"
              className="text-brand-200 hover:text-white text-sm transition-colors"
            >
              {t('terms')}
            </Link>
            <Link
              href="/cookies"
              className="text-brand-200 hover:text-white text-sm transition-colors"
            >
              {t('cookies')}
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-600 flex flex-wrap justify-center gap-6">
          <img
            src="/placeholder.svg?height=40&width=120&text=Partner+Logo"
            alt="Partner Logo"
            className="h-10 opacity-70 hover:opacity-100 transition-opacity"
          />
          <img
            src="/placeholder.svg?height=40&width=120&text=Partner+Logo"
            alt="Partner Logo"
            className="h-10 opacity-70 hover:opacity-100 transition-opacity"
          />
          <img
            src="/placeholder.svg?height=40&width=120&text=Partner+Logo"
            alt="Partner Logo"
            className="h-10 opacity-70 hover:opacity-100 transition-opacity"
          />
          <img
            src="/placeholder.svg?height=40&width=120&text=Partner+Logo"
            alt="Partner Logo"
            className="h-10 opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </footer>
  );
}
