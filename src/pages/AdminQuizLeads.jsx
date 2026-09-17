import React, { useState, useEffect } from 'react';
import { LoaderCircle, Mail, Clock, CheckCircle2 } from 'lucide-react';
import apiClient from '@/api/client';
import { useToast } from '@/components/ui/use-toast';

export default function AdminQuizLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    apiClient.admin.listQuizAttempts()
      .then(setLeads)
      .catch((err) => {
        toast({ title: 'Error', description: 'Failed to load quiz leads.', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoaderCircle className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-light text-foreground mb-3 tracking-wide">
          Quiz <span className="molten-text italic font-medium">Leads</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Monitor incoming brand persona quiz completions, claim status, and resulting archetypes.
        </p>
      </div>

      <div className="dashboard-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/60 border-b border-border/30">
                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">Email</th>
                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">Persona Results</th>
                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">Marketing Consent</th>
                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No quiz leads found.
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="border-b border-border/10 hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted/60 border border-border flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit items-center px-2.5 py-1 rounded-md bg-muted/60 border border-border text-xs text-foreground">
                          1st: {lead.primary_archetype || 'Pending'}
                        </span>
                        {lead.secondary_archetype && (
                          <span className="inline-flex w-fit items-center px-2.5 py-1 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground">
                            2nd: {lead.secondary_archetype}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.marketing_consent ? (
                        <span className="text-xs text-[#4ade80]">Yes</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.status === 'claimed' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#4ade80]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Account Claimed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" /> Unclaimed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
