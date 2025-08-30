import { useState, useRef, useEffect } from "react";
import { Send, Loader, RefreshCw, Trash2, MessageCircle } from "lucide-react";

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "👋 Hello! I'm your AI assistant. I can help you with user database queries, financial questions, and general knowledge. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = "http://localhost:3000";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      console.log("API Response Status:", response);

      const data = await response.json();
      return data.response || "Sorry, I couldn't process that request.";
    } catch (error) {
      console.error("API Error:", error);
      setIsConnected(false);
      return `⚠️ Trouble connecting to the server. Please check API. ${error}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      const botResponse = await sendMessage(currentMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: botResponse,
          timestamp: new Date(),
        },
      ]);
      setIsConnected(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content:
            "❌ Sorry, I encountered an error while processing your request.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "✨ Chat cleared! How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (timestamp) =>
    timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="d-flex justify-content-center align-items-center bg-primary" style={{ minHeight: "100vh" }}>
      <div className="card shadow-lg" style={{ width: "600px", height: "80vh" }}>
        
        {/* Header */}
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <MessageCircle className="me-2" />
            <div>
              <h6 className="mb-0">AI Assistant</h6>
              <small>{isConnected ? "Connected ✅" : "Disconnected ❌"}</small>
            </div>
          </div>
          <div>
            <button onClick={clearChat} className="btn btn-sm btn-light">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="card-body overflow-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-3 d-flex ${msg.type === "user" ? "justify-content-end" : "justify-content-start"}`}>
              <div className={`p-2 rounded ${msg.type === "user" ? "bg-primary text-white" : "bg-light"}`}>
                <div>{msg.content}</div>
                <small className="text-muted">{formatTime(msg.timestamp)}</small>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="text-muted">
              <Loader className="me-2 animate-spin" size={16} />
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="card-footer">
          <form onSubmit={handleSubmit} className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || !isConnected}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isLoading || !inputMessage.trim() || !isConnected}
            >
              {isLoading ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
