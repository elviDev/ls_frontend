"use client";

import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Menu, X, Search, Radio } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/stores/auth-store";
import { AuthNav } from "@/components/auth/auth-nav";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Header() {
  const t = useTranslations("nav");
  const tSearch = useTranslations("search");
  const tAuth = useTranslations("auth");
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useMobile();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="CBStudio Radio"
            width={isMobile ? 40 : 64}
            height={isMobile ? 40 : 64}
            className={cn(isMobile ? "h-10 w-10" : "h-16 w-16")}
          />
        </Link>

        {!isMobile ? (
          <>
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {t("home")}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>{t("listen")}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary to-primary/80 p-6 no-underline outline-none focus:shadow-md"
                            href="/live"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium text-primary-foreground">
                              {t("liveNow")}
                            </div>
                            <p className="text-sm leading-tight text-primary-foreground/90">
                              {t("liveNow")}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/podcasts" title={t("podcasts")}>
                        {t("podcasts")}
                      </ListItem>
                      <ListItem href="/audiobooks" title={t("audiobooks")}>
                        {t("audiobooks")}
                      </ListItem>
                      <ListItem href="/archives" title={t("archives")}>
                        {t("archives")}
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/programs" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {t("programs")}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/events" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {t("events")}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {t("about")}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/contact" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      {t("contact")}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="hidden md:flex items-center space-x-4">
              <form className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={tSearch("placeholder")}
                  className="w-[200px] pl-8 rounded-full bg-muted"
                />
              </form>
              <ThemeToggle />
              <AuthNav />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu
                    className={cn(
                      "h-5 w-5",

                      "text-primary dark:text-white",
                    )}
                  />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <SheetClose asChild>
                      <Link href="/" className="flex items-center">
                        <Image
                          src="/logo.png"
                          alt="CBStudio Radio"
                          width={40}
                          height={40}
                          className="h-10 w-10"
                        />
                      </Link>
                    </SheetClose>
                  </div>
                  <nav className="flex flex-col gap-4 py-4 flex-1">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="px-2 py-1 text-lg font-medium text-foreground hover:text-primary"
                      >
                        {t("home")}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/podcasts"
                        className="px-2 py-1 text-lg font-medium text-foreground hover:text-primary"
                      >
                        {t("podcasts")}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/audiobooks"
                        className="px-2 py-1 text-lg font-medium text-foreground hover:text-primary"
                      >
                        {t("audiobooks")}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/archives"
                        className="px-2 py-1 text-lg font-medium text-foreground hover:text-primary"
                      >
                        {t("archives")}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/programs"
                        className="px-2 py-1 text-lg font-medium text-foreground hover:text-primary"
                      >
                        {t("programs")}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/events"
                        className="px-2 py-1 text-lg font-medium text-foreground hover:text-primary"
                      >
                        {t("events")}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/about"
                        className="px-2 py-1 text-lg font-medium text-foreground hover:text-primary"
                      >
                        {t("about")}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/contact"
                        className="px-2 py-1 text-lg font-medium text-foreground hover:text-primary"
                      >
                        {t("contact")}
                      </Link>
                    </SheetClose>
                  </nav>
                  <div className="border-t border-border pt-4">
                    {user ? (
                      <AuthNav />
                    ) : (
                      <div className="flex flex-col gap-2 w-full">
                        <SheetClose asChild>
                          <Link href="/signin" className="w-full">
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                            >
                              {tAuth("signIn")}
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/register" className="w-full">
                            <Button className="w-full justify-start">
                              {tAuth("signUp")}
                            </Button>
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
