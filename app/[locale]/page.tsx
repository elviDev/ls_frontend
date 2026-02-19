import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Play, Calendar, Headphones, BookOpen, Radio } from "lucide-react";
import FeaturedPodcasts from "@/components/featured-podcasts";
import UpcomingEvents from "@/components/upcoming-events";
import FeaturedPrograms from "@/components/featured-programs";
import HeroAnimation from "@/components/hero-animation";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "CBStudio Radio - Professional Audiobook Production",
  description: "Professional audiobook production with original soundtracks, professional narrators, HD sound effects, and multilanguage translations. Your premier destination for digital storytelling.",
  keywords: "audiobook production, professional narrators, original soundtrack, HD sound effects, multilanguage translations, digital storytelling",
  openGraph: {
    title: "CBStudio Radio - Professional Audiobook Production",
    description: "Professional audiobook production with original soundtracks, professional narrators, HD sound effects, and multilanguage translations.",
    type: "website",
  },
};

export default async function Home() {
  const t = await getTranslations('homepage');
  const tCommon = await getTranslations('common');
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/pexels-chuck-3587478.jpg"
            alt="Professional audio recording studio background"
            fill
            className="object-cover object-center opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-primary/40"></div>
        </div>
        <div className="absolute inset-0 z-0">
          <HeroAnimation />
        </div>
        <div className="container relative z-10 flex flex-col items-center justify-center h-full px-4 mx-auto text-center text-primary-foreground">
          <h1 className="font-serif text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6 animate-fade-in">
            <span className="block">{t('hero.title')}</span>
            <span className="block text-2xl sm:text-3xl md:text-4xl mt-2 text-primary-foreground/80">
              {t('hero.subtitle')}
            </span>
          </h1>
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-delay">
            <p className="text-xl md:text-2xl">
              {t('hero.features.ost')}
            </p>
            <p className="text-xl md:text-2xl">{t('hero.features.narrators')}</p>
            <p className="text-xl md:text-2xl">{t('hero.features.sound')}</p>
            <p className="text-xl md:text-2xl">{t('hero.features.multilanguage')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fade-in-delay-2">
            <Link href="/podcasts">
              <Button
                size="lg"
                className="bg-background hover:bg-muted text-foreground"
              >
                <Play className="mr-2 h-5 w-5" /> {t('hero.listenNow')}
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-primary-foreground bg-transparent border-primary-foreground hover:bg-primary-foreground/10"
              >
                {t('hero.startProject')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="section-padding bg-background">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="group cursor-pointer">
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-all group-hover:scale-105">
                <div className="p-3 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <Radio className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-2">
                  {t('features.liveBroadcasts.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('features.liveBroadcasts.description')}
                </p>
              </div>
            </div>
            <Link href="/podcasts" className="group">
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-all group-hover:scale-105">
                <div className="p-3 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <Headphones className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-2">
                  {t('features.podcasts.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('features.podcasts.description')}
                </p>
              </div>
            </Link>
            <Link href="/audiobooks" className="group">
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-all group-hover:scale-105">
                <div className="p-3 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-2">
                  {t('features.audiobooks.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('features.audiobooks.description')}
                </p>
              </div>
            </Link>
            <Link href="/events" className="group">
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card shadow-sm hover:shadow-md transition-all group-hover:scale-105">
                <div className="p-3 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-2">
                  {t('features.archives.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('features.archives.description')}
                </p>
              </div>
            </Link>
          </div>

          <div className="mb-20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-serif font-bold">
                {t('features.podcasts.title')}
              </h2>
              <Link
                href="/podcasts"
                className="text-primary hover:text-primary/80 font-medium"
              >
                {t('viewAllPrograms')}
              </Link>
            </div>
            <FeaturedPodcasts />
          </div>

          <div className="mb-20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-serif font-bold">{t('viewAllEvents').replace(' →', '')}</h2>
              <Link
                href="/events"
                className="text-primary hover:text-primary/80 font-medium"
              >
                {t('viewAllEvents')}
              </Link>
            </div>
            <UpcomingEvents />
          </div>

          <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-serif font-bold">
                {t('viewAllPrograms').replace(' →', '')}
              </h2>
              <Link
                href="/programs"
                className="text-primary hover:text-primary/80 font-medium"
              >
                {t('viewAllPrograms')}
              </Link>
            </div>
            <FeaturedPrograms />
          </div>
        </div>
      </section>

      {/* Professional Team Section */}
      <section className="section-padding bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/placeholder.svg?height=600&width=600&text=Team+Image"
                alt="Professional Team"
                width={600}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold mb-6">
                {t('professionalTeam.title')}
              </h2>
              <p className="text-lg mb-6">
                {t('professionalTeam.description1')}
              </p>
              <p className="text-lg mb-8">
                {t('professionalTeam.description2')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-primary mr-2">•</div>
                  <p>{t('professionalTeam.feature1')}</p>
                </div>
                <div className="flex items-start">
                  <div className="text-primary mr-2">•</div>
                  <p>{t('professionalTeam.feature2')}</p>
                </div>
                <div className="flex items-start">
                  <div className="text-primary mr-2">•</div>
                  <p>{t('professionalTeam.feature3')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            {t('professionalTeam.title')}
          </h2>
          <p className="max-w-[600px] mx-auto mb-8 text-primary-foreground/80">
            {t('professionalTeam.description2')}
          </p>
          <Link href="/contact">
            <Button className="bg-background hover:bg-muted text-foreground px-8 py-6 text-lg">
              {tCommon('contact')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
