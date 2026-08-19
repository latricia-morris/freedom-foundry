import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">Privacy <span className="molten-text italic">Policy</span></h1>
      </div>

      <div className="editorial-container space-y-6">
        <p className="text-sm opacity-70">Last updated: July 2026</p>

        <section>
          <h2 className="text-lg mb-2">1. Information We Collect</h2>
          <p>We collect information you provide directly, including your name, email address, phone number, and profile content such as brand profiles, workbook responses, and uploaded files. We also collect usage data such as login times and feature interactions.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">2. How We Use Your Information</h2>
          <p>Your information is used to provide and improve the Service, process subscriptions, respond to service requests, and communicate with you about your account. Brand profile data is used solely to display your brand within the Service.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">3. Data Storage and Security</h2>
          <p>Your data is stored securely on our hosting infrastructure. We use industry-standard encryption and access controls. Payment information is processed by Stripe and is not stored on our servers.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">4. Third-Party Services</h2>
          <p>The Service integrates with third-party platforms including Stripe (payments), ClickUp (project management), QuickBooks (accounting), and Google Drive (file storage). Each service has its own privacy policy governing data you share with them.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">5. Share Links</h2>
          <p>If you create a share link for your brand profile or media kit, the linked content becomes accessible to anyone with the link. You can deactivate share links at any time from your Brand Portal.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">6. Data Retention</h2>
          <p>We retain your data for as long as your account is active. Upon account deletion, your personal data and uploaded content are permanently removed within 30 days.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">7. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. You can update your profile information in Settings, and you can request data export or account deletion at any time.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">8. Cookies</h2>
          <p>The Service uses essential cookies for authentication and session management. We do not use advertising or tracking cookies.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes through the Service or via email.</p>
        </section>

        <section>
          <h2 className="text-lg mb-2">10. Contact</h2>
          <p>For privacy questions or data requests, contact us through the Contact page within the Service.</p>
        </section>
      </div>
    </div>
  );
}