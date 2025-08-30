import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL('https://oomf-analyzer.vercel.app'),
  title: "OOMF Analyzer - Twitter Personality Analysis",
  description: "Discover your Twitter personality type with our AI-powered 4D personality grid analyzer. Find out if you're desperate, performative, crying for help, or a ragebaiter!",
  keywords: ["Twitter", "personality", "analyzer", "AI", "social media", "analysis", "oomf"],
  authors: [{ name: "@combif1am" }, { name: "@lowkeyverybored" }],
  creator: "@combif1am & @lowkeyverybored",
  publisher: "OOMF Analyzer",
  robots: "index, follow",
  openGraph: {
    title: "OOMF Analyzer - Twitter Personality Analysis",
    description: "Discover your Twitter personality type with our AI-powered 4D personality grid analyzer",
    type: "website",
    url: "https://oomf-analyzer.vercel.app",
    siteName: "OOMF Analyzer",
    images: [
      {
        url: "/apple-touch-icon.png",
        width: 180,
        height: 180,
        alt: "OOMF Analyzer Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OOMF Analyzer - Twitter Personality Analysis",
    description: "Discover your Twitter personality type with our AI-powered 4D personality grid analyzer",
    images: ["/apple-touch-icon.png"],
    creator: "@combif1am",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#EF88AD",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.gstatic.com/s/comicsansms/v1/4UaDrEJFqYhaShnGvWF9Bg.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="https://fonts.gstatic.com/s/comicsansms/v1/4UaDrEJFqYhaShnGvWF9Bg.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#EF88AD" />
        <meta name="msapplication-TileColor" content="#EF88AD" />
        <meta name="theme-color" content="#EF88AD" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
