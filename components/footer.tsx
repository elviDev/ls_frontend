import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tSite = useTranslations("site");

  return (
    <footer className="bg-primary dark:bg-darkTeam text-primary-foreground dark:text-white pt-12 pb-6 mt-auto">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="CBStudio Radio"
                width={64}
                height={64}
                className="h-16 w-16"
              />
            </div>
            <p className="text-primary-foreground/70 dark:text-gray-400 mb-4">
              {t("description")}
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-primary-foreground/60 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-primary-foreground/60 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-primary-foreground/60 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-primary-foreground/60 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
              >
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-primary-foreground dark:text-white text-lg mb-4">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-primary-foreground/70 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
                >
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/programs"
                  className="text-primary-foreground/70 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
                >
                  {tNav("programs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/podcasts"
                  className="text-primary-foreground/70 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
                >
                  {tNav("podcasts")}
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-primary-foreground/70 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
                >
                  {tNav("events")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-primary-foreground/70 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
                >
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-primary-foreground dark:text-white text-lg mb-4">
              {t("resources")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-primary-foreground/70 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
                >
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  href="/advertise"
                  className="text-primary-foreground/70 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
                >
                  {t("advertiseWithUs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-primary-foreground/70 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
                >
                  {t("careers")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-primary-foreground/70 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-primary-foreground/70 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 transition-colors"
                >
                  {t("termsOfService")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-primary-foreground dark:text-white text-lg mb-4">
              {t("subscribe")}
            </h3>
            <p className="text-primary-foreground/70 dark:text-gray-400 mb-4">
              {t("subscribeDescription")}
            </p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder={t("yourEmail")}
                className="bg-primary/20 dark:bg-slate-800 border-primary-foreground/30 dark:border-gray-600 text-primary-foreground dark:text-white placeholder:text-primary-foreground/50 dark:placeholder:text-gray-500"
              />
              <Button className="w-full bg-background dark:bg-white hover:bg-background/90 dark:hover:bg-gray-100 text-foreground dark:text-[#0F172A]">
                {t("subscribeButton")}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 dark:border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} {tSite("name")}. {t("copyright")}.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-primary-foreground/60 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 text-sm transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-primary-foreground/60 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 text-sm transition-colors"
            >
              {t("terms")}
            </Link>
            <Link
              href="/cookies"
              className="text-primary-foreground/60 dark:text-gray-400 hover:text-primary-foreground dark:hover:text-cyan-400 text-sm transition-colors"
            >
              {t("cookies")}
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-primary-foreground/20 dark:border-gray-700 flex flex-wrap justify-center gap-6">
          <img
            src="/placeholder.svg?height=40&width=120&text=Partner+Logo"
            alt="Partner Logo"
            className="h-10 opacity-70 dark:opacity-50 hover:opacity-100 dark:hover:opacity-80 transition-opacity"
          />
          <img
            src="/placeholder.svg?height=40&width=120&text=Partner+Logo"
            alt="Partner Logo"
            className="h-10 opacity-70 dark:opacity-50 hover:opacity-100 dark:hover:opacity-80 transition-opacity"
          />
          <img
            src="/placeholder.svg?height=40&width=120&text=Partner+Logo"
            alt="Partner Logo"
            className="h-10 opacity-70 dark:opacity-50 hover:opacity-100 dark:hover:opacity-80 transition-opacity"
          />
          <img
            src="/placeholder.svg?height=40&width=120&text=Partner+Logo"
            alt="Partner Logo"
            className="h-10 opacity-70 dark:opacity-50 hover:opacity-100 dark:hover:opacity-80 transition-opacity"
          />
        </div>
      </div>
    </footer>
  );
}
