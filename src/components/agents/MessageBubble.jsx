import React from 'react';
import ReactMarkdown from 'react-markdown';
import ToolCallDetails from './ToolCallDetails';

/** One conversation message, with any tool calls the agent made beneath it. */
export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          isUser
            ? 'max-w-[85%] rounded-2xl border border-border/60 bg-secondary/60 px-4 py-3'
            : 'w-full max-w-[95%] rounded-2xl border border-border/60 bg-card/70 px-4 py-3'
        }
      >
        {message.content &&
          (isUser ? (
            <p className="whitespace-pre-wrap text-sm text-foreground">{message.content}</p>
          ) : (
            <div className="space-y-3 text-sm leading-relaxed text-foreground [&_h1]:font-heading [&_h1]:text-lg [&_h2]:font-heading [&_h2]:text-base [&_h2]:font-medium [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))}
        {(message.tool_calls || []).map((toolCall, idx) => (
          <ToolCallDetails key={`${toolCall.name}-${idx}`} toolCall={toolCall} />
        ))}
      </div>
    </div>
  );
}