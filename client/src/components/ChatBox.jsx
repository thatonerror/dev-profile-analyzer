import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';

export default function ChatBot({ githubData, leetcodeData, hackerrankData, resumeData, aiAnalysis }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: 'Hi! I can help you understand your profile data. Ask me about:\n• Your GitHub repositories and stats\n• LeetCode progress and ranking\n• Resume skills and experience\n• AI analysis insights\n• Career recommendations based on your profile'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    let apiUrl;

    try {
      // Prepare comprehensive profile data
      const profileData = {
        resumeData: resumeData ? {
          name: resumeData.name,
          email: resumeData.email,
          phone: resumeData.phone,
          skills: resumeData.skills,
          experience: resumeData.experience,
          education: resumeData.education,
          fullText: resumeData.fullText?.substring(0, 1000)
        } : null,
        
        githubData: githubData ? {
          username: githubData.username,
          name: githubData.name,
          publicRepos: githubData.publicRepos,
          totalStars: githubData.totalStars,
          followers: githubData.followers,
          topLanguages: githubData.topLanguages?.map(l => l.language).join(', '),
          topRepos: githubData.repos?.slice(0, 5).map(r => ({
            name: r.name,
            stars: r.stars,
            language: r.language
          }))
        } : null,
        
        leetcodeData: leetcodeData ? {
          username: leetcodeData.username,
          totalSolved: leetcodeData.totalSolved,
          easySolved: leetcodeData.easySolved,
          mediumSolved: leetcodeData.mediumSolved,
          hardSolved: leetcodeData.hardSolved,
          ranking: leetcodeData.ranking
        } : null,
        
        hackerrankData: hackerrankData ? {
          username: hackerrankData.username,
          challengesSolved: hackerrankData.challengesSolved,
          totalBadges: hackerrankData.totalBadges,
          totalStars: hackerrankData.totalStars,
          badges: hackerrankData.badges?.slice(0, 5)
        } : null,
        
        aiAnalysis: aiAnalysis ? {
          overallScore: aiAnalysis.overallScore,
          summary: aiAnalysis.summary,
          scoreBreakdown: aiAnalysis.scoreBreakdown,
          technicalStrengths: aiAnalysis.technicalStrengths,
          improvementAreas: aiAnalysis.improvementAreas,
          careerRecommendations: aiAnalysis.careerRecommendations
        } : null
      };

      // Construct API URL
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      
      if (cleanBaseUrl.endsWith('/api')) {
        apiUrl = `${cleanBaseUrl}/chat`;
      } else {
        apiUrl = `${cleanBaseUrl}/api/chat`;
      }
      
      console.log('📞 Calling chat API:', apiUrl);
      console.log('📦 Profile data summary:', {
        hasResume: !!profileData.resumeData,
        hasGithub: !!profileData.githubData,
        hasLeetcode: !!profileData.leetcodeData,
        hasHackerrank: !!profileData.hackerrankData,
        hasAiAnalysis: !!profileData.aiAnalysis
      });

      // Call backend API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          profileData,
          sessionId
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
        } catch (e) {
          // If response is not JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Response received');
      
      if (!data.success || !data.message) {
        throw new Error('Invalid response from server');
      }

      setMessages(prev => [...prev, { role: 'model', content: data.message }]);
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `Sorry, I encountered an error: ${error.message}\n\nTip: Make sure you've uploaded your resume and connected at least one profile (GitHub/LeetCode/HackerRank) for better responses.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Enhanced suggested questions based on available data
  const getSuggestedQuestions = () => {
    const questions = [];
    
    if (githubData) {
      questions.push("What are my most popular GitHub repositories?");
      questions.push("Which programming languages do I use most?");
    }
    
    if (leetcodeData) {
      questions.push("How can I improve my LeetCode ranking?");
      questions.push("What types of problems should I focus on?");
    }
    
    if (resumeData) {
      questions.push("What are my strongest skills based on my resume?");
      questions.push("How can I improve my resume?");
    }
    
    if (aiAnalysis) {
      questions.push("What does my overall profile score mean?");
      questions.push("What are my areas for improvement?");
      questions.push("What career path suits me best?");
    }
    
    if (questions.length === 0) {
      questions.push("How can I improve my developer profile?");
      questions.push("What should I focus on learning next?");
      questions.push("Tips for building a strong portfolio?");
    }
    
    return questions;
  };

  const askSuggestedQuestion = (question) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 animate-pulse"
        >
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-white">Profile Assistant</h3>
                <p className="text-xs text-purple-100">AI-Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedQuestions().slice(0, 3).map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => askSuggestedQuestion(question)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg border border-gray-700 transition"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  <span className="text-sm text-gray-300">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your profile..."
                disabled={isLoading}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl px-5 py-3 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by Google Gemini • Ask about skills, career advice, or profile analysis
            </p>
          </div>
        </div>
      )}
    </>
  );
}