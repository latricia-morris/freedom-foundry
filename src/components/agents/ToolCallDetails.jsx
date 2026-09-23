import React, { useState } from 'react';
import { ChevronRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const RUNNING = ['pending', 'running', 'in_progress'];
const FAILED = ['failed', 'error'];

function parseJson(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/** One agent tool call: state label, expandable parameters and result. */
export default function ToolCallDetails({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const projection = toolCall.display_projection || {};
  const running = RUNNING.includes(toolCall.status);
  const parsed = parseJson(toolCall.results);
  const failed =
    FAILED.includes(toolCall.status) ||
    /error|failed/i.test(typeof toolCall.results === 'string' ? toolCall.results : '') ||
    (parsed && parsed.success === false);

  const name = (toolCall.name || 'action').replace(/_/g, ' ');
  const hideDetails = projection.hide_details && projection.details_redacted;
  const stateLabel = failed
    ? projection.error_label || 'Failed'
    : running
      ? projection.active_label || 'Working'
      : projection.label || 'Done';

  const Icon = failed ? XCircle : running ? Loader2 : CheckCircle2;

  return (
    <div className="mt-2 text-xs">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon className={`h-3.5 w-3.5 ${running ? 'animate-spin' : ''}`} />
        {hideDetails ? (
          <span>{stateLabel}</span>
        ) : (
          <>
            <span className="capitalize">{name}</span>
            <span className="text-muted-foreground/70">{stateLabel}</span>
            <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </>
        )}
      </button>
      {expanded && !hideDetails && (
        <div className="mt-2 space-y-2 border-l border-border pl-3">
          {toolCall.arguments_string && (
            <div>
              <p className="uppercase tracking-widest text-muted-foreground/70">Parameters</p>
              <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] text-muted-foreground">
                {typeof parseJson(toolCall.arguments_string) === 'string'
                  ? toolCall.arguments_string
                  : JSON.stringify(parseJson(toolCall.arguments_string), null, 2)}
              </pre>
            </div>
          )}
          {toolCall.results !== undefined && toolCall.results !== null && (
            <div>
              <p className="uppercase tracking-widest text-muted-foreground/70">Result</p>
              <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] text-muted-foreground">
                {typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}