import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://www.apneorder.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "ApneOrder — QR Menu & UPI Ordering for Indian Restaurants",
    template: "%s | ApneOrder",
  },

  description:
    "ApneOrder helps Indian restaurant owners take orders via QR menu, collect UPI payments instantly, and manage live orders from a single dashboard. Go live in 10 minutes.",

  keywords: [
    "ApneOrder",
    "apne order",
    "QR menu for restaurants",
    "restaurant ordering system India",
    "UPI payment restaurant",
    "restaurant management software India",
    "QR code menu India",
    "Indian restaurant SaaS",
    "online menu for restaurant",
    "table ordering system India",
    "restaurant dashboard",
    "restaurant billing software India",
  ],

  authors: [{ name: "ApneOrder", url: BASE_URL }],
  creator: "ApneOrder",
  publisher: "ApneOrder",

  alternates: {
    canonical: BASE_URL,
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "ApneOrder",
    title: "ApneOrder — QR Menu & UPI Ordering for Indian Restaurants",
    description:
      "Take orders via QR menu, collect UPI payments instantly, and manage live orders from one dashboard. Made for Indian restaurants. Go live in 10 minutes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ApneOrder — QR Menu & UPI Ordering for Indian Restaurants",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ApneOrder — QR Menu & UPI Ordering for Indian Restaurants",
    description:
      "Take orders via QR menu, collect UPI payments instantly, manage live orders. Made for Indian restaurants.",
    images: ["/og-image.png"],
    creator: "@apneorder",
    site: "@apneorder",
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

  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  verification: {
    google: "google09577fd6ee281896",
  },

  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#software`,
      name: "ApneOrder",
      url: BASE_URL,
      description:
        "ApneOrder is a restaurant management SaaS for Indian restaurants. It provides QR-based menu ordering, instant UPI payment collection, and a live order dashboard.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        description: "Early access onboarding for Indian restaurants",
      },
      featureList: [
        "QR Code Menu",
        "UPI Payment Collection",
        "Live Order Dashboard",
        "Table Management",
        "Restaurant Analytics",
      ],
      screenshot: `${BASE_URL}/og-image.png`,
      inLanguage: ["en-IN", "hi"],
      audience: {
        "@type": "Audience",
        audienceType: "Restaurant Owners",
        geographicArea: {
          "@type": "Country",
          name: "India",
        },
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "ApneOrder",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "ApneOrder",
      description: "QR Menu & UPI Ordering System for Indian Restaurants",
      publisher: { "@id": `${BASE_URL}/#organization` },
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="lazyOnload"
        />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
