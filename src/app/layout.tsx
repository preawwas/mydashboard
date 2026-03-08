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
  themeColor: '#8B5CF6',
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
        className={`${montserrat.variable} font-sans antialiased`}
      >
        <ValentineTheme />
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
