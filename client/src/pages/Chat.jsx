// client/src/pages/Chat.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import './TableStyles.css';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch previous messages for this tenant organization
    const fetchHistory = async () => {
      try {
        const res = await api.get('/chat');
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };
    fetchHistory();

    // Socket listener setup
    if (!socket.connected) socket.connect();

    // Join tenant-specific organization room
    if (user?.org_id) {
      socket.emit('join_org_room', user.org_id);
    }

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    socket.emit('send_message', {
      sender_id: user.id,
      sender_name: user.name,
      message: inputMessage,
      org_id: user.org_id // Send tenant scope
    });

    setInputMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 5rem)' }}>
      <div className="page-header">
        <h1>Team Collaboration Chat</h1>
      </div>

      <div style={{ flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === user.id;
          return (
            <div key={msg.id || `${idx}-${msg.sent_at}`} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '60%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textAlign: isMe ? 'right' : 'left' }}>
                {isMe ? 'You' : msg.sender_name} • {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ background: isMe ? '#3b82f6' : 'var(--sidebar-hover)', color: isMe ? '#fff' : 'var(--text-color)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
        <input 
          type="text" 
          value={inputMessage} 
          onChange={(e) => setInputMessage(e.target.value)} 
          placeholder="Type a message to the team..." 
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontSize: '0.95rem' }}
        />
        <button type="submit" className="primary-btn">Send</button>
      </form>
    </div>
  );
};

export default Chat;