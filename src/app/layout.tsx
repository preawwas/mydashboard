import type { Metadata } from "next";
import { Caveat, Libre_Bodoni, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import ValentineTheme from "@/components/ValentineTheme";
import { LoadingProvider } from "@/components/providers/LoadingProvider";

const libreBodoni = Libre_Bodoni({
  subsets: ["latin"],
  variable: "--font-libre-bodoni",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["500", "600", "700"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Fluffy-ty",
  description: "The Fluffy-ty - Personal Management",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
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
        className={`${libreBodoni.variable} ${caveat.variable} ${notoSansThai.variable} antialiased selection:bg-primary/20`}
      >
        <ValentineTheme />
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}

