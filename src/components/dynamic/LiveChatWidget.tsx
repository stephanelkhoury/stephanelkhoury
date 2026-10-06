'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, ArrowRight } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  degraded?: boolean;
};

const QUICK_PROMPTS = [
  'Can you build a web app for me?',
  'What are your rates/availability?',
  'What SEO services do you offer?',
  'How do I reach Stephan?',
];

function getVisitorId() {
  try {
    const existing = window.localStorage.getItem('visitor-id');
    if (existing) return existing;
    const generated = `visitor-${window.crypto.randomUUID()}`;
    window.localStorage.setItem('visitor-id', generated);
    return generated;
  } catch {
    return 'anonymous';
  }
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce ${
            i === 1 ? '[animation-delay:150ms]' : i === 2 ? '[animation-delay:300ms]' : ''
          }`}
        />
      ))}
    </div>
  );
}

export default function LiveChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (open) {
      const messageList = messagesRef.current;
      messageList?.scrollTo({
        top: messageList.scrollHeight,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      setUnread(0);
    }
  }, [messages, open]);

  useEffect(() => {
    let focusTimer: number | undefined;
    if (open) {
      focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);
    } else if (wasOpenRef.current) {
      launcherRef.current?.focus({ preventScroll: true });
    }
    wasOpenRef.current = open;
    return () => {
      if (focusTimer !== undefined) window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  // Increment unread badge when a new assistant message arrives while closed
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!open && last?.role === 'assistant') {
      setUnread((n) => n + 1);
    }
  }, [messages, open]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content }]);
    setInput('');
    setLoading(true);
    let timeout: number | undefined;

    try {
      const controller = new AbortController();
      timeout = window.setTimeout(() => controller.abort(), 30000);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId, visitorId: getVisitorId() }),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);

      const data = await response.json().catch(() => null) as { error?: string; sessionId?: string; answer?: string; degraded?: boolean } | null;
      if (!response.ok) throw new Error('The assistant is temporarily unavailable. Please use the contact links below.');
      if (!data || typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('I could not prepare a reply. Please use the contact links below.');
      }

      const answer = data.answer.trim();
      setSessionId(data.sessionId ?? null);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, degraded: data.degraded }]);
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'AbortError'
        ? 'The assistant took too long to respond. Please try again or use the contact links below.'
        : error instanceof Error && error.message.startsWith('The assistant')
          ? error.message
          : 'I could not reach the assistant. Please try again or use the contact links below.';
      setMessages((prev) => [...prev, { role: 'assistant', content: message }]);
    } finally {
      if (timeout !== undefined) window.clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating Launcher Button ────────────────── */}
      <motion.button
        ref={launcherRef}
        onClick={open ? () => setOpen(false) : handleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? 'Close portfolio assistant' : 'Open portfolio assistant'}
        aria-expanded={open}
        aria-controls="portfolio-assistant-dialog"
        title={open ? 'Close portfolio assistant' : 'Open portfolio assistant'}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[70] flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-primary)] text-white shadow-lg shadow-black/25 transition-colors hover:brightness-90"
      >
        {open ? (
          <X size={18} />
        ) : (
          <>
            <MessageSquare size={19} aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </motion.button>

      {/* ── Chat Popup ───────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-popup"
            id="portfolio-assistant-dialog"
            role="dialog"
            aria-modal="false"
            aria-labelledby="portfolio-assistant-title"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.75rem)] left-3 right-3 z-[70] flex flex-col overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--background)] shadow-2xl shadow-black/30 sm:bottom-24 sm:left-auto sm:right-6 sm:w-[380px]"
            style={{ maxHeight: 'min(580px, calc(100dvh - 7rem - env(safe-area-inset-bottom)))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-100/80 dark:bg-zinc-900/80 border-b border-zinc-300 dark:border-zinc-800">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                SE
              </div>
              <div className="flex-1 min-w-0">
                <p id="portfolio-assistant-title" className="text-sm font-semibold text-[var(--foreground)]">Portfolio assistant</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">AI-powered project information</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors" aria-label="Close chat" title="Close chat">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={messagesRef} role="log" aria-live="polite" aria-relevant="additions text" aria-busy={loading} className="min-h-[220px] flex-1 space-y-3 overflow-y-auto p-3 sm:p-4 no-scrollbar">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                    👋 Hi! Ask me anything about Stephan — projects, experience, availability, or how to get in touch.
                  </p>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => void send(prompt)}
                        className="flex items-center justify-between w-full text-left text-xs px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700/60 bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:border-blue-500/40 text-zinc-700 dark:text-zinc-300 transition-all group"
                      >
                        {prompt}
                        <ArrowRight size={12} className="text-zinc-400 dark:text-zinc-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, idx) => (
                <div
                  key={`${message.role}-${idx}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`text-sm px-3 py-2 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-wrap break-words ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-bl-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div role="status" aria-label="Assistant is typing" className="flex justify-start">
                  <div className="bg-zinc-200 dark:bg-zinc-800 rounded-xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
                placeholder="Ask about projects, availability…"
                className="flex-1 bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-base sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-500 outline-none focus:border-blue-500/50 transition-colors"
              />
              <button
                onClick={() => void send()}
                disabled={loading || !input.trim()}
                className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
                title="Send"
              >
                <Send size={14} />
              </button>
            </div>

            {/* Footer hint */}
            <p className="pb-2 text-center text-[10px] text-zinc-500 dark:text-zinc-400">
              Powered by Gemini AI · All chats are logged
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

