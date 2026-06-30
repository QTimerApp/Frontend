import type { Metadata, Viewport } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { MotionConfig } from "framer-motion";
import { ModalProvider } from "@/lib/contexts/Modal";
import { ModalContainer } from "@/components/modals/Container";
import { SettingsApplier } from "@/features/settings/SettingsApplier";
import { SettingsModal } from "@/features/settings/SettingsModal";
import { Sidebar } from "@/features/sessions/Sidebar";
import { MobileMenu } from "@/components/MobileMenu";
import { MobileNav } from "@/components/MobileNav";
import { PwaRegister } from "@/components/PwaRegister";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CommandPalette } from "@/components/CommandPalette";
import { AppToaster, SettingsWatcher } from "@/components/ToasterProvider";

const font = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const title = "QTimer";
const description =
  "A modern Rubik's Cube timer for speedcubers. Track solves, analyse averages, and improve your times.";

export const viewport: Viewport = {
  themeColor: "#080604",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title,
  description,
  applicationName: "QTimer",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Rubik's Cube",
    "speedcube",
    "timer",
    "speedcubing",
    "puzzle timer",
  ],
  authors: [{ name: "QTimer" }],
  creator: "QTimer",
  publisher: "QTimer",
  metadataBase: new URL("https://qtimer.pancake.wtf"),
  openGraph: {
    title,
    description,
    url: "https://qtimer.pancake.wtf",
    siteName: "QTimer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <PwaRegister />
        <ModalProvider>
          <MotionConfig reducedMotion="user">
            <SettingsApplier />
            <AppToaster />
            <SettingsWatcher />
            <div className="main flex h-screen text-primary bg-bg-surface">
              <div className="hidden md:flex shrink-0">
                <ErrorBoundary>
                  <Sidebar />
                </ErrorBoundary>
              </div>
              <ErrorBoundary>
                <div className="flex flex-1 min-w-0 pb-14 md:pb-0">{children}</div>
              </ErrorBoundary>
            </div>
            <CommandPalette />
            <MobileMenu />
            <MobileNav />
            <SettingsModal />
            <ModalContainer />
          </MotionConfig>
        </ModalProvider>
      </body>
    </html>
  );
}
