import React, { useState, useRef, useEffect } from "react";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}api/chat`; // adjust if needed

const Chatb = () => {
  const bottomRef = useRef(null);

  
  const [userId] = useState(() => {
    let id = localStorage.getItem("mongo_id");
    if (!id) {
      // Fallback if not logged in (though typically protected)
      id = localStorage.getItem("chat_user_id");
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("chat_user_id", id);
      }
    }
    return id;
  });

  /* ================= CHAT STATE ================= */
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_messages");
    return saved
      ? JSON.parse(saved)
      : [{ role: "bot", text: "Hi 👋 I’m Safety Chat. How can I help you today?" }];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= PERSIST CHAT ================= */
  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: userMsg.text,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-linear-to-br from-[#f4f8fc] to-[#eef3f9] flex items-center justify-center px-4">
      <div className="w-full lg:w-[70%] bg-white rounded-3xl shadow-sm flex flex-col h-[85vh]">

        {/* HEADER */}
        <div className="px-5 py-4 rounded-t-3xl bg-[#a7c7e7] text-white">
          <h2 className="text-lg font-semibold">Safety Chat</h2>
          <p className="text-xs opacity-90">Your women safety assistant</p>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm
                  ${msg.role === "user"
                    ? "bg-[#a7c7e7] text-white rounded-br-none"
                    : "bg-[#f2f6fb] text-gray-700 rounded-bl-none"
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-gray-400">Typing…</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message…"
              className="flex-1 px-4 py-3 rounded-xl bg-[#f2f6fb] focus:outline-none focus:ring-2 focus:ring-[#a7c7e7] text-sm"
            />
            <button
              onClick={sendMessage}
              className="px-5 py-3 rounded-xl bg-[#a7c7e7] text-white font-semibold hover:opacity-90 transition"
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Chatb;
