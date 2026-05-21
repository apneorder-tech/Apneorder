import type { Metadata } from "next"
import AuthRedirect from "./_components/auth-redirect"
import HomePageClient from "./_components/home-page-client"

const BASE_URL = "https://www.apneorder.com"

export const metadata: Metadata = {
  title: "ApneOrder — QR Menu & UPI Ordering System for Indian Restaurants",
  description:
    "ApneOrder is a QR menu and UPI payment ordering system for Indian restaurants. Customers scan, order, and pay directly to your UPI — no app needed. Go live in 10 minutes.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "ApneOrder — QR Menu & UPI Ordering System for Indian Restaurants",
    description:
      "QR menu ordering, direct UPI collection, and a live order dashboard for Indian restaurant owners. Setup in 10 minutes. No app needed for customers.",
    url: BASE_URL,
  },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is ApneOrder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ApneOrder is a QR menu and UPI payment ordering system built specifically for Indian restaurants. Restaurant owners can set up a digital QR menu, collect UPI payments directly to their account, and manage all live orders from one dashboard — without building an app or hiring any technical staff.",
      },
    },
    {
      "@type": "Question",
      name: "How does QR menu ordering work for my restaurant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You get a unique QR code for each table. When customers scan it with their phone camera, they see your full menu instantly — no app download needed. They browse, select items, and place their order directly. The order appears on your live kitchen dashboard immediately.",
      },
    },
    {
      "@type": "Question",
      name: "How do UPI payments work with ApneOrder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Customers pay directly to your restaurant's UPI ID — the money goes straight to your account with zero transaction fees from ApneOrder. Payments via GPay, PhonePe, Paytm, or any UPI app are fully supported.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to set up ApneOrder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most restaurants go live within 10 minutes. You add your restaurant details, upload your menu items and categories, set your UPI ID, and download your table QR codes. Our guided setup flow walks you through each step.",
      },
    },
    {
      "@type": "Question",
      name: "Do customers need to download an app to use ApneOrder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No app download needed. Customers simply scan the QR code on their table using their phone's default camera app, and the menu opens directly in their browser. It works on any Android or iPhone — no installation required.",
      },
    },
    {
      "@type": "Question",
      name: "Is ApneOrder suitable for small restaurants in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — ApneOrder is designed specifically for small and mid-size Indian restaurants, dhabas, cafes, and food courts. Setup requires no technical knowledge, and the pricing is built around what small restaurant owners can justify on a monthly basis.",
      },
    },
    {
      "@type": "Question",
      name: "How much does ApneOrder cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ApneOrder is available at ₹1,499 per month with no hidden charges. This includes unlimited tables, QR menu ordering, direct UPI payments, a live order dashboard, waiter call system, and full branding customization. There are no per-transaction fees or setup charges.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize the menu and branding for my restaurant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can add your restaurant name, logo, brand colours, menu categories, item descriptions, prices, and photos. The QR menu your customers see reflects your restaurant's brand. You can update the menu anytime from your dashboard — changes go live instantly.",
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <AuthRedirect />
      <HomePageClient />
    </>
  )
}
