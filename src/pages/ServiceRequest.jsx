import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const formConfigs = {
  branding: { title: 'Branding Services', src: 'https://links.oxandiron.co/widget/form/thGTH2pCSZ8EUYBiw9xF' },
  design: { title: 'Graphic Design', src: 'https://links.oxandiron.co/widget/form/CXasR7vEWw2w2XgSdcQ6' },
  software: { title: 'Software & Assets', src: null },
};

export default function ServiceRequest() {
  const { type } = useParams();
  const config = formConfigs[type];
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', project_details: '' });

  if (!config) return (
    <div className="forged-border rounded-2xl bg-card p-12 text-center">
      <h3 className="font-heading text-xl text-foreground mb-2">Service not found</h3>
      <Link to="/services" className="text-sm text-primary hover:text-copper">← Back to Services</Link>
    </div>
  );

  const handleCustomSubmit = async () => {
    await base44.entities.ServiceRequestSubmission.create({ service_type: 'Software & Assets', submission_data: formData, status: 'submitted' });
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/services" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6"><ArrowLeft className="w-4 h-4" /> Back to Services</Link>
      <h1 className="font-heading text-3xl font-light text-foreground mb-2">{config.title}</h1>
      <p className="text-sm text-muted-foreground mb-8">Fill out the form below and we'll be in touch soon.</p>

      {submitted ? (
        <div className="forged-border rounded-2xl bg-card p-12 text-center">
          <div className="w-16 h-16 rounded-full forged-border flex items-center justify-center bg-background mx-auto mb-4"><Check className="w-8 h-8 text-primary" strokeWidth={1.5} /></div>
          <h3 className="font-heading text-2xl text-foreground mb-2">Thank You for Your Request</h3>
          <p className="text-sm text-muted-foreground">We'll be in touch soon.</p>
        </div>
      ) : config.src ? (
        <div className="forged-border rounded-2xl bg-card p-4 overflow-hidden">
          <iframe src={config.src} style={{ border: 'none', width: '100%', minHeight: '600px' }} title={config.title} />
        </div>
      ) : (
        <div className="forged-border rounded-2xl bg-card p-6 lg:p-8 space-y-4">
          <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Name</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-background" /></div>
          <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Email</Label><Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="bg-background" /></div>
          <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Project Details</Label><Textarea value={formData.project_details} onChange={e => setFormData({ ...formData, project_details: e.target.value })} rows={5} className="bg-background" /></div>
          <button onClick={handleCustomSubmit} disabled={!formData.name || !formData.email} className="flex items-center gap-2 px-6 py-2.5 forged-gradient rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50">Submit Request</button>
        </div>
      )}
    </div>
  );
}