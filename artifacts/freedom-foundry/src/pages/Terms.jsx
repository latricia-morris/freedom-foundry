import React from 'react';
import LegalPage from '@/components/LegalPage';

const sections = [
  {
    title: '1. Services Overview',
    paragraphs: [
      'Freedom Foundry provides access to branding-related education, tools, resources, communications, service information, and opportunities to request or engage branding, graphic design, copywriting, brand development, consulting, and related agency services. Certain work may be fulfilled by The Brand Revivalist®, Ox & Iron, or vetted third-party partners, depending on the scope of the request.',
    ],
  },
  {
    title: '2. Eligibility',
    paragraphs: [
      'You must be at least 18 years old, or the age of majority in your jurisdiction, to use the Services. By using the Services, you represent that you meet this requirement and that the information you provide is accurate.',
    ],
  },
  {
    title: '3. Accounts and User Responsibilities',
    paragraphs: ['If you create an account, you are responsible for:'],
    bullets: [
      'Maintaining the confidentiality of your login credentials',
      'Providing accurate and current information',
      'All activity that occurs under your account',
      'Using the App lawfully and responsibly',
    ],
    blocks: [
      {
        heading: 'You agree not to:',
        bullets: [
          'Misuse the App or attempt unauthorized access',
          'Reverse engineer, copy, disrupt, or interfere with the Services except as permitted by law',
          'Upload malicious code, unlawful content, or infringing material',
          'Use the Services to harass, defame, exploit, or violate the rights of others',
        ],
      },
    ],
  },
  {
    title: '4. Service Requests and Fulfillment',
    paragraphs: [
      'Submitting a request through the App does not guarantee acceptance of the project, availability, timing, or a particular outcome. We may accept, decline, refer, outsource, or redirect projects at our discretion.',
      'Some projects or portions of work may be fulfilled through Ox & Iron or referred to vetted third-party partners. Any separate agreement, proposal, scope, invoice, or statement of work provided for paid services will control to the extent it conflicts with these Terms.',
    ],
  },
  {
    title: '5. No Guaranteed Results',
    paragraphs: [
      'Branding, marketing, messaging, copywriting, consulting, design, strategy, and related creative or business services involve subjective decisions and external market factors outside our control. We do not guarantee specific business outcomes, sales, conversions, audience growth, brand performance, revenue increases, customer behavior, or any other measurable result.',
      'You acknowledge that implementation quality, internal business operations, sales processes, market conditions, timing, team execution, and third-party performance all affect results and remain outside our control.',
    ],
  },
  {
    title: '6. Third-Party Providers and Referrals',
    paragraphs: [
      'The App may include referrals, introductions, recommendations, links, integrations, or access to third-party providers. Those parties operate independently. We do not control and are not responsible for:',
    ],
    bullets: [
      'Their services',
      'Their communications',
      'Their pricing',
      'Their contracts',
      'Their timelines',
      'Their policies',
      'Their performance',
      'Their sales processes',
      'Their deliverables',
      'Their acts or omissions',
    ],
    blocks: [
      {
        heading: '',
        paragraphs: [
          'Any engagement you enter into with a third party is solely between you and that third party unless expressly stated otherwise in a written agreement signed by us.',
        ],
      },
    ],
  },
  {
    title: '7. Fees, Purchases, and Payments',
    paragraphs: ['If paid services, subscriptions, consultations, digital products, or in-app purchases are offered:'],
    bullets: [
      'Pricing will be presented before purchase',
      'Payments may be processed by third-party processors or app marketplaces',
      'Subscriptions may renew automatically unless canceled under the applicable platform’s rules',
      'Refunds, if any, will be governed by the specific offer, written agreement, or applicable marketplace rules',
    ],
  },
  {
    title: '8. Intellectual Property',
    paragraphs: [
      'The Services, including all text, graphics, branding, frameworks, designs, educational materials, software, workflows, and content made available through Freedom Foundry, are owned by or licensed to The Brand Revivalist® and are protected by intellectual property laws.',
      'Your use of the App does not transfer ownership rights. You may not copy, reproduce, republish, distribute, modify, create derivative works from, sell, or exploit our content except as expressly permitted in writing.',
    ],
  },
  {
    title: '9. User Content',
    paragraphs: [
      'If you submit content, files, comments, feedback, project materials, or other information through the App, you represent that you have the right to provide that content. You grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, store, transmit, and display that content solely as necessary to operate the Services, respond to your requests, and deliver requested work.',
    ],
  },
  {
    title: '10. Disclaimer of Warranties',
    paragraphs: [
      'To the fullest extent permitted by law, the Services are provided on an “as is” and “as available” basis. We disclaim all warranties, whether express, implied, statutory, or otherwise, including implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, availability, accuracy, and results.',
      'We do not warrant that the App or Services will be uninterrupted, error-free, secure, or suitable for your specific goals or business situation.',
    ],
  },
  {
    title: '11. Limitation of Liability',
    paragraphs: [
      'To the fullest extent permitted by law, The Brand Revivalist®, LaTricia Morris, and Ox & Iron will not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages, or for any loss of profits, revenue, business opportunity, goodwill, data, or anticipated results arising out of or related to your use of the Services.',
      'Our total liability for any claim arising out of or relating to the Services will not exceed the amount you paid us, if any, for the specific Services giving rise to the claim during the three months preceding the event giving rise to the claim.',
    ],
  },
  {
    title: '12. Indemnification',
    paragraphs: ['You agree to defend, indemnify, and hold harmless The Brand Revivalist®, LaTricia Morris, Ox & Iron, and their affiliates, contractors, agents, and representatives from and against any claims, liabilities, damages, judgments, losses, costs, and expenses, including reasonable attorneys’ fees, arising out of or related to:'],
    bullets: [
      'Your use of the Services',
      'Your violation of these Terms',
      'Your content',
      'Your violation of any law or third-party right',
      'Your dealings with third-party providers introduced through the App',
    ],
  },
  {
    title: '13. Termination',
    paragraphs: [
      'We may suspend, restrict, or terminate your access to the Services at any time, with or without notice, if we believe you violated these Terms, created risk, misused the App, or if we discontinue all or part of the Services.',
    ],
  },
  {
    title: '14. Governing Law',
    paragraphs: [
      'These Terms are governed by the laws of the Commonwealth of Pennsylvania, without regard to conflict of law rules.',
    ],
  },
  {
    title: '15. Changes to These Terms',
    paragraphs: [
      'We may revise these Terms from time to time. When we do, we will update the Effective Date. Continued use of the Services after updated Terms become effective means you accept the revised Terms.',
    ],
  },
  {
    title: '16. Contact Information',
    paragraphs: [
      'The Brand Revivalist®',
      'Attn: LaTricia Morris',
      'latricia@thebrandrevivalist.com',
    ],
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms of"
      accent="Service"
      effectiveDate="July 31, 2026"
      contactType="Terms of Service"
      intro={[
        'These Terms of Service (“Terms”) govern your access to and use of the Freedom Foundry mobile application, related websites, content, communications, and services (collectively, the “Services”) operated by The Brand Revivalist® (“Company,” “we,” “our,” or “us”). The Brand Revivalist® is the professional brand identity and public-facing business persona of LaTricia Morris.',
        'By downloading, accessing, or using Freedom Foundry, you agree to these Terms.',
      ]}
      sections={sections}
    />
  );
}