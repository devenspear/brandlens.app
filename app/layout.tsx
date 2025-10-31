import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrandLens - AI-Powered Brand Analysis & Positioning Insights",
  description: "Get instant AI-powered analysis of your brand positioning, messaging, and competitive differentiation. BrandLens uses multiple LLMs to provide comprehensive brand insights and actionable recommendations.",
  keywords: ["brand analysis", "brand positioning", "AI brand insights", "competitive analysis", "brand strategy", "messaging analysis", "brand differentiation"],
  authors: [{ name: "BrandLens" }],
  creator: "BrandLens",
  publisher: "BrandLens",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://brandlens.app"),
  openGraph: {
    title: "BrandLens - AI-Powered Brand Analysis",
    description: "Get instant AI-powered analysis of your brand positioning, messaging, and competitive differentiation.",
    url: "https://brandlens.app",
    siteName: "BrandLens",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BrandLens - AI-Powered Brand Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandLens - AI-Powered Brand Analysis",
    description: "Get instant AI-powered analysis of your brand positioning, messaging, and competitive differentiation.",
    images: ["/og-image.png"],
  },
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
