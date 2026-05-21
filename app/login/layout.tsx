import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your ApneOrder account and manage your restaurant's QR menu, UPI payments, and live orders.",
  alternates: {
    canonical: "https://www.apneorder.com/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
