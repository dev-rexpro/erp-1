import "./chat-base-theme.css";

export default function ChatBaseTheme() {
  return (
    <div className="chat-shell">
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground">Chat history empty.</p>
      </div>
      <div className="p-3 border-t border-border/20">
        <input
          type="text"
          className="w-full bg-muted/20 border border-border/30 rounded-lg px-3 py-2 text-sm outline-none"
          placeholder="Ketik pesan..."
        />
      </div>
    </div>
  );
}