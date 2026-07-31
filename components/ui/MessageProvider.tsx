"use client";

import { createContext, useCallback, useContext, useRef, useState } from 'react';

type MessageKind = 'success' | 'error';

interface Message {
  id: number;
  kind: MessageKind;
  text: string;
}

interface MessageContextValue {
  showMessage: (kind: MessageKind, text: string) => void;
}

const MessageContext = createContext<MessageContextValue | null>(null);

export function useMessages(): MessageContextValue {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error('useMessages must be used within a MessageProvider');
  return ctx;
}

export default function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  const showMessage = useCallback((kind: MessageKind, text: string) => {
    const id = nextId.current++;
    setMessages(prev => [...prev, { id, kind, text }]);
    const duration = kind === 'error' ? 6000 : 3000;
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const successMessages = messages.filter(m => m.kind === 'success');
  const errorMessages = messages.filter(m => m.kind === 'error');

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {children}
      <div className="fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-6 pointer-events-none">
        <div aria-live="polite" role="status" className="w-full max-w-sm flex flex-col items-center gap-2">
          {successMessages.map(m => (
            <Toast key={m.id} kind={m.kind} text={m.text} onDismiss={() => dismiss(m.id)} />
          ))}
        </div>
        <div aria-live="assertive" role="alert" className="w-full max-w-sm flex flex-col items-center gap-2">
          {errorMessages.map(m => (
            <Toast key={m.id} kind={m.kind} text={m.text} onDismiss={() => dismiss(m.id)} />
          ))}
        </div>
      </div>
    </MessageContext.Provider>
  );
}

function Toast({ kind, text, onDismiss }: { kind: MessageKind; text: string; onDismiss: () => void }) {
  return (
    <div
      className={`pointer-events-auto w-full rounded-2xl px-5 py-4 font-bold shadow-xl text-sm flex items-start justify-between gap-4 ${
        kind === 'error' ? 'bg-danger text-danger-fg' : 'surface-card-inverted'
      }`}
    >
      <span>{text}</span>
      <button onClick={onDismiss} aria-label="Dismiss message" className="shrink-0 opacity-70 hover:opacity-100">
        ×
      </button>
    </div>
  );
}
