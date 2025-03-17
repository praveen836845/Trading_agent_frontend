import  { useState } from 'react';
import { MessageSquare, Send, Wallet, LineChart, ArrowUpDown, Settings, Bell, Sparkles, Shield, Coins } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([
    {
      type: 'system',
      content: "Welcome to the Trading Portal! I'm here to help you with trading, checking balances, making transfers, or staking. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [showFeatures, setShowFeatures] = useState(true);
  const [loading, setLoading] = useState(false);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Trading",
      description: "Enterprise-grade security with advanced encryption"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Smart Execution",
      description: "AI-powered trading strategies and market analysis"
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Multi-Chain Support",
      description: "Trade across multiple blockchain networks seamlessly"
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setShowFeatures(false);
    setMessages((prev) => [...prev, { type: 'user', content: input }]);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { type: 'system', content: data.response },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'system', content: error.message || 'Failed to get a response from the server.' },
      ]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex">
      {/* Sidebar */}
      <div className="w-72 bg-[#0D1117] p-6 hidden md:flex flex-col border-r border-[#1C2333]">
        <div className="flex items-center space-x-3 mb-10">
          <div className="relative">
            <LineChart className="w-8 h-8 text-cyan-400 animate-pulse" />
            <div className="absolute -inset-1 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Trading Portal
          </h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          {['Wallet', 'Trade', 'Chat'].map((item, index) => (
            <button
              key={item}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-300 
                ${item === 'Chat' 
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400' 
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'}`}
            >
              {index === 0 && <Wallet className="w-5 h-5" />}
              {index === 1 && <ArrowUpDown className="w-5 h-5" />}
              {index === 2 && <MessageSquare className="w-5 h-5" />}
              <span className="font-medium">{item}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-[#1C2333]">
          <button className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0D1117] to-[#121A29]">
        {/* Header */}
        <header className="h-16 border-b border-[#1C2333] flex items-center justify-between px-6">
          <div className="text-gray-400 text-sm">Connected to Injective Chain</div>
          <button className="relative p-2 hover:bg-cyan-500/10 rounded-full transition-all duration-300">
            <Bell className="w-6 h-6 text-gray-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full"></span>
          </button>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showFeatures && (
            <div className="grid md:grid-cols-3 gap-6 mb-8 animate-fadeIn">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-gradient-to-br from-[#1C2333] to-[#1C2333]/50 border border-[#2A3441] hover:border-cyan-500/50 transition-all duration-300 group"
                >
                  <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-5 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-[#1C2333] text-gray-200'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <div className="border-t border-[#1C2333] p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about trading, balances, or staking..."
                className="flex-1 px-6 py-3 bg-[#1C2333] rounded-xl border border-[#2A3441] focus:outline-none focus:border-cyan-500/50 transition-all duration-300 text-gray-200 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={loading}
                className={`bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl px-6 py-3 flex items-center justify-center transition-all duration-300 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transform hover:scale-105 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;