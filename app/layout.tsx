import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { Providers } from "@/components/providers";
import { NavbarWrapper } from "@/components/layout/navbar-wrapper";
import { RealtimeNotifications } from "@/components/realtime-notifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Design.academy - Gestion de Formation",
  description: "Plateforme de gestion de formation avec Airtable",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <RealtimeNotifications />
          <NavbarWrapper />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
