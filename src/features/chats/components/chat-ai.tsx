"use client";

import { useState } from "react";

export function ChatAI() {
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: 'AI', text: 'Halo Masbro! Ada yang bisa dibantu mengenai analitik atau dokumen ERP-ONE hari ini?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'User', text: input }]);
    setInput('');
  };

  return (
    <div className="chat-shell h-full flex flex-col bg-background rounded-lg border border-border/30">
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.sender === 'User' ? 'items-end' : 'items-start'}`}>
            <span className="text-[11px] font-semibold text-muted-foreground mb-1">{msg.sender}</span>
            <div className={`px-3 py-2 rounded-lg text-sm max-w-md ${msg.sender === 'User' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-muted/40 border border-border/20'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border/20 flex items-center gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-sm outline-none resize-none"
          placeholder="Ketik pesan..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Kirim
        </button>
      </div>
    </div>
  );
}