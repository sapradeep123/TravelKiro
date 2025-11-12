import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Travel Encyclopedia - Discover Amazing Destinations",
  description: "Explore locations, events, packages, and accommodations across India. Your comprehensive travel guide.",
  keywords: ["travel", "tourism", "India", "destinations", "events", "packages"],
  authors: [{ name: "Butterfliy" }],
  openGraph: {
    title: "Travel Encyclopedia",
    description: "Discover amazing destinations across India",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
