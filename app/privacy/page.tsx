import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Prima Facie",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-[#F5F2EC] mb-4 pb-3 border-b border-[#1A1A1A]">
        {title}
      </h2>
      <div className="space-y-3 font-[family-name:var(--font-montserrat)] text-sm leading-relaxed text-[#B0AA9E]">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#0A0A0A] pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.5em] uppercase text-[#C9A84C] mb-4">
              Legal
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-light text-[#F5F2EC] mb-4">
              Privacy Policy
            </h1>
            <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">
              Effective date: 1 June 2025 · Last updated: 1 June 2025
            </p>
          </div>

          <div className="font-[family-name:var(--font-montserrat)] text-sm text-[#B0AA9E] leading-relaxed mb-10 p-6 border border-[#C9A84C]/20 bg-[#111111]">
            <p>
              Prima Facie (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates primafacie.in. We are honest about what we do with your data — the same way we are honest about everything else. This policy explains what we collect, why we collect it, and what we do with it.
            </p>
            <p className="mt-3 text-[#C9A84C]">
              Short version: We collect what we need to run the platform. We don&apos;t sell it. We delete rejected applicants&apos; photos within 48 hours. End of story.
            </p>
          </div>

          <Section title="1. Information we collect">
            <p><span className="text-[#F5F2EC]">Application data:</span> When you apply, we collect your full name, email address, age, city, gender, a photo of yourself, and a selfie for identity verification.</p>
            <p><span className="text-[#F5F2EC]">Payment data:</span> Application fees (₹9) and premium subscriptions (₹5,999/month) are processed by Razorpay. We receive a payment confirmation ID. We do not store your card number, UPI ID, or banking credentials — Razorpay handles all payment data under their own privacy policy.</p>
            <p><span className="text-[#F5F2EC]">Communications:</span> If you contact us via the contact form, we store your name, email, subject, and message.</p>
            <p><span className="text-[#F5F2EC]">Usage data:</span> We may collect standard server logs (IP address, browser type, pages visited) to maintain and improve the platform. We do not use third-party analytics trackers.</p>
          </Section>

          <Section title="2. How we use your information">
            <p>We use your data solely to:</p>
            <ul className="list-none space-y-2 pl-4">
              {[
                "Review your application and determine acceptance",
                "Facilitate matching between accepted members",
                "Process and verify your payment",
                "Notify you of your application status via email",
                "Respond to your support or contact inquiries",
                "Maintain platform security and prevent abuse",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-[#C9A84C] shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4">We do not use your data for advertising, we do not build marketing profiles, and we do not share your data with third parties for their commercial purposes.</p>
          </Section>

          <Section title="3. Photo and selfie handling">
            <p><span className="text-[#F5F2EC]">Accepted applicants:</span> Your photo is stored securely and shown only to other accepted members on the platform, in accordance with our photo privacy features (blurred until mutual interest).</p>
            <p><span className="text-[#F5F2EC]">Rejected applicants:</span> If your application is rejected, your photo and selfie are permanently deleted from our servers within 48 hours of the rejection decision. We do not maintain a database of rejected faces.</p>
            <p><span className="text-[#F5F2EC]">Selfies:</span> Selfies are used only for identity verification — to confirm that the face in your submitted photo is you. They are not used as profile photos and are not shown to other members.</p>
            <p><span className="text-[#F5F2EC]">Storage:</span> Photos are stored in encrypted cloud storage (Supabase / AWS S3 infrastructure). Access is restricted to platform staff and automated systems.</p>
          </Section>

          <Section title="4. Data storage and security">
            <p>Your data is stored on servers managed by Supabase (supabase.com), which operates on AWS infrastructure. Data may be stored in regions outside India. By using Prima Facie, you consent to this cross-border data transfer.</p>
            <p>We implement industry-standard security measures including encrypted storage, HTTPS-only transmission, and access controls. Our infrastructure undergoes annual third-party security audits, results of which are published publicly.</p>
            <p>Despite these measures, no system is completely secure. If a breach affecting your data occurs, we will notify you as required by applicable law.</p>
          </Section>

          <Section title="5. Third-party services">
            <p>We use the following third-party services, each governed by their own privacy policies:</p>
            <ul className="list-none space-y-2 pl-4">
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span><span><span className="text-[#F5F2EC]">Razorpay</span> — payment processing (razorpay.com/privacy)</span></li>
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span><span><span className="text-[#F5F2EC]">Supabase</span> — database and file storage (supabase.com/privacy)</span></li>
            </ul>
            <p className="mt-4">We do not integrate with social media platforms, advertising networks, or data brokers.</p>
          </Section>

          <Section title="6. Cookies">
            <p>We use only essential cookies required for the platform to function (session management). We do not use advertising cookies, tracking pixels, or third-party analytics cookies.</p>
          </Section>

          <Section title="7. Your rights">
            <p>You have the right to:</p>
            <ul className="list-none space-y-2 pl-4">
              {[
                "Access the personal data we hold about you",
                "Request correction of inaccurate data",
                "Request deletion of your data (subject to legal retention obligations)",
                "Withdraw consent for processing (where consent is the legal basis)",
                "Lodge a complaint with the relevant data protection authority",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-[#C9A84C] shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4">To exercise these rights, contact us via the <Link href="/contact" className="text-[#C9A84C] hover:underline">contact page</Link>. We will respond within 30 days.</p>
          </Section>

          <Section title="8. Data retention">
            <p>We retain data for as long as necessary to provide the platform services:</p>
            <ul className="list-none space-y-2 pl-4">
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span>Rejected applicants&apos; photos and selfies: deleted within 48 hours of rejection</li>
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span>Application records (name, email, metadata): retained for 2 years for fraud prevention</li>
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span>Active member profiles: retained for the duration of membership</li>
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span>Payment records: retained for 7 years as required by Indian financial regulations</li>
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span>Contact messages: retained for 1 year</li>
            </ul>
          </Section>

          <Section title="9. Children's privacy">
            <p>Prima Facie is strictly for individuals aged 18–28. We verify age at registration. If we discover that someone under 18 has submitted an application, we will immediately delete all associated data.</p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>We may update this policy periodically. We will notify active members of material changes via email. Continued use of the platform after changes take effect constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="11. Contact">
            <p>For privacy-related inquiries, data access requests, or deletion requests:</p>
            <p className="mt-2">
              <Link href="/contact" className="text-[#C9A84C] hover:underline">Contact form — primafacie.in/contact</Link>
            </p>
            <p className="mt-2 text-[#8A6E2F]">Governing law: Republic of India. Jurisdiction: Karnataka.</p>
          </Section>
        </div>
      </main>
    </>
  );
}
