import React from 'react';
import ServicesHero from '@/components/services/ServicesHero';
import CoreServices from '@/components/services/CoreServices';
import PresenceSupport from '@/components/services/PresenceSupport';
import IgniteOsSection from '@/components/services/IgniteOsSection';
import EcosystemSection from '@/components/services/EcosystemSection';
import ServicesCta from '@/components/services/ServicesCta';

export default function ServiceHub() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-16 px-5 sm:px-8 lg:px-10">
      <ServicesHero />
      <CoreServices />
      <PresenceSupport />
      <IgniteOsSection />
      <EcosystemSection />
      <ServicesCta />
    </div>
  );
}