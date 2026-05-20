import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "ApneOrder",
  description: "QR menu, instant UPI payment, live dashboard — made for Indian restaurants.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "ApneOrder",
    description: "QR menu, instant UPI payment, live dashboard — made for Indian restaurants.",
    images: [{ url: "/logo.png" }],
  },
};

import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
