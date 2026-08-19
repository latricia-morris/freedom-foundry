import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">Terms & <span className="molten-text italic">Conditions</span></h1>
      </div>

      <div className="editorial-container space-y-6">
        <p className="text-sm opacity-70">Last updated: July 2026</p>

        <section>
          <h2 className="text-lg mb-2">1. Acceptance of Terms</h2>
          <p>By accessing and using Freedom Foundry ("the Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">2. Description of Service</h2>
          <p>Freedom Foundry is a brand portal platform provided by The Brand Revivalist, offering access to courses, workbooks, brand management tools, and service request capabilities. The Service is available to registered users who have been granted access.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to use this Service. You agree to provide accurate information during registration and to keep it updated.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">4. Subscriptions and Billing</h2>
          <p>Paid subscription tiers (Freedom Foundry Pro and Freedom Foundry Team) are billed on a recurring monthly basis through Stripe. Subscriptions can be cancelled at any time. Refunds are handled on a case-by-case basis. By subscribing, you authorize us to charge the recurring fee until you cancel.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">5. User Content</h2>
          <p>You retain ownership of all content you submit to the Service, including brand profiles, workbook responses, and uploaded assets. You grant us a limited license to host and display your content within the Service for your use.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">6. Acceptable Use</h2>
          <p>You agree not to misuse the Service, including but not limited to: attempting unauthorized access, disrupting service operations, uploading malicious content, or using the Service for any unlawful purpose.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">7. Intellectual Property</h2>
          <p>The Service, including its design, content, and software, is owned by The Brand Revivalist and protected by intellectual property laws. Course materials, workbooks, and resources are provided for your personal use and may not be redistributed.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">8. Limitation of Liability</h2>
          <p>The Service is provided "as is." The Brand Revivalist is not liable for indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount paid in the preceding 12 months.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">9. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time through the Settings page.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">10. Contact</h2>
          <p>For questions regarding these Terms, contact us through the Contact page within the Service.</p>
        </section>
      </div>
    </div>
  );
}