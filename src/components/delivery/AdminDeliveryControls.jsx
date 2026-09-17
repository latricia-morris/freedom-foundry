import React, { useState } from 'react';
import { ChevronRight, File, Folder, Eye, CheckCircle2, XCircle, MoreVertical, Search, Lock, User, Calendar, Plus, RefreshCw, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useAdminDeliveryDriveFiles, useSetAdminFileVisibility, useAdminPaymentEligibility, useSetAdminPaymentEligibility, useAdminDeliveryAudit } from '@/hooks/use-drive-delivery';
import { formatDistanceToNow } from 'date-fns';

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export function AdminDeliveryControls({ profileId, corporateProfile, userRole }) {
  const [folderId, setFolderId] = useState(null);
  const [filter, setFilter] = useState('');
  
  // Payment confirmation state
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [paymentEvidence, setPaymentEvidence] = useState('');
  const [paymentReason, setPaymentReason] = useState('');
  const [revokeMode, setRevokeMode] = useState(false);
  
  // Release override state
  const [overrideFile, setOverrideFile] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');

  const { data, isLoading, isError, error, refetch } = useAdminDeliveryDriveFiles(profileId, folderId);
  const { data: paymentStatus, isLoading: paymentLoading } = useAdminPaymentEligibility(profileId);
  const { data: auditLogs, isLoading: auditLoading } = useAdminDeliveryAudit(profileId, 20);

  const setVisibility = useSetAdminFileVisibility();
  const setPaymentStatus = useSetAdminPaymentEligibility();

  const handleSetVisibility = (file, newVisibility, reason = undefined) => {
    setVisibility.mutate({
      profileId,
      fileId: file.id,
      data: {
        visibility: newVisibility,
        modified_time: file.modified_time,
        expected_version: file.expected_version || 0,
        reason
      }
    }, {
      onError: (err) => {
        if (err.status === 409) {
          alert('This file was modified recently. The list will refresh; please try again.');
          refetch();
        } else {
          alert(err.message || 'Could not change visibility.');
        }
      }
    });
    setOverrideFile(null);
    setOverrideReason('');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentEvidence.trim() || !paymentReason.trim()) return;
    
    setPaymentStatus.mutate({
      profileId,
      data: {
        confirmed_paid_in_full: !revokeMode,
        evidence: paymentEvidence.trim(),
        reason: paymentReason.trim(),
        expected_version: paymentStatus?.expected_version || 0
      }
    }, {
      onSuccess: () => {
        setIsConfirmingPayment(false);
        setPaymentEvidence('');
        setPaymentReason('');
        setRevokeMode(false);
      },
      onError: (err) => {
        if (err.status === 409) {
          alert('Payment eligibility was modified recently. The status will refresh; please try again.');
          // The query cache invalidation handles the refresh
        } else {
          alert(err.message || 'Could not update payment eligibility.');
        }
      }
    });
  };

  const files = (data?.files || []).filter((file) => !filter || file.name.toLowerCase().includes(filter.toLowerCase()));

  if (!corporateProfile.drive_folder_id) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">No Drive folder is assigned to this account.</p>
        <p className="text-xs text-muted-foreground">Assign a Google Drive folder in the setup options above before managing deliveries.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Section: Payment Eligibility */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/30 p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${paymentStatus?.confirmed_paid_in_full ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
               <CheckCircle2 className="h-5 w-5" />
             </div>
             <div>
               <h3 className="font-heading text-lg">Payment Eligibility</h3>
               <p className="text-xs text-muted-foreground mt-0.5">
                 {paymentLoading ? 'Checking...' : paymentStatus?.confirmed_paid_in_full ? `Confirmed by manual verification.` : 'Not confirmed. Final releases are gated.'}
               </p>
             </div>
          </div>
          {!isConfirmingPayment && (
            <button 
              onClick={() => {
                setRevokeMode(paymentStatus?.confirmed_paid_in_full);
                setIsConfirmingPayment(true);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            >
              {paymentStatus?.confirmed_paid_in_full ? 'Revoke Confirmation' : 'Confirm Payment'}
            </button>
          )}
        </div>
        
        {isConfirmingPayment && (
          <div className="p-4 bg-background">
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="rounded-lg bg-amber-500/10 p-3 flex gap-3 text-amber-500 text-sm">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <p>This is a manual override. You must provide evidence (like an invoice link) and a reason for this audit log. This explicitly {revokeMode ? 'revokes' : 'authorizes'} final asset delivery.</p>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Evidence Link or Reference</span>
                  <input 
                    value={paymentEvidence} 
                    onChange={(e) => setPaymentEvidence(e.target.value)} 
                    placeholder="https://invoice-link..." 
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Reason</span>
                  <input 
                    value={paymentReason} 
                    onChange={(e) => setPaymentReason(e.target.value)} 
                    placeholder={revokeMode ? "Refund processed..." : "Final payment received via Stripe..."} 
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    required
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsConfirmingPayment(false);
                    setPaymentEvidence('');
                    setPaymentReason('');
                  }} 
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={setPaymentStatus.isPending || !paymentEvidence.trim() || !paymentReason.trim()}
                  className={`rounded-lg px-4 py-2 text-xs font-medium text-white disabled:opacity-50 ${revokeMode ? 'bg-destructive hover:bg-destructive/90' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                >
                  {setPaymentStatus.isPending ? 'Saving...' : (revokeMode ? 'Confirm Revocation' : 'Confirm Paid in Full')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* File Browser Section */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-border">
            <h3 className="font-heading text-lg">Delivery Controls</h3>
            <div className="flex items-center gap-2">
               <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 w-full sm:w-64">
                 <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                 <input 
                   value={filter} 
                   onChange={(e) => setFilter(e.target.value)} 
                   placeholder="Filter files..." 
                   className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" 
                 />
               </label>
               <button 
                 onClick={() => refetch()} 
                 disabled={isLoading}
                 className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
               >
                 <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
               </button>
            </div>
         </div>
         
         <div className="bg-muted/30 p-2 border-b border-border flex items-center gap-1 text-sm overflow-x-auto">
            {data?.breadcrumbs?.map((crumb, index) => (
               <React.Fragment key={crumb.id}>
                 <button 
                   onClick={() => setFolderId(crumb.id)} 
                   className={`px-2 py-1 rounded-md whitespace-nowrap ${index === data.breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                 >
                   {crumb.name}
                 </button>
                 {index < data.breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
               </React.Fragment>
            ))}
         </div>

         {isLoading && !data ? (
            <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
         ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">{error.message || 'Failed to load Drive contents.'}</div>
         ) : (
            <div className="divide-y divide-border">
              {files.length > 0 ? files.map(file => (
                <div key={file.id} className="flex flex-col sm:flex-row sm:items-center p-3 gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                       {file.is_folder ? <Folder className="h-5 w-5 text-primary" /> : <File className="h-5 w-5 text-muted-foreground" />}
                     </div>
                     <div 
                       className={`min-w-0 flex-1 ${file.is_folder ? 'cursor-pointer hover:opacity-80' : ''}`}
                       onClick={() => file.is_folder && setFolderId(file.id)}
                     >
                       <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                       <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                         <span>{file.is_folder ? 'Folder' : formatBytes(file.size)}</span>
                         <span>•</span>
                         <span>Modified {new Date(file.modified_time).toLocaleDateString()}</span>
                       </div>
                     </div>
                  </div>
                  
                  {!file.is_folder && (
                    <div className="flex flex-col sm:items-end shrink-0 gap-2 w-full sm:w-auto mt-2 sm:mt-0 pl-12 sm:pl-0">
                      
                      {/* Current Status and Summary */}
                      <div className="flex items-center gap-2 text-xs">
                        {file.visibility === 'hidden' && (
                          <span className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                            <Lock className="h-3 w-3" /> Hidden (Internal)
                          </span>
                        )}
                        {file.visibility === 'review' && (
                          <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-1 text-amber-500 font-medium uppercase tracking-wider text-[10px]">
                            <Eye className="h-3 w-3" /> Client Review
                          </span>
                        )}
                        {file.visibility === 'released' && (
                          <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-emerald-500 font-medium uppercase tracking-wider text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Released
                          </span>
                        )}
                        
                        {file.decision_summary && (
                          <span className="text-muted-foreground italic ml-2">
                             {file.decision_summary.status === 'approved' ? 'Approved' : 'Revision req'}
                          </span>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex flex-wrap gap-2">
                        {file.visibility !== 'hidden' && (
                          <button
                            onClick={() => handleSetVisibility(file, 'hidden')}
                            disabled={setVisibility.isPending}
                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            Hide
                          </button>
                        )}
                        {file.visibility !== 'review' && (
                          <button
                            onClick={() => handleSetVisibility(file, 'review')}
                            disabled={setVisibility.isPending}
                            className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-amber-500 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                          >
                            Send to Review
                          </button>
                        )}
                        {file.visibility !== 'released' && (
                           paymentStatus?.confirmed_paid_in_full ? (
                            <button
                              onClick={() => handleSetVisibility(file, 'released')}
                              disabled={setVisibility.isPending}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                            >
                              Release Asset
                            </button>
                           ) : userRole === 'super_admin' ? (
                            <button
                              onClick={() => setOverrideFile(file)}
                              disabled={setVisibility.isPending}
                              className="rounded-lg border border-border bg-background px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Payment not confirmed. Super Admin override required."
                            >
                              <Lock className="h-3 w-3" /> Release...
                            </button>
                           ) : null
                        )}
                      </div>
                      
                      {/* Override Inline Form */}
                      {overrideFile?.id === file.id && (
                        <div className="w-full bg-background rounded-lg border border-border p-3 mt-2 animate-fade-in">
                          <p className="text-xs text-amber-500 mb-2 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Payment not confirmed. Super Admin override required.</p>
                          <input 
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="Reason for early release..."
                            className="w-full rounded-md border border-border bg-card px-2 py-1.5 text-xs outline-none focus:border-primary mb-2"
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setOverrideFile(null)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                            <button 
                              onClick={() => handleSetVisibility(file, 'released', overrideReason)}
                              disabled={!overrideReason.trim()}
                              className="px-2 py-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 rounded hover:bg-emerald-500/20 disabled:opacity-50"
                            >
                              Confirm Override
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-muted-foreground">This folder is empty or no items match.</div>
              )}
            </div>
         )}
      </div>

      {/* Audit Log */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-heading text-lg">Delivery Audit History</h3>
        </div>
        <div className="p-4">
          {auditLoading ? (
             <div className="flex justify-center py-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
          ) : auditLogs?.length > 0 ? (
             <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
               {auditLogs.map((log, i) => (
                 <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                       {log.action_type === 'visibility_changed' ? (
                          log.details?.visibility === 'released' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                          log.details?.visibility === 'review' ? <Eye className="h-4 w-4 text-amber-500" /> :
                          <Lock className="h-4 w-4" />
                       ) : log.action_type === 'payment_eligibility' ? (
                          <ShieldAlert className="h-4 w-4 text-primary" />
                       ) : log.action_type === 'client_decision' ? (
                          log.details?.decision === 'approved' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                          <XCircle className="h-4 w-4 text-red-500" />
                       ) : (
                          <MoreVertical className="h-4 w-4" />
                       )}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-background shadow">
                      <div className="flex flex-col gap-1">
                         <div className="flex justify-between items-start mb-1">
                           <span className="text-xs font-medium uppercase tracking-wider text-primary">
                             {log.action_type.replace('_', ' ')}
                           </span>
                           <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                             {formatDistanceToNow(new Date(log.created_at))} ago
                           </span>
                         </div>
                         
                         <p className="text-sm text-foreground">
                            {log.action_type === 'visibility_changed' ? (
                               <>Set <span className="font-medium text-white">{log.file_name || log.file_id}</span> to {log.details?.visibility}</>
                            ) : log.action_type === 'payment_eligibility' ? (
                               <>{log.details?.confirmed_paid_in_full ? 'Confirmed' : 'Revoked'} payment eligibility</>
                            ) : log.action_type === 'client_decision' ? (
                               <>Client {log.details?.decision} <span className="font-medium text-white">{log.file_name || log.file_id}</span></>
                            ) : (
                               log.action_type
                            )}
                         </p>
                         
                         {(log.details?.reason || log.details?.note) && (
                           <div className="mt-2 bg-white/5 rounded p-2 text-xs text-muted-foreground border-l-2 border-primary/50">
                             <span className="font-medium">Note:</span> {log.details?.reason || log.details?.note}
                           </div>
                         )}
                         
                         <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                           <User className="h-3 w-3" />
                           <span>{log.actor?.name || log.actor_id}</span>
                         </div>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          ) : (
             <div className="text-center py-6 text-sm text-muted-foreground">No delivery actions recorded yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}