import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./AIChatWidget.module.css";
import { SparklesIcon, CloseIcon, SendIcon } from "./Icons";

export default function AIChatWidget({ renderProduct, externalPrompt, onExternalPromptHandled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm PulseCart AI. Looking for something specific?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const lastHandledPrompt = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = useCallback(async (text, currentMessages) => {
    const userMessage = { role: "user", content: text };
    const updatedMessages = [...currentMessages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error("Failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value);
        assistantContent += chunkText;

        setMessages((prev) => {
          const newMsg = [...prev];
          newMsg[newMsg.length - 1].content = assistantContent.replace(/\*\*/g, '').replace(/#/g, '');
          return newMsg;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connections are a bit fuzzy right now, please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!externalPrompt || externalPrompt === lastHandledPrompt.current) return;
    lastHandledPrompt.current = externalPrompt;
    setIsOpen(true);
    sendMessage(externalPrompt, messagesRef.current);
    onExternalPromptHandled?.();
  }, [externalPrompt, onExternalPromptHandled, sendMessage]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input.trim(), messages);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        className={`${styles.toggleBtn} ${isOpen ? styles.hidden : ""}`}
        onClick={() => setIsOpen(true)}
      >
        <SparklesIcon size={22} className={styles.sparkle} />
        Ask AI
      </button>

      {/* Chat Window */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <SparklesIcon size={16} />
            <h2>PulseCart Assistant</h2>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <CloseIcon size={16} />
          </button>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, i) => {
            if (msg.role === "assistant") {
              const parts = msg.content.split(/\[PRODUCT:(\d+)\]/g);
              return (
                <div key={i} className={`${styles.msgRow} ${styles.assistant}`}>
                  <div className={styles.bubble}>
                    {parts.map((part, idx) => {
                      if (idx % 2 === 1) {
                        return renderProduct ? renderProduct(part) : ` [Product ${part} linked] `;
                      }
                      return <span key={idx}>{part}</span>;
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className={`${styles.msgRow} ${styles[msg.role]}`}>
                <div className={styles.bubble}>{msg.content}</div>
              </div>
            );
          })}
          {isLoading && (
            <div className={`${styles.msgRow} ${styles.assistant}`}>
              <div className={`${styles.bubble} ${styles.typing}`}>...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputArea} onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="E.g. Which laptop is best for coding?" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim() || isLoading}>
            <SendIcon size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
