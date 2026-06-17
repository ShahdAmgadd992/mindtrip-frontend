import React, { useState, useRef, useEffect } from "react";
import chatIconImg from "../../assets/ai-planner/chat_icon.svg";
import sendIconImg from "../../assets/ai-planner/material-symbols_send-outline.svg";
import voiceIconImg from "../../assets/ai-planner/mingcute_voice-line.svg";
import addIconImg from "../../assets/ai-planner/add-rounded.svg";
import cameraIconImg from "../../assets/ai-planner/camera.svg";
import photoIconImg from "../../assets/ai-planner/photo.svg";
import fileIconImg from "../../assets/ai-planner/file.svg";
import videoIconImg from "../../assets/ai-planner/video.svg";
import aiService from "../../services/aiService";
import "./AiPlanner.css";

// ── Chatbot component ──
const ChatBot = ({ userName = "Laila", onClose, userId = "guest" }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "ai",
      text: "Hi! I'm Mindy, your AI travel assistant\nI can help you plan your perfect trip in Egypt.\nWhat would you like to do today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const attachOptions = [
    { label: "Camera", icon: cameraIconImg },
    { label: "Photo", icon: photoIconImg },
    { label: "File", icon: fileIconImg },
    { label: "Video", icon: videoIconImg },
  ];

  const aiReplies = [
    "Amazing! I'll take care of everything for you\nI just need a few details first.\nWhere would you like to go in Egypt?",
    "Great choice! How many days are you planning to stay?",
    "Perfect! What's your budget per person?",
    "Wonderful! What activities do you enjoy?\n(e.g. beaches, history, food, adventure)",
    "I'm putting together your perfect trip now... 🗺️\nThis will just take a moment!",
  ];
  const [replyIndex, setReplyIndex] = useState(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, bottomRef]);

  const sendMessage = async () => {
    if (!inputVal.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { id: Date.now(), from: "user", text: inputVal.trim(), time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);
    setChatError(null);

    try {
      const chatPayload = {
        userId: userId,
        sessionId: sessionId,
        messagePrompt: userMsg.text,
      };
      console.log('Sending chat message:', chatPayload);
      const response = await aiService.chat(chatPayload);
      console.log('Chat response:', response.data);

      const reply = response.data?.reply || aiReplies[replyIndex % aiReplies.length];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "ai",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setReplyIndex((i) => i + 1);
    } catch (err) {
      console.error('Chat error:', err);
      setChatError(
        err.response?.data?.message ||
          err.message ||
          "Failed to get response. Please try again."
      );
      const fallbackReply = aiReplies[replyIndex % aiReplies.length];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "ai",
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setReplyIndex((i) => i + 1);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-header">
          <button className="chatbot-back-btn" onClick={onClose}>←</button>
          <h2 className="chatbot-title">Hello, {userName}</h2>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-msg-row chatbot-msg-row--${msg.from}`}>
              {msg.from === "ai" && (
                <div className="chatbot-avatar">
                  <img src={chatIconImg} alt="AI" className="chatbot-avatar-icon" />
                </div>
              )}
              <div className={`chatbot-bubble-wrap`}>
                {msg.from === "ai" && (
                  <div className="chatbot-sender-info">
                    <span className="chatbot-time">{msg.time}</span>
                    <span className="chatbot-sender-name">Ai Assistant</span>
                  </div>
                )}
                <div className={`chatbot-bubble chatbot-bubble--${msg.from}`}>
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>{line}{i < msg.text.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chatbot-msg-row chatbot-msg-row--ai">
              <div className="chatbot-avatar">
                <img src={chatIconImg} alt="AI" className="chatbot-avatar-icon" />
              </div>
              <div className="chatbot-bubble-wrap">
                <div className="chatbot-sender-info">
                  <span className="chatbot-sender-name">Ai Assistant</span>
                </div>
                <div className="chatbot-bubble chatbot-bubble--ai chatbot-typing">
                  <span className="chatbot-dot" /><span className="chatbot-dot" /><span className="chatbot-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Attach menu */}
        {showAttachMenu && (
          <div className="chatbot-attach-menu">
            {attachOptions.map((opt) => (
              <button key={opt.label} className="chatbot-attach-item" onClick={() => setShowAttachMenu(false)}>
                <img src={opt.icon} alt={opt.label} className="chatbot-attach-icon" />
                <span className="chatbot-attach-label">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        {chatError && <div className="chatbot-error">{chatError}</div>}
        <div className="chatbot-input-row">
          <button
            className="chatbot-add-btn"
            onClick={() => setShowAttachMenu((v) => !v)}
          >
            <img src={addIconImg} alt="Add" className="chatbot-add-icon" />
          </button>
          <div className="chatbot-input-wrap">
            <input
              ref={inputRef}
              className="chatbot-input"
              placeholder="Type a message"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chatbot-voice-btn">
              <img src={voiceIconImg} alt="Voice" className="chatbot-voice-icon" />
            </button>
          </div>
          <button className="chatbot-send-btn" onClick={sendMessage} disabled={!inputVal.trim()}>
            <img src={sendIconImg} alt="Send" className="chatbot-send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;