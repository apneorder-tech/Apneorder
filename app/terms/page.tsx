import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions — ApneOrder",
  description: "Terms and Conditions for using the ApneOrder restaurant management platform.",
};

const EFFECTIVE_DATE = "1 June 2025";
const COMPANY = "ApneOrder";
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

export default function TermsPage() {
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
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Terms and Conditions</h1>
          <p className="text-sm text-zinc-400">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="h-px bg-zinc-100" />

        <p className="text-sm text-zinc-600 leading-relaxed">
          Please read these Terms and Conditions ("Terms") carefully before using the {COMPANY} platform,
          website, or any related services (collectively, the "Service"). By accessing or using our Service,
          you agree to be bound by these Terms. If you do not agree, you must discontinue use immediately.
        </p>

        <Section title="1. About ApneOrder">
          <p>
            {COMPANY} is a SaaS (Software as a Service) platform that provides restaurant owners and managers
            with tools including digital menu management, table-based ordering, real-time kitchen dashboards,
            and subscription billing. The platform is operated from India and governed by Indian law.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            To use ApneOrder, you must be at least 18 years of age, a legally registered business entity or
            individual operating a food service establishment, and capable of entering into binding contracts
            under applicable Indian law.
          </p>
          <p>
            By registering, you represent and warrant that all information you provide is accurate, complete,
            and current.
          </p>
        </Section>

        <Section title="3. Account Registration">
          <p>
            You must create an account to access the platform. You are responsible for maintaining the
            confidentiality of your login credentials and for all activities that occur under your account.
            You must notify us immediately at <a href={`mailto:${EMAIL}`} className="text-emerald-600 hover:underline">{EMAIL}</a> if
            you suspect any unauthorised use of your account.
          </p>
          <p>
            ApneOrder reserves the right to terminate accounts that violate these Terms or remain inactive
            for an extended period.
          </p>
        </Section>

        <Section title="4. Subscription and Billing">
          <p>
            ApneOrder operates on a monthly subscription model priced at <strong className="text-zinc-800">₹1,499 per month</strong> per
            restaurant. Payments are processed securely through Cashfree Payments.
          </p>
          <p>
            Subscriptions renew automatically each month on the billing date unless cancelled. You authorise
            us to charge your payment method on each renewal date. All prices are inclusive of applicable taxes
            unless stated otherwise.
          </p>
          <p>
            Failure to pay on time may result in downgrade or suspension of your account. ApneOrder is not
            responsible for any losses arising from service interruption due to failed payments.
          </p>
        </Section>

        <Section title="5. Cancellation and Refund Policy">
          <p>
            You may cancel your subscription at any time from your account dashboard. Cancellation takes effect
            at the end of the current billing period — you will continue to have access to paid features until
            then.
          </p>
          <p>
            <strong className="text-zinc-800">We do not offer refunds</strong> for partial months or unused
            portions of an active subscription period, except where required by applicable law.
          </p>
          <p>
            If you believe a charge was made in error, contact us at <a href={`mailto:${EMAIL}`} className="text-emerald-600 hover:underline">{EMAIL}</a> within
            7 days of the charge.
          </p>
        </Section>

        <Section title="6. Acceptable Use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Violate any applicable Indian or international laws or regulations</li>
            <li>Upload or transmit fraudulent, misleading, or harmful content</li>
            <li>Attempt to reverse-engineer, decompile, or extract source code from the platform</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
            <li>Use the platform for any purpose other than managing your food service business</li>
            <li>Share your account credentials with unauthorised third parties</li>
          </ul>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            All content, features, design, logos, and software on the ApneOrder platform are the exclusive
            property of {COMPANY} and are protected under Indian copyright and intellectual property laws.
            You may not copy, modify, distribute, or create derivative works without our prior written consent.
          </p>
          <p>
            You retain ownership of your data (menu items, orders, customer information) uploaded to the
            platform. You grant ApneOrder a limited licence to store and process this data solely to provide
            the Service.
          </p>
        </Section>

        <Section title="8. Data and Privacy">
          <p>
            Your use of the Service is also governed by our{" "}
            <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">Privacy Policy</Link>,
            which is incorporated into these Terms by reference. By using the Service, you consent to the
            collection and use of your data as described therein.
          </p>
        </Section>

        <Section title="9. Third-Party Services">
          <p>
            ApneOrder integrates with third-party services including Cashfree Payments, Supabase, and Upstash.
            Your use of these services is subject to their respective terms and privacy policies. We are not
            responsible for the practices of these third parties.
          </p>
        </Section>

        <Section title="10. Disclaimers and Limitation of Liability">
          <p>
            The Service is provided on an "as is" and "as available" basis. ApneOrder makes no warranties,
            express or implied, regarding uptime, accuracy, or fitness for a particular purpose.
          </p>
          <p>
            To the maximum extent permitted by law, ApneOrder shall not be liable for any indirect, incidental,
            special, or consequential damages arising from your use of or inability to use the Service,
            including but not limited to loss of revenue, loss of data, or business interruption.
          </p>
          <p>
            Our total cumulative liability to you shall not exceed the amount paid by you in the three (3)
            months immediately preceding the claim.
          </p>
        </Section>

        <Section title="11. Indemnification">
          <p>
            You agree to indemnify and hold harmless ApneOrder, its directors, employees, and affiliates from
            any claims, losses, damages, or expenses (including legal fees) arising from your breach of these
            Terms or misuse of the Service.
          </p>
        </Section>

        <Section title="12. Modifications to the Service and Terms">
          <p>
            ApneOrder reserves the right to modify, suspend, or discontinue any part of the Service at any time
            with reasonable notice. We also reserve the right to update these Terms. Continued use of the Service
            after changes are posted constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="13. Governing Law and Dispute Resolution">
          <p>
            These Terms are governed by the laws of India. Any disputes arising under these Terms shall be
            subject to the exclusive jurisdiction of the courts located in India. We encourage you to contact
            us first to resolve any disputes amicably before pursuing legal remedies.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm text-zinc-700 space-y-1">
            <p className="font-semibold text-zinc-900">ApneOrder</p>
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
