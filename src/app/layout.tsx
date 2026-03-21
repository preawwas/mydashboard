import type { Metadata } from "next";
import { Libre_Bodoni, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import ValentineTheme from "@/components/ValentineTheme";
import { LoadingProvider } from "@/components/providers/LoadingProvider";

const libreBodoni = Libre_Bodoni({
  subsets: ["latin"],
  variable: "--font-libre-bodoni",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pwsnboard - Personal Management",
  description: "Personal Management System",
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#2E7D7F',
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
        className={`${libreBodoni.variable} ${notoSansThai.variable} antialiased selection:bg-primary/20`}
      >
        <ValentineTheme />
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}

