import React, { useState, useEffect, useRef } from "react";

function App() {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const messagesEndRef = useRef(null);

  const userColor = useRef(
    `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      
      if (data.type === "typing") {
        setTypingUser(`${data.user} is typing...`);
        setTimeout(() => setTypingUser(""), 1500);
        return;
      }

      
      if (data.type === "message") {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => socket.close();
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!ws || !inputMessage.trim() || !username.trim()) return;

    ws.send(
      JSON.stringify({
        type: "message",
        user: username,
        color: userColor.current,
        text: inputMessage,
      })
    );

    setInputMessage("");
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    if (!ws || !username.trim()) return;

    ws.send(
      JSON.stringify({
        type: "typing",
        user: username,
      })
    );
  };
  
  if (!isNameSet) {
    return (
      <div style={styles.nameContainer}>
        <h2>Введіть ваше ім'я</h2>
        <input
          type="text"
          placeholder="Ваше ім'я"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.nameInput}
        />
        <button
          onClick={() => username.trim() && setIsNameSet(true)}
          style={styles.nameButton}
        >
          Увійти в чат
        </button>
      </div>
    );
  }


  return (
    <div style={styles.chatWrapper}>
      <h2 style={styles.header}>🔥 WebSocket Chat</h2>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.messageBubble}>
            <span style={{ ...styles.username, color: msg.color }}>
              {msg.user}
            </span>
            <span style={styles.messageText}>{msg.text}</span>
          </div>
        ))}

        {typingUser && (
          <div style={styles.typingText}>{typingUser}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          type="text"
          placeholder="Напишіть повідомлення..."
          value={inputMessage}
          onChange={handleTyping}
          style={styles.messageInput}
        />
        <button onClick={sendMessage} style={styles.sendButton}>
          ➤
        </button>
      </div>
    </div>
  );
}

const styles = {
  chatWrapper: {
    maxWidth: "600px",
    margin: "20px auto",
    fontFamily: "Arial",
  },
  header: {
    textAlign: "center",
    marginBottom: "10px",
  },
  chatBox: {
    border: "1px solid #ccc",
    background: "#f4f4f4",
    padding: "15px",
    height: "400px",
    overflowY: "scroll",
    borderRadius: "10px",
  },
  typingText: {
    fontStyle: "italic",
    color: "gray",
    marginTop: "5px",
  },
  messageBubble: {
    background: "white",
    padding: "10px 15px",
    marginBottom: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  username: {
    fontWeight: "bold",
    marginRight: "8px",
  },
  messageText: {
    color: "#333",
  },
  inputRow: {
    display: "flex",
    marginTop: "10px",
    gap: "10px",
  },
  messageInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  sendButton: {
    padding: "0 20px",
    fontSize: "20px",
    background: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  nameContainer: {
    textAlign: "center",
    paddingTop: "100px",
  },
  nameInput: {
    padding: "10px",
    width: "200px",
    fontSize: "16px",
  },
  nameButton: {
    display: "block",
    margin: "15px auto",
    padding: "10px 20px",
    background: "#4CAF50",
    border: "none",
    color: "white",
    cursor: "pointer",
    borderRadius: "8px",
  },
};

export default App;