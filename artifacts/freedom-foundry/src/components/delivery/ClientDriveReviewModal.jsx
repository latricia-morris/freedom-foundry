import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, MessageSquare, Send, CheckCircle2, CircleAlert } from 'lucide-react';
import { useDriveFilePreview, useDriveFileComments, useAddDriveFileComment, useMakeDriveFileDecision } from '@/hooks/use-drive-delivery';
import { useAuth } from '@clerk/react';
import { formatDistanceToNow } from 'date-fns';

export function ClientDriveReviewModal({ isOpen, onClose, file, profileId, currentFolderId, members, role }) {
  const [page, setPage] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [isDecisionMode, setIsDecisionMode] = useState(false);
  const { userId } = useAuth();
  
  const { data: previewData, isLoading: previewLoading, error: previewError } = useDriveFilePreview(
    isOpen ? profileId : null, 
    isOpen ? file?.id : null, 
    file?.modified_time,
    page
  );

  const { data: comments, isLoading: commentsLoading } = useDriveFileComments(
    isOpen ? profileId : null,
    isOpen ? file?.id : null
  );

  const addComment = useAddDriveFileComment();
  const makeDecision = useMakeDriveFileDecision();

  // Reset state when file changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setCommentText('');
      setDecisionNote('');
      setIsDecisionMode(false);
    }
  }, [isOpen, file?.id]);

  if (!isOpen || !file) return null;

  const isOwnerOrAdmin = role === 'admin' || role === 'owner';
  const canDecide = isOwnerOrAdmin && file.visibility === 'review';

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    addComment.mutate({
      profileId,
      fileId: file.id,
      data: {
        body: commentText.trim(),
        modified_time: file.modified_time
      }
    }, {
      onSuccess: () => setCommentText('')
    });
  };

  const handleDecision = (decision) => {
    if (decision === 'revision_requested' && !decisionNote.trim()) return;
    
    makeDecision.mutate({
      profileId,
      fileId: file.id,
      data: {
        decision,
        note: decision === 'revision_requested' ? decisionNote.trim() : undefined,
        modified_time: file.modified_time
      }
    }, {
      onSuccess: () => {
        setIsDecisionMode(false);
        setDecisionNote('');
        if (decision === 'approved') {
            // we let the invalidation refetch everything.
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="flex w-full max-w-6xl h-full max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:flex-row">
        
        {/* Main Content Area (Preview) */}
        <div className="relative flex flex-1 flex-col bg-black/50">
          <div className="flex items-center justify-between p-4 bg-background/50 border-b border-white/5">
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-heading text-lg text-foreground">{file.name}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className={`rounded-sm px-1.5 py-0.5 font-medium uppercase tracking-wider text-[9px] ${
                  file.visibility === 'released' ? 'bg-emerald-500/20 text-emerald-300' :
                  file.visibility === 'review' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-white/10 text-white/60'
                }`}>
                  {file.visibility}
                </span>
                <span>Modified {new Date(file.modified_time).toLocaleString()}</span>
                {file.size && <span>• {(file.size / 1024 / 1024).toFixed(2)} MB</span>}
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {previewLoading ? (
               <div className="flex flex-col items-center text-muted-foreground">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary mb-4" />
                  <p className="text-sm">Loading watermark preview...</p>
               </div>
            ) : previewError ? (
               <div className="flex flex-col items-center text-muted-foreground text-center max-w-md">
                 <CircleAlert className="h-12 w-12 text-amber-500/50 mb-4" />
                 <p className="text-foreground font-medium mb-1">Preview Unavailable</p>
                 <p className="text-sm">{previewError.message === 'Unsupported preview format' 
                    ? 'This file type cannot be previewed securely. Download to view if released, or ask your agency to provide a supported format for review.'
                    : 'The preview could not be loaded securely.'}</p>
               </div>
            ) : previewData ? (
               <div className="relative w-full h-full flex flex-col items-center justify-center">
                 <div className="relative max-h-full max-w-full overflow-auto rounded-lg border border-white/10 bg-black/40">
                    <img 
                      src={previewData.url} 
                      alt={`Preview of ${file.name} (Page ${page})`}
                      className="max-h-full max-w-full object-contain pointer-events-none select-none"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                 </div>
                 
                 {previewData.pageCount > 1 && (
                   <div className="absolute bottom-6 flex items-center gap-4 rounded-full border border-white/10 bg-black/80 px-4 py-2 backdrop-blur-md">
                     <button 
                       onClick={() => setPage(p => Math.max(1, p - 1))}
                       disabled={page === 1 || previewLoading}
                       className="text-white/70 hover:text-white disabled:opacity-30"
                     >
                       <ChevronLeft className="h-5 w-5" />
                     </button>
                     <span className="text-xs font-medium text-white/90">
                       Page {page} of {previewData.pageCount}
                     </span>
                     <button 
                       onClick={() => setPage(p => Math.max(1, Math.min(previewData.pageCount, p + 1)))}
                       disabled={page === previewData.pageCount || previewLoading}
                       className="text-white/70 hover:text-white disabled:opacity-30"
                     >
                       <ChevronRight className="h-5 w-5" />
                     </button>
                   </div>
                 )}
               </div>
            ) : null}
            
            {!previewLoading && !previewError && previewData && (
              <p className="absolute bottom-4 left-4 text-[10px] text-white/30 tracking-wider uppercase pointer-events-none">
                Confidential Watermarked Preview
              </p>
            )}
          </div>
        </div>

        {/* Sidebar (Comments/Decision) */}
        <div className="flex w-full flex-col border-t border-border bg-card md:w-80 md:border-l md:border-t-0 shrink-0">
          <div className="flex flex-col border-b border-border">
             <div className="flex border-b border-white/5">
                <button 
                  onClick={() => setIsDecisionMode(false)}
                  className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${!isDecisionMode ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Discussion
                </button>
                {canDecide && (
                  <button 
                    onClick={() => setIsDecisionMode(true)}
                    className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${isDecisionMode ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/5' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Action
                  </button>
                )}
             </div>
          </div>
          
          {!isDecisionMode ? (
            <>
              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {commentsLoading ? (
                  <div className="flex justify-center py-8"><div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" /></div>
                ) : (comments?.comments || comments || []).length > 0 ? (
                  (comments?.comments || comments || []).map((comment) => (
                    <div key={comment.id} className="text-sm">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-medium text-foreground">{comment.author?.name || comment.author_email || 'Client team member'}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                      </div>
                      <p className="text-muted-foreground bg-white/5 rounded-lg p-3 rounded-tl-none">{comment.body}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-60 py-12">
                    <MessageSquare className="h-8 w-8 mb-3" />
                    <p className="text-sm">No comments yet.</p>
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-border bg-background">
                <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                  <textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment on this version..."
                    className="w-full resize-none rounded-lg border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 h-20"
                    disabled={addComment.isPending}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">Ties to current version</span>
                    <button 
                      type="submit" 
                      disabled={!commentText.trim() || addComment.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
                    >
                      {addComment.isPending ? 'Sending...' : 'Post'}
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
             <div className="flex flex-col h-full p-5 overflow-y-auto">
               <div className="mb-6">
                 <h3 className="font-heading text-xl text-foreground mb-2">Review Decision</h3>
                 <p className="text-sm text-muted-foreground">
                   Approve this asset to authorize its final release, or request revisions with specific feedback.
                 </p>
               </div>
               
               <div className="space-y-6 flex-1">
                  <button 
                    onClick={() => handleDecision('approved')}
                    disabled={makeDecision.isPending}
                    className="w-full group flex flex-col items-center justify-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                  >
                    <div className="rounded-full bg-emerald-500/20 p-3 text-emerald-500 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-emerald-500 uppercase tracking-wider text-sm mb-1">Approve Asset</p>
                      <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">This asset is ready. Authorize final delivery and billing.</p>
                    </div>
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                    <div className="relative flex justify-center"><span className="bg-card px-2 text-xs uppercase tracking-wider text-muted-foreground">Or</span></div>
                  </div>
                  
                  <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-foreground mb-1.5 block">Request Revisions</label>
                      <p className="text-[10px] text-muted-foreground mb-3">Provide clear feedback for the next round.</p>
                    </div>
                    <textarea 
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      placeholder="What needs to change?"
                      className="w-full resize-none rounded-lg border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 h-24"
                      disabled={makeDecision.isPending}
                    />
                    <button 
                      onClick={() => handleDecision('revision_requested')}
                      disabled={makeDecision.isPending || !decisionNote.trim()}
                      className="w-full rounded-lg bg-amber-500/10 py-2.5 text-xs font-medium uppercase tracking-wider text-amber-500 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
                    >
                      {makeDecision.isPending ? 'Submitting...' : 'Submit Revision Request'}
                    </button>
                  </div>
               </div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}