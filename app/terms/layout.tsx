import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read ApneOrder's Terms of Service. Understand the rules and guidelines for using our QR menu and restaurant ordering platform.",
  alternates: {
    canonical: "https://www.apneorder.com/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
