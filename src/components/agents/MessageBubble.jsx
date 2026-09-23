import React from 'react';
import MarkdownText from './MarkdownText';
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
            <MarkdownText content={message.content} />
          ))}
        {(message.tool_calls || []).map((toolCall, idx) => (
          <ToolCallDetails key={`${toolCall.name}-${idx}`} toolCall={toolCall} />
        ))}
      </div>
    </div>
  );
}