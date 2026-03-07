import type { Metadata } from "next";
import { Albert_Sans, Prompt } from "next/font/google";
import "./globals.css";
import ValentineTheme from "@/components/ValentineTheme";
import { LoadingProvider } from "@/components/providers/LoadingProvider";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
  display: "swap",
});

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Memo - Premium Fintech Dashboard",
  description: "ระบบจัดการการเงินส่วนบุคคล - ติดตามการลงทุนและค่าใช้จ่าย",
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
        className={`${albertSans.variable} ${prompt.variable} font-sans antialiased`}
      >
        <ValentineTheme />
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
