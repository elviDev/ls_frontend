"use client";

import type React from "react";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const t = useTranslations('contactPage');
  const tInquiry = useTranslations('inquiryTypes');
  const tAppointment = useTranslations('appointmentTypes');
  const tAdvertising = useTranslations('advertisingOptions');
  const tBudget = useTranslations('budgetRanges');
  const [date, setDate] = useState<Date>();
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle form submission here
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-brand-100 dark:bg-brand-900 p-3 w-14 h-14 flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-brand-600 dark:text-brand-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('callUs')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('businessHours')}
            </p>
            <p className="font-medium">+1 (555) 123-4567</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-brand-100 dark:bg-brand-900 p-3 w-14 h-14 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-brand-600 dark:text-brand-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('emailUs')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('responseTime')}
            </p>
            <p className="font-medium">contact@wavestream.example</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-brand-100 dark:bg-brand-900 p-3 w-14 h-14 flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-brand-600 dark:text-brand-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('visitUs')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('officeLocation')}
            </p>
            <p className="font-medium">
              123 Broadcast Ave, Suite 200
              <br />
              Media City, CA 90210
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('getInTouch')}</h2>

          <Tabs defaultValue="message">
            <TabsList className="mb-6">
              <TabsTrigger value="message">{t('tabs.message')}</TabsTrigger>
              <TabsTrigger value="appointment">{t('tabs.appointment')}</TabsTrigger>
              <TabsTrigger value="advertise">{t('tabs.advertise')}</TabsTrigger>
            </TabsList>

            <TabsContent value="message">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">{t('form.firstName')}</Label>
                    <Input id="first-name" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">{t('form.lastName')}</Label>
                    <Input id="last-name" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('form.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t('form.subject')}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.selectSubject')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{tInquiry('generalInquiry')}</SelectItem>
                      <SelectItem value="support">{tInquiry('technicalSupport')}</SelectItem>
                      <SelectItem value="feedback">{tInquiry('feedback')}</SelectItem>
                      <SelectItem value="partnership">
                        {tInquiry('partnershipOpportunity')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t('form.message')}</Label>
                  <Textarea
                    id="message"
                    placeholder={t('form.messagePlaceholder')}
                    className="min-h-[150px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700"
                >
                  {t('form.sendMessage')}
                </Button>

                {formSubmitted && (
                  <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>
                      {t('success.messageSent')}
                    </span>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="appointment">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment-name">{t('form.fullName')}</Label>
                    <Input
                      id="appointment-name"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointment-email">{t('form.email')}</Label>
                    <Input
                      id="appointment-email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment-type">{t('form.appointmentType')}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.selectAppointmentType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio-tour">{tAppointment('studioTour')}</SelectItem>
                      <SelectItem value="podcast-guest">
                        {tAppointment('podcastGuest')}
                      </SelectItem>
                      <SelectItem value="business-meeting">
                        {tAppointment('businessMeeting')}
                      </SelectItem>
                      <SelectItem value="consultation">{tAppointment('consultation')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('form.preferredDate')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : t('form.selectDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>{t('form.preferredTime')}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.selectTime')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9am">9:00 AM</SelectItem>
                      <SelectItem value="10am">10:00 AM</SelectItem>
                      <SelectItem value="11am">11:00 AM</SelectItem>
                      <SelectItem value="1pm">1:00 PM</SelectItem>
                      <SelectItem value="2pm">2:00 PM</SelectItem>
                      <SelectItem value="3pm">3:00 PM</SelectItem>
                      <SelectItem value="4pm">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment-notes">{t('form.additionalNotes')}</Label>
                  <Textarea
                    id="appointment-notes"
                    placeholder={t('form.appointmentNotesPlaceholder')}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700"
                >
                  {t('form.requestAppointment')}
                </Button>

                {formSubmitted && (
                  <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>
                      {t('success.appointmentSubmitted')}
                    </span>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="advertise">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">{t('form.companyName')}</Label>
                    <Input id="company-name" placeholder="Acme Inc." required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">{t('form.contactName')}</Label>
                    <Input id="contact-name" placeholder="John Doe" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">{t('form.email')}</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">{t('form.phone')}</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('form.advertisingInterest')}</Label>
                  <RadioGroup
                    defaultValue="podcast"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="podcast" id="podcast" />
                      <Label htmlFor="podcast">{tAdvertising('podcastSponsorship')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="live" id="live" />
                      <Label htmlFor="live">{tAdvertising('liveBroadcastAds')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="website" id="website" />
                      <Label htmlFor="website">{tAdvertising('websiteBanners')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="app" id="app" />
                      <Label htmlFor="app">{tAdvertising('inAppPromotions')}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">{t('form.estimatedBudget')}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.selectBudget')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under5k">{tBudget('under5k')}</SelectItem>
                      <SelectItem value="5k-10k">{tBudget('5kTo10k')}</SelectItem>
                      <SelectItem value="10k-25k">{tBudget('10kTo25k')}</SelectItem>
                      <SelectItem value="25k-50k">{tBudget('25kTo50k')}</SelectItem>
                      <SelectItem value="over50k">{tBudget('over50k')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-details">{t('form.campaignDetails')}</Label>
                  <Textarea
                    id="campaign-details"
                    placeholder={t('form.campaignDetailsPlaceholder')}
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700"
                >
                  {t('form.submitInquiry')}
                </Button>

                {formSubmitted && (
                  <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>
                      {t('success.advertisingReceived')}
                    </span>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">
            {t('faq.title')}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('faq.q1')}
              </h3>
              <p className="text-muted-foreground">
                {t('faq.a1')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('faq.q2')}
              </h3>
              <p className="text-muted-foreground">
                {t('faq.a2')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('faq.q3')}
              </h3>
              <p className="text-muted-foreground">
                {t('faq.a3')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('faq.q4')}
              </h3>
              <p className="text-muted-foreground">
                {t('faq.a4')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('faq.q5')}
              </h3>
              <p className="text-muted-foreground">
                {t('faq.a5')}
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-muted rounded-xl">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-brand-100 dark:bg-brand-900 p-2 mt-1">
                <MessageSquare className="h-5 w-5 text-brand-600 dark:text-brand-300" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('faq.stillHaveQuestions')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('faq.supportReady')}
                </p>
                <Button variant="outline" size="sm">
                  {t('faq.chatWithSupport')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden h-[400px] relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.7152203627526!2d-118.35845492424365!3d34.0764938726045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2b8d3b1e0287d%3A0x9cc32be17df028b8!2sCBS%20Television%20City!5e0!3m2!1sen!2sus!4v1682458335242!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="WaveStream Location"
          className="absolute inset-0"
        ></iframe>
      </div>
    </div>
  );
}
