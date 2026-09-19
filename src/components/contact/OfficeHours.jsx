import React from 'react';

export default function OfficeHours() {
  return (
    <section className="mt-8 bg-card border border-border rounded-lg p-6">
      <h2 className="font-heading text-xl text-foreground mb-4">Office hours &amp; response times</h2>
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Office hours</h3>
          <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
            <li>Office hours are 9:00 AM–3:00 PM, Monday through Thursday.</li>
            <li>In honor of our commitment to family, Fridays are a lighter-response day.</li>
            <li>We are out of office on major holidays and when school is out.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Response time</h3>
          <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
            <li>We aim to respond to all legitimate inquiries as quickly as possible.</li>
            <li>Depending on project load and communication volume, replies may take 24–48 business hours.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}