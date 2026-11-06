import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Prima Facie",
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

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#8A6E2F]">
              Effective date: 1 June 2025 · Last updated: 1 June 2025
            </p>
          </div>

          <div className="font-[family-name:var(--font-montserrat)] text-sm text-[#B0AA9E] leading-relaxed mb-10 p-6 border border-[#C9A84C]/20 bg-[#111111]">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your use of Prima Facie, operated at primafacie.in. By submitting an application or using the platform in any way, you agree to these Terms. If you disagree with any part, do not use the platform.
            </p>
          </div>

          <Section title="1. Eligibility">
            <p>You must be between 18 and 28 years of age (inclusive) to apply to or use Prima Facie. Age is verified during the application process via government-issued identity documents. If you misrepresent your age, your account will be permanently banned and no refund will be issued.</p>
            <p>Prima Facie is currently available to residents of and visitors to Mumbai, Delhi NCR, Bangalore, Hyderabad, Chennai, and Pune.</p>
            <p>By applying, you represent that all information you submit is accurate, current, and truthful.</p>
          </Section>

          <Section title="2. The application process">
            <p><span className="text-[#F5F2EC]">Application fee:</span> A non-refundable fee of ₹9 is charged upon submission of each application. This fee is non-refundable regardless of the outcome.</p>
            <p><span className="text-[#F5F2EC]">Acceptance criteria:</span> Acceptance is based solely on appearance, as assessed by Prima Facie moderators and the community voting panel. We make no representations about what constitutes &ldquo;attractive enough.&rdquo; Our assessment is subjective, final, and not subject to appeal or legal challenge.</p>
            <p><span className="text-[#F5F2EC]">Rejection:</span> Rejected applicants may reapply after 90 days. Repeat applications do not guarantee acceptance. The ₹9 fee applies to each application.</p>
            <p><span className="text-[#F5F2EC]">Community voting:</span> Your application may be reviewed by existing Prima Facie members who vote on your inclusion. Their votes are one factor in the acceptance decision. Individual voters are not disclosed.</p>
          </Section>

          <Section title="3. Premium membership">
            <p><span className="text-[#F5F2EC]">Premium subscription:</span> Rejected applicants may purchase a Premium subscription at ₹5,999/month for further consideration. This does not guarantee acceptance. Premium subscribers are subject to the same acceptance criteria.</p>
            <p><span className="text-[#F5F2EC]">Billing:</span> Premium subscriptions are billed monthly. You may cancel at any time. Cancellation takes effect at the end of the current billing period. No partial refunds are issued.</p>
            <p><span className="text-[#F5F2EC]">Refunds:</span> All fees are non-refundable except where required by applicable Indian consumer protection law.</p>
          </Section>

          <Section title="4. User conduct">
            <p>By using Prima Facie, you agree not to:</p>
            <ul className="list-none space-y-2 pl-4">
              {[
                "Submit photos of someone other than yourself",
                "Create multiple accounts",
                "Use the platform if you are under 18 or over 28",
                "Share, screenshot, or redistribute other members' photos or personal information",
                "Send unsolicited explicit content of any kind",
                "Harass, threaten, or abuse other members",
                "Attempt to circumvent any security or access control measure",
                "Use the platform for commercial solicitation or spam",
                "Impersonate any person or entity",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-[#C9A84C] shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4">Violation of these rules may result in immediate permanent banning without refund.</p>
          </Section>

          <Section title="5. Zero-tolerance conduct">
            <p>The following result in an immediate, permanent, non-appealable ban:</p>
            <ul className="list-none space-y-2 pl-4">
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span>Sending any explicit or sexual content without explicit prior consent from the recipient</li>
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span>Submitting photos of a minor</li>
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span>Creating an account while under 18</li>
              <li className="flex gap-3"><span className="text-[#C9A84C] shrink-0">—</span>Distributing another member&apos;s photos, identity, or private communications outside the platform</li>
            </ul>
            <p className="mt-4">We do not issue warnings for zero-tolerance violations. First offence is permanent.</p>
          </Section>

          <Section title="6. Photo ownership and license">
            <p>You retain ownership of all photos you submit. By submitting, you grant Prima Facie a non-exclusive, limited license to store and display your photos to other members of the platform for the purpose of facilitating connections.</p>
            <p>This license terminates when you delete your account or when your rejected application photos are deleted pursuant to our 48-hour deletion policy.</p>
            <p>You represent that you have the right to submit the photos — i.e., you are the person in the photos, and you hold the copyright or have permission to use them.</p>
          </Section>

          <Section title="7. Messaging">
            <p>Accepted members may message other accepted members within their city without requiring mutual acceptance first. By joining the platform, you consent to receiving messages from other verified members.</p>
            <p>You may block any member at any time. Blocked members cannot see your profile or contact you. All blocking actions are permanent and immediate.</p>
            <p>Messages are end-to-end encrypted. Prima Facie does not read message content.</p>
          </Section>

          <Section title="8. Moderation and reports">
            <p>Reports are reviewed by human moderators within 24 hours. Some reports may be escalated to the community voting panel for input on appropriate action.</p>
            <p>Moderation decisions are final. We do not operate an appeals process for conduct violations, though we will review decisions that we determine were made in error.</p>
          </Section>

          <Section title="9. Termination">
            <p>We may suspend or terminate your access to Prima Facie at any time, with or without notice, for any violation of these Terms. We may also terminate accounts that have been inactive for more than 12 months.</p>
            <p>You may delete your account at any time through the platform settings. Upon deletion, your profile data is removed within 30 days. Payment records are retained as required by law.</p>
          </Section>

          <Section title="10. Disclaimer of warranties">
            <p>Prima Facie is provided &ldquo;as is.&rdquo; We make no warranties, express or implied, regarding the platform&apos;s fitness for any particular purpose, uninterrupted operation, or the accuracy of any content.</p>
            <p>We do not guarantee that you will form any romantic connections through the platform. That part is still up to you.</p>
          </Section>

          <Section title="11. Limitation of liability">
            <p>To the maximum extent permitted by Indian law, Prima Facie&apos;s liability to you for any claim arising from use of the platform is limited to the amount you paid us in the 12 months preceding the claim.</p>
            <p>We are not liable for any indirect, incidental, or consequential damages, including lost connections, hurt feelings, or rejection-related distress.</p>
          </Section>

          <Section title="12. Governing law and jurisdiction">
            <p>These Terms are governed by the laws of the Republic of India. Any disputes arising from these Terms or your use of Prima Facie shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.</p>
          </Section>

          <Section title="13. Changes to these Terms">
            <p>We may update these Terms periodically. We will notify active members of material changes via email at least 14 days before they take effect. Continued use of the platform constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="14. Contact">
            <p>
              For questions about these Terms: <Link href="/contact" className="text-[#C9A84C] hover:underline">primafacie.in/contact</Link>
            </p>
          </Section>
        </div>
      </main>
    </>
  );
}
