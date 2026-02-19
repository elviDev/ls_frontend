import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Mic, Music, Globe } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "About CBStudio Radio - Professional Audiobook Production Studio",
  description: "Learn about CBStudio Radio's mission to create exceptional audiobooks with professional narrators, original soundtracks, and HD sound effects. Discover our team and story.",
  keywords: "about cinema book, audiobook production team, professional narrators, audio production studio, digital storytelling",
  openGraph: {
    title: "About CBStudio Radio - Professional Audiobook Production Studio",
    description: "Learn about CBStudio Radio's mission to create exceptional audiobooks with professional narrators, original soundtracks, and HD sound effects.",
    type: "website",
  },
};

export default async function AboutPage() {
  const t = await getTranslations('aboutPage');
  const tAbout = await getTranslations('about');
  
  const features = [
    {
      icon: BookOpen,
      title: t('features.professionalAudiobooks'),
      description: t('features.professionalAudiobooksDesc')
    },
    {
      icon: Mic,
      title: t('features.expertNarration'),
      description: t('features.expertNarrationDesc')
    },
    {
      icon: Music,
      title: t('features.originalSoundtracks'),
      description: t('features.originalSoundtracksDesc')
    },
    {
      icon: Globe,
      title: t('features.multilanguageSupport'),
      description: t('features.multilanguageSupportDesc')
    }
  ];

  const stats = [
    { value: "500+", label: tAbout('stats.audiobooks') },
    { value: "50+", label: tAbout('stats.narrators') },
    { value: "15+", label: tAbout('stats.languages') },
    { value: "2018", label: tAbout('stats.founded') }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            {t('subtitle')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full"></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('ourMission')}</h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {t('missionText')}
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Story */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('ourStory')}</h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  {t('storyParagraph1')}
                </p>
                <p>
                  {t('storyParagraph2')}
                </p>
                <p>
                  {t('storyParagraph3')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}