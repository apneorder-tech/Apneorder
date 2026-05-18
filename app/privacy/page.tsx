import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ApneOrder",
  description: "Learn how ApneOrder collects, uses, and protects your personal data.",
};

const EFFECTIVE_DATE = "1 June 2025";
const EMAIL = "support@apneorder.com";
const WEBSITE = "https://apneorder.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
      <div className="text-zinc-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-100">
        <div className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ApneOrder" className="h-7 w-7 object-contain" />
            <span className="font-black text-zinc-900 text-sm tracking-tight">ApneOrder</span>
          </Link>
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors font-medium">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12 space-y-10">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-zinc-400">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="h-px bg-zinc-100" />

        <p className="text-sm text-zinc-600 leading-relaxed">
          ApneOrder ("we", "us", or "our") is committed to protecting the privacy of restaurant owners,
          managers, and their customers who use our platform. This Privacy Policy explains what data we
          collect, how we use it, and your rights over it. By using our Service, you agree to this policy.
        </p>

        <Section title="1. Information We Collect">
          <p><strong className="text-zinc-800">Account and Business Information</strong></p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Name, email address, and phone number of the restaurant manager/owner</li>
            <li>Restaurant name, city, and owner details</li>
            <li>Subscription and billing information (processed securely via Cashfree Payments)</li>
          </ul>

          <p><strong className="text-zinc-800">Operational Data</strong></p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Menu items, categories, pricing, and availability configured by the restaurant</li>
            <li>Orders placed by end customers including table number, items ordered, and order amounts</li>
            <li>Customer phone numbers provided voluntarily during the ordering process</li>
            <li>Payment method (UPI or cash) and UPI transaction reference IDs</li>
          </ul>

          <p><strong className="text-zinc-800">Technical Data</strong></p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>IP address, browser type, and device information</li>
            <li>Usage logs and activity within the dashboard</li>
            <li>Cookies and session tokens for authentication</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the data collected to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Provide, operate, and maintain the ApneOrder platform</li>
            <li>Process subscription payments and manage billing</li>
            <li>Display real-time orders and analytics on your restaurant dashboard</li>
            <li>Send important service-related notifications (account, billing, and security alerts)</li>
            <li>Improve our platform features based on usage patterns</li>
            <li>Comply with legal obligations under Indian law</li>
            <li>Respond to customer support requests</li>
          </ul>
          <p>
            We do <strong className="text-zinc-800">not</strong> sell, rent, or trade your personal data
            to third parties for marketing purposes.
          </p>
        </Section>

        <Section title="3. Customer Data (End Users of Your Restaurant)">
          <p>
            When your customers scan a QR code and place an order through ApneOrder, we may collect their
            phone number if provided. This data is:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Stored on secure servers hosted by Supabase (PostgreSQL)</li>
            <li>Used solely to associate orders with customers for your restaurant's operational purposes</li>
            <li>Accessible only to you (the restaurant manager) and ApneOrder staff for support purposes</li>
            <li>Never shared with third parties or used for marketing without explicit consent</li>
          </ul>
          <p>
            As a restaurant using ApneOrder, you are the data controller for your customers' information.
            You are responsible for informing your customers about data collection at your point of service.
          </p>
        </Section>

        <Section title="4. Data Storage and Security">
          <p>
            All data is stored on secure cloud infrastructure provided by Supabase (hosted on AWS). We
            implement industry-standard security measures including:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>HTTPS encryption for all data in transit</li>
            <li>Encrypted database connections with access controls</li>
            <li>HMAC-signed authentication tokens for admin access</li>
            <li>HTTPOnly, Secure, and SameSite cookie attributes to prevent session hijacking</li>
          </ul>
          <p>
            While we take reasonable precautions, no method of transmission over the internet is 100% secure.
            We cannot guarantee absolute security of your data.
          </p>
        </Section>

        <Section title="5. Third-Party Services">
          <p>We use the following third-party services to operate the platform:</p>
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 space-y-2 text-sm">
            {[
              { name: "Cashfree Payments", purpose: "Processing subscription payments securely" },
              { name: "Supabase", purpose: "Database hosting and user authentication" },
              { name: "Upstash Redis", purpose: "Menu caching for faster load times" },
              { name: "Vercel", purpose: "Application hosting and deployment" },
            ].map((s) => (
              <div key={s.name} className="flex gap-3">
                <span className="font-semibold text-zinc-800 w-36 shrink-0">{s.name}</span>
                <span className="text-zinc-500">{s.purpose}</span>
              </div>
            ))}
          </div>
          <p>
            Each of these services has its own privacy policy governing the data they process. We encourage
            you to review them independently.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            ApneOrder uses cookies and similar tracking technologies to maintain your authenticated session
            and improve the user experience. We use:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-zinc-800">Session cookies</strong> — to keep you logged in securely</li>
            <li><strong className="text-zinc-800">Functional cookies</strong> — to remember your preferences</li>
          </ul>
          <p>
            We do not use advertising or tracking cookies. You can disable cookies in your browser settings,
            but this may affect platform functionality.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We retain your account and business data for as long as your account is active. If you cancel
            your subscription and close your account, we will delete your personal data within 90 days,
            except where we are required by law to retain it (such as billing records for tax compliance).
          </p>
          <p>
            Order data may be retained in anonymised form for platform analytics.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Under applicable Indian data protection laws, you have the right to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-zinc-800">Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong className="text-zinc-800">Correction</strong> — request correction of inaccurate or incomplete data</li>
            <li><strong className="text-zinc-800">Deletion</strong> — request deletion of your personal data (subject to legal obligations)</li>
            <li><strong className="text-zinc-800">Portability</strong> — request your data in a commonly used, machine-readable format</li>
            <li><strong className="text-zinc-800">Withdrawal of Consent</strong> — withdraw consent for data processing at any time</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href={`mailto:${EMAIL}`} className="text-emerald-600 hover:underline">{EMAIL}</a>.
            We will respond within 30 days.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            ApneOrder is not directed at individuals under the age of 18. We do not knowingly collect
            personal data from minors. If we become aware that a minor has provided personal data, we
            will delete it promptly.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes
            via email or a prominent notice on the platform. Continued use of the Service after changes are
            posted constitutes your acceptance of the revised policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            If you have any questions, concerns, or requests regarding your privacy, please contact us:
          </p>
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm text-zinc-700 space-y-1">
            <p className="font-semibold text-zinc-900">ApneOrder — Privacy Team</p>
            <p>Email: <a href={`mailto:${EMAIL}`} className="text-emerald-600 hover:underline">{EMAIL}</a></p>
            <p>Website: <a href={WEBSITE} className="text-emerald-600 hover:underline">{WEBSITE}</a></p>
          </div>
        </Section>

        <div className="h-px bg-zinc-100" />

        <p className="text-xs text-zinc-400 text-center pb-8">
          © {new Date().getFullYear()} ApneOrder. All rights reserved.
        </p>
      </main>
    </div>
  );
}
