'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, ArrowRight } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const QUICK_PROMPTS = [
  'Can you build a web app for me?',
  'What are your rates/availability?',
  'What SEO services do you offer?',
  'How do I reach Stephan?',
];

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
  const bottomRef = useRef<HTMLDivElement>(null);

  const visitorId = useMemo(() => {
    if (typeof window === 'undefined') return 'visitor';
    const existing = window.localStorage.getItem('visitor-id');
    if (existing) return existing;
    const generated = `visitor-${crypto.randomUUID()}`;
    window.localStorage.setItem('visitor-id', generated);
    return generated;
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnread(0);
    }
  }, [messages, open]);

  // Increment unread badge when a new assistant message arrives while closed
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!open && last?.role === 'assistant') {
      setUnread((n) => n + 1);
    }
  }, [messages, open]);

  if (pathname.startsWith('/admin')) {
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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId, visitorId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chat request failed');

      setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating Launcher Button ────────────────── */}
      <motion.button
        onClick={open ? () => setOpen(false) : handleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 px-3 sm:px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow min-h-11"
      >
        {open ? (
          <X size={18} />
        ) : (
          <>
            <MessageSquare size={18} />
            <span className="text-xs sm:text-sm">Chat with me</span>
            {/* Online indicator */}
            <span className="flex items-center gap-1 ml-1 text-xs font-normal text-green-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              Online
            </span>
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
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-20 right-2 left-2 sm:left-auto sm:bottom-24 sm:right-6 z-50 sm:w-[380px] rounded-2xl border border-zinc-300 dark:border-zinc-700/60 bg-white dark:bg-zinc-950 shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden flex flex-col"
            style={{ maxHeight: 'min(580px, calc(100dvh - 110px))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-100/80 dark:bg-zinc-900/80 border-b border-zinc-300 dark:border-zinc-800">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                SE
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Stephan&apos;s Assistant</p>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                  </span>
                  Online — usually replies instantly
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors" aria-label="Close chat" title="Close chat">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 no-scrollbar min-h-[220px]">
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
                    className={`text-sm px-3 py-2 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
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
                <div className="flex justify-start">
                  <div className="bg-zinc-200 dark:bg-zinc-800 rounded-xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
                placeholder="Ask about projects, availability…"
                className="flex-1 bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700/60 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-500 outline-none focus:border-blue-500/50 transition-colors"
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
            <p className="text-center text-[10px] text-zinc-500 dark:text-zinc-600 pb-2">
              Powered by Gemini AI · All chats are logged
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

