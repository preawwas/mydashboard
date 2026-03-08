import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import ValentineTheme from "@/components/ValentineTheme";
import { LoadingProvider } from "@/components/providers/LoadingProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pwsnboard - Personal Management",
  description: "Personal Management System",
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${montserrat.className} antialiased selection:bg-primary/20`}
      >
        <ValentineTheme />
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
