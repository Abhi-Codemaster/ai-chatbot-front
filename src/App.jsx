import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader, RefreshCw, Trash2, MessageCircle } from "lucide-react";

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI assistant. I can help you with user database queries, financial questions, and general knowledge. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = "http://localhost:3000";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async ( message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      return data.response || "Sorry, I couldn’t process that request.";
    } catch (error) {
      setIsConnected(false);
      return "⚠️ Server not reachable. Please check API.";
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
    setInputMessage("");
    setIsLoading(true);

    try {
      const botResponse = await sendMessage(userMessage.content);
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: botResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsConnected(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: "❌ Error while processing your request.",
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
        content: "Chat cleared! How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  const retryConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (response.ok) {
        setIsConnected(true);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "bot",
            content: "✅ Connection restored!",
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) =>
    timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const quickActions = [
    "Find user with PAN ABGPA5303H",
    "What is SIP?",
    "Calculate AUM for client 11181",
    "Explain mutual funds",
    "Get transaction history",
  ];

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg border-0 w-100" style={{ maxWidth: "600px", height: "80vh" }}>
        {/* Header */}
        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="bg-primary text-white p-2 rounded me-2">
              <MessageCircle size={20} />
            </div>
            <div>
              <h6 className="mb-0">AI Assistant</h6>
              <small className="text-muted">
                {isConnected ? "Connected" : "Disconnected"} •{" "}
                <span
                  className={`badge rounded-circle p-2 ${
                    isConnected ? "bg-success" : "bg-danger"
                  }`}
                ></span>
              </small>
            </div>
          </div>
          <div>
            {!isConnected && (
              <button
                className="btn btn-outline-primary btn-sm me-2"
                onClick={retryConnection}
                disabled={isLoading}
              >
                <RefreshCw size={16} />
              </button>
            )}
            <button className="btn btn-outline-secondary btn-sm" onClick={clearChat}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="card-body d-flex flex-column p-3" style={{ overflowY: "auto" }}>
          <div className="flex-grow-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`d-flex mb-3 ${
                  msg.type === "user" ? "justify-content-end" : "justify-content-start"
                }`}
              >
                {msg.type === "bot" && (
                  <div
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`p-2 rounded ${
                    msg.type === "user" ? "bg-primary text-white" : "bg-light border"
                  }`}
                  style={{ maxWidth: "75%" }}
                >
                  <p className="mb-1">{msg.content}</p>
                  <small className="text-muted">{formatTime(msg.timestamp)}</small>
                </div>
                {msg.type === "user" && (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center ms-2"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="d-flex mb-3">
                <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                  style={{ width: "32px", height: "32px" }}
                >
                  <Bot size={16} />
                </div>
                <div className="p-2 bg-light border rounded">
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm text-secondary me-2"></div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="px-3 pb-2">
            <p className="small text-muted">Try these quick actions:</p>
            {quickActions.map((action, i) => (
              <button
                key={i}
                className="btn btn-sm btn-outline-primary me-2 mb-2"
                onClick={() => setInputMessage(action)}
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="card-footer bg-white border-top">
          <form className="d-flex" onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-control me-2"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading || !isConnected}
            />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isLoading || !inputMessage.trim() || !isConnected}
            >
              {isLoading ? (
                <div className="spinner-border spinner-border-sm"></div>
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
          {!isConnected && (
            <small className="text-danger mt-2 d-block">
              ⚠️ Not connected to server. Please check your API.
            </small>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
