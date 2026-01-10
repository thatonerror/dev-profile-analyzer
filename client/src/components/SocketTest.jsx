import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Wifi, WifiOff, Users } from 'lucide-react';

export default function SocketTest() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize socket
  useEffect(() => {
    const newSocket = io('http://localhost:5001', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to test server:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected');
      setConnected(false);
    });

    newSocket.on('welcome', (data) => {
      console.log('👋 Welcome:', data);
      setMessages(prev => [...prev, {
        sender: 'System',
        message: data.message,
        timestamp: data.timestamp,
        isSystem: true
      }]);
    });

    newSocket.on('load-messages', (msgs) => {
      console.log('📨 Loaded messages:', msgs);
      setMessages(msgs.map(m => ({ ...m, isSystem: true })));
    });

    newSocket.on('user-joined', (data) => {
      console.log('👤 User joined:', data);
      setMessages(prev => [...prev, {
        sender: 'System',
        message: data.message,
        timestamp: data.timestamp,
        isSystem: true
      }]);
    });

    newSocket.on('receive-message', (msg) => {
      console.log('💬 New message:', msg);
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('user-typing', (data) => {
      setTypingUser(data.username);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 3000);
    });

    newSocket.on('user-stop-typing', () => {
      setTypingUser(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!username.trim() || !socket) return;

    socket.emit('join-test-room', { username: username.trim() });
    setHasJoined(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    socket.emit('send-test-message', {
      roomId: 'test-room-123',
      message: inputMessage.trim(),
      username
    });

    setInputMessage('');
    socket.emit('stop-typing', { roomId: 'test-room-123' });
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    
    if (socket && e.target.value.length > 0) {
      socket.emit('typing', { roomId: 'test-room-123', username });
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', { roomId: 'test-room-123' });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Socket.IO Test
              </h1>
              <p className="text-slate-400 text-sm mt-1">Testing real-time communication</p>
            </div>
            <div className="flex items-center gap-2">
              {connected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-sm font-semibold">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm font-semibold">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Join Form */}
        {!hasJoined && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-4">Join Test Chat Room</h2>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!username.trim() || !connected}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3 rounded-xl font-bold transition disabled:opacity-50"
              >
                Join Room
              </button>
            </form>
          </div>
        )}

        {/* Chat Room */}
        {hasJoined && (
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
            {/* Room Header */}
            <div className="bg-slate-800/50 border-b border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold">Test Room #123</span>
                </div>
                <span className="text-sm text-slate-400">Logged in as: {username}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.isSystem ? 'justify-center' : msg.sender === username ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.isSystem ? (
                    <div className="bg-slate-800/50 px-4 py-2 rounded-full text-xs text-slate-400">
                      {msg.message}
                    </div>
                  ) : (
                    <div className={`max-w-xs ${msg.sender === username ? 'ml-auto' : 'mr-auto'}`}>
                      <div className="text-xs text-slate-400 mb-1">
                        {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                      <div className={`${msg.sender === username ? 'bg-blue-600' : 'bg-slate-700'} rounded-2xl px-4 py-3`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {typingUser && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/50 px-4 py-2 rounded-2xl text-xs text-slate-400">
                    {typingUser} is typing...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-700/50 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl px-6 py-3 transition disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
          <h3 className="font-bold text-blue-300 mb-2">🧪 Testing Instructions:</h3>
          <ol className="text-sm text-slate-300 space-y-2">
            <li>1. Open this page in <strong>2 different browser tabs</strong></li>
            <li>2. Join with different names (e.g., "Alice" and "Bob")</li>
            <li>3. Send messages between tabs</li>
            <li>4. Watch real-time message delivery</li>
            <li>5. Try typing to see typing indicators</li>
          </ol>
        </div>
      </div>
    </div>
  );
}