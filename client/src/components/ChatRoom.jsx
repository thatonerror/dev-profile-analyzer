import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Send, Loader2, MessageCircle, Users, AlertCircle } from 'lucide-react';

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/verification/room/${roomId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch room data');
        }

        setRoomData(data.data);
        
        // Prompt user to identify themselves
        promptUserRole(data.data);
        
      } catch (err) {
        console.error('❌ Fetch room error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Prompt user to enter their details
  const promptUserRole = (room) => {
    const name = prompt('Enter your name:');
    const email = prompt('Enter your email:');
    
    if (!name || !email) {
      alert('Name and email are required to join the chat');
      navigate('/dashboard');
      return;
    }

    // Determine role based on email
    let role = 'employer'; // Default
    
    if (email === room.participants.recruiter.email) {
      role = 'recruiter';
    } else if (email === room.participants.candidate.email) {
      role = 'candidate';
    }

    const user = { name, email, role };
    setUserInfo(user);

    // Join room via socket
    if (socket) {
      socket.emit('join-room', { roomId, user });
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !userInfo) return;

    // Load previous messages
    socket.on('load-messages', (msgs) => {
      console.log('📨 Loaded messages:', msgs.length);
      setMessages(msgs);
    });

    // Receive new message
    socket.on('receive-message', (msg) => {
      console.log('💬 New message:', msg);
      setMessages(prev => [...prev, msg]);
    });

    // User joined
    socket.on('user-joined', (data) => {
      console.log('👤 User joined:', data.user);
      setMessages(prev => [...prev, {
        sender: { name: 'System', role: 'system' },
        message: `${data.user} (${data.role}) joined the chat`,
        timestamp: data.timestamp,
        isSystem: true
      }]);
    });

    // User left
    socket.on('user-left', (data) => {
      setMessages(prev => [...prev, {
        sender: { name: 'System', role: 'system' },
        message: `${data.user} left the chat`,
        timestamp: new Date(),
        isSystem: true
      }]);
    });

    // Typing indicator
    socket.on('user-typing', (data) => {
      setTypingUser(data.user);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 3000);
    });

    socket.on('user-stop-typing', () => {
      setTypingUser(null);
    });

    // Error
    socket.on('error', (data) => {
      console.error('❌ Socket error:', data.message);
      setError(data.message);
    });

    // Cleanup
    return () => {
      socket.off('load-messages');
      socket.off('receive-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('user-typing');
      socket.off('user-stop-typing');
      socket.off('error');
      
      // Leave room on unmount
      socket.emit('leave-room', { roomId, user: userInfo });
    };
  }, [socket, userInfo, roomId]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !socket || !userInfo) return;

    socket.emit('send-message', {
      roomId,
      message: inputMessage.trim(),
      sender: userInfo
    });

    setInputMessage('');
    socket.emit('stop-typing', { roomId });
  };

  // Typing indicator
  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    
    if (socket && userInfo && e.target.value.length > 0) {
      socket.emit('typing', { roomId, user: userInfo });
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', { roomId });
      }, 1000);
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'recruiter': return 'text-purple-400';
      case 'candidate': return 'text-blue-400';
      case 'employer': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRoleBg = (role) => {
    switch (role) {
      case 'recruiter': return 'bg-purple-500/20 border-purple-500/30';
      case 'candidate': return 'bg-blue-500/20 border-blue-500/30';
      case 'employer': return 'bg-green-500/20 border-green-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading chat room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-purple-400" />
            <div>
              <h1 className="text-xl font-bold text-white">
                Verification Chat - {roomData?.candidateId?.name}
              </h1>
              <p className="text-xs text-slate-400">Room ID: {roomId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-slate-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="container mx-auto max-w-4xl">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.isSystem ? 'justify-center' : msg.sender.email === userInfo?.email ? 'justify-end' : 'justify-start'}`}
            >
              {msg.isSystem ? (
                <div className="bg-slate-800/50 px-4 py-2 rounded-full text-xs text-slate-400">
                  {msg.message}
                </div>
              ) : (
                <div className={`max-w-md ${msg.sender.email === userInfo?.email ? 'ml-auto' : 'mr-auto'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${getRoleColor(msg.sender.role)}`}>
                      {msg.sender.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={`${getRoleBg(msg.sender.role)} backdrop-blur-xl border rounded-2xl px-4 py-3`}>
                    <p className="text-slate-100 text-sm">{msg.message}</p>
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
      </div>

      {/* Input */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-t border-slate-700/50 p-4">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={handleTyping}
              placeholder="Type your message..."
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || !connected}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl px-6 py-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}