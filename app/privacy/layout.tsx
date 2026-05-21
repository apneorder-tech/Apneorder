import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read ApneOrder's Privacy Policy. Learn how we collect, use, and protect your data when you use our restaurant management platform.",
  alternates: {
    canonical: "https://www.apneorder.com/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
