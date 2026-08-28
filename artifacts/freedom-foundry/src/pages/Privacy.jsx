import React from 'react';
import LegalPage from '@/components/LegalPage';

const sections = [
  {
    title: '1. Information We Collect',
    blocks: [
      {
        heading: 'a. Information You Provide to Us',
        bullets: [
          'Name',
          'Email address',
          'Business name',
          'Billing information',
          'Account credentials',
          'Project details, intake responses, questionnaires, uploaded files, and communications you send through the App',
          'Information you provide when requesting branding, design, copywriting, consulting, or related services',
        ],
      },
      {
        heading: 'b. Information Collected Automatically',
        paragraphs: ['When you use the App, we may automatically collect certain technical and usage information, including:'],
        bullets: [
          'Device type',
          'Operating system',
          'Browser or app version',
          'IP address',
          'Device identifiers',
          'App activity and interaction data',
          'Crash reports, diagnostics, and performance data',
        ],
      },
      {
        heading: 'c. Information From Third Parties',
        paragraphs: ['We may receive information from third-party tools, integrations, marketplaces, payment processors, analytics providers, or partners that support operation of the Services.'],
      },
    ],
  },
  {
    title: '2. How We Use Information',
    bullets: [
      'Provide and operate the App and related services',
      'Create and manage your account',
      'Respond to inquiries and fulfill service requests',
      'Deliver branding, design, copywriting, consulting, strategy, and agency-related services',
      'Coordinate project fulfillment internally or through Ox & Iron or vetted partners',
      'Process payments and transactions',
      'Send service updates, onboarding communications, administrative notices, and support messages',
      'Improve app performance, user experience, service delivery, and business operations',
      'Detect fraud, misuse, security incidents, or technical issues',
      'Comply with legal obligations and enforce our policies',
    ],
  },
  {
    title: '3. How We Share Information',
    paragraphs: ['We may share information with:'],
    bullets: [
      'Service providers and contractors who help us operate the App and deliver services',
      'Ox & Iron, where fulfillment or project execution is handled through that agency',
      'Vetted third-party partners or referral partners, when a requested service falls outside our direct scope or requires specialized support',
      'Payment processors, hosting providers, analytics vendors, communication platforms, and other business tools',
      'Legal, regulatory, or governmental authorities when required by law',
      'A successor entity in connection with a merger, acquisition, restructuring, or sale of all or part of our business',
    ],
    blocks: [
      {
        heading: '',
        paragraphs: [
          'We do not sell your personal information for money. If we refer you to a third party or connect you with a vetted partner, that third party’s own practices, processes, policies, and outcomes are outside our control and subject to that third party’s own terms and privacy practices.',
        ],
      },
    ],
  },
  {
    title: '4. Third-Party Services and Referrals',
    paragraphs: [
      'The App may allow you to connect with or request services involving third-party providers, platforms, or referral partners. These third parties are independent businesses and are not under our control. We are not responsible for the privacy practices, sales processes, service performance, decisions, communications, deliverables, or results of any third party, even if introduced, suggested, or referred through the App.',
      'You should review the separate policies and terms of any third-party provider you choose to engage.',
    ],
  },
  {
    title: '5. Data Retention',
    paragraphs: [
      'We retain personal information for as long as reasonably necessary to:',
    ],
    bullets: [
      'Provide the Services',
      'Maintain business and project records',
      'Comply with legal, tax, accounting, or contractual obligations',
      'Resolve disputes',
      'Enforce our agreements',
    ],
    blocks: [
      {
        heading: '',
        paragraphs: ['Retention periods may vary depending on the type of data and the nature of the relationship.'],
      },
    ],
  },
  {
    title: '6. Your Rights and Choices',
    paragraphs: [
      'Depending on your jurisdiction, you may have the right to:',
    ],
    bullets: [
      'Request access to personal information we hold about you',
      'Request correction of inaccurate information',
      'Request deletion of your information',
      'Object to or restrict certain processing',
      'Withdraw consent where processing is based on consent',
    ],
  },
  {
    title: '7. Account Deletion',
    paragraphs: ['You may request deletion of your account and associated personal information by:'],
    bullets: [
      'Using any account deletion feature available in the App, or',
      'Contacting us at latricia@thebrandrevivalist.com',
    ],
  },
  {
    title: '8. Data Security',
    paragraphs: [
      'We use reasonable administrative, technical, and organizational safeguards designed to protect the information we collect. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    title: '9. Children’s Privacy',
    paragraphs: [
      'Freedom Foundry is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13 without appropriate authorization, we will take steps to delete that information.',
    ],
  },
  {
    title: '10. Health and Sensitive Data',
    paragraphs: [
      'Freedom Foundry is not intended to collect, store, or process personal health information, medical records, or child-directed data as part of its ordinary business operations. If you choose to submit sensitive information that is not necessary to provide our services, you do so at your own discretion.',
    ],
  },
  {
    title: '11. International Users',
    paragraphs: [
      'If you access the Services from outside the United States, your information may be transferred to and processed in the United States or other jurisdictions where our service providers operate.',
    ],
  },
  {
    title: '12. Changes to This Privacy Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. When we do, we will revise the Effective Date. Your continued use of the Services after any update becomes effective constitutes acceptance of the revised Privacy Policy, to the extent permitted by law.',
    ],
  },
  {
    title: '13. Contact Us',
    paragraphs: [
      'The Brand Revivalist®',
      'Attn: LaTricia Morris',
      'latricia@thebrandrevivalist.com',
    ],
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy"
      accent="Policy"
      effectiveDate="July 31, 2026"
      contactType="Privacy Policy"
      intro={[
        'Freedom Foundry (“App”) is owned and operated by The Brand Revivalist® (“Company,” “we,” “our,” or “us”). The Brand Revivalist® is the professional brand identity and public-facing business persona of LaTricia Morris. Certain services, projects, or fulfillment activities connected to the App may be delivered directly by The Brand Revivalist®, by Ox & Iron, or by vetted third-party partners, depending on the nature of the request.',
        'This Privacy Policy explains how we collect, use, disclose, and protect information when you use the Freedom Foundry mobile application, website, and related services (collectively, the “Services”).',
      ]}
      sections={sections}
    />
  );
}