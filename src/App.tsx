import { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  LineChart,
  ArrowUpDown,
  Shield,
  Sparkles,
  Coins,
} from "lucide-react";
import Message from "./component/Message";
import { ChainId } from "@injectivelabs/ts-types";

function App({ children }) {
  const [messages, setMessages] = useState([
    {
      type: "system",
      content:
        "Welcome to the Trading Portal! I'm here to help you with trading, checking balances, making transfers, or staking. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [showFeatures, setShowFeatures] = useState(true);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [injectiveAddress, setInjectiveAddress] = useState("");
  const [agentAddress, setAgentAddress] = useState("");

  // Function to check and get Keplr instance
  const getKeplr = () => {
    if (!window.keplr) {
      throw new Error("Keplr extension not installed");
    }
    return window.keplr;
  };

  // Function to enable Keplr and fetch addresses
  const connectKeplr = async () => {
    try {
      const keplr = getKeplr();
      const chainId = ChainId.Testnet;
      await keplr.enable(chainId);
      const [account] = await keplr.getOfflineSigner(chainId).getAccounts();
      setInjectiveAddress(account.address);
      setConnected(true);
      localStorage.setItem("walletAddress", account.address); // Store wallet address in local storage
      console.log("Connected address:", account.address);

      // Call switch_agent API with wallet address as name
      await handleAgentApiCall(account.address);

      // Fetch and display the agent address
      await fetchAgentAddress(account.address);
    } catch (error) {
      console.error("Failed to connect to Keplr:", error);
      setConnected(false);
    }
  };

  // Function to disconnect Keplr
  const disconnectKeplr = () => {
    setConnected(false);
    setInjectiveAddress("");
    setAgentAddress("");
    localStorage.removeItem("walletAddress"); // Remove wallet address from local storage
    console.log("Disconnected from Keplr");
  };

  // Function to handle switch_agent and create_agent API calls
  const handleAgentApiCall = async (walletAddress: string) => {
    try {
      const response = await fetch("http://192.168.1.11:5000/switch_agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: walletAddress }),
      });

      const data = await response.json();
      console.log("Response from switch_agent API:", data);

      if (data.error) {
        // If agent not found, call create_agent API
        if (data.error.includes("not found")) {
          const response2 = await fetch(
            "http://192.168.1.11:5000/create_agent",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: walletAddress }),
            }
          );

          const data2 = await response2.json();
          console.log("Response from create_agent API:", data2);
        }
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  // Function to fetch and display the agent address
  const fetchAgentAddress = async (walletAddress: string) => {
    try {
      const response = await fetch("http://192.168.1.11:5000/list_agents");
      const data = await response.json();
      console.log("Response from list_agents API:", data);

      // Search for the agent with the matching wallet address
      const agents = data.agents;
      for (const key in agents) {
        const value = agents[key];
        console.log('Key:', key, 'Value:', value);
        console.log(typeof value, typeof walletAddress);
        if (key === walletAddress) {
          console.log("wallet address", value);
          setAgentAddress(agents[key].address);
          break;
        }
      }
    } catch (error) {
      console.error("Error fetching agent address:", error);
    }
  };

  // On component mount, check if wallet address exists in local storage
  useEffect(() => {
    const storedWalletAddress = localStorage.getItem("walletAddress");
    if (storedWalletAddress) {
      setInjectiveAddress(storedWalletAddress);
      setConnected(true);
      handleAgentApiCall(storedWalletAddress); // Call API with stored wallet address
      fetchAgentAddress(storedWalletAddress); // Fetch agent address
    }
  }, []);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Trading",
      description: "Enterprise-grade security with advanced encryption",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Smart Execution",
      description: "AI-powered trading strategies and market analysis",
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Multi-Chain Support",
      description: "Trade across multiple blockchain networks seamlessly",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setShowFeatures(false);
    setMessages((prev) => [...prev, { type: "user", content: input }]);
    setLoading(true);

    try {
      const response = await fetch("http://192.168.1.11:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API request failed");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { type: "system", content: data.response },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content: error.message || "Failed to get a response from the server.",
        },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex">
      {/* Sidebar */}
      <div className="w-72 bg-[#0D1117] p-6 hidden md:flex flex-col border-r border-[#1C2333]">
        <button
          className={`mb-5 p-4 font-bold rounded transition-all duration-300 ${
            connected
              ? "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          } text-white shadow-lg hover:shadow-xl transform hover:scale-105`}
          onClick={connected ? disconnectKeplr : connectKeplr}
        >
          {connected ? `Disconnect` : "Connect Keplr"}
        </button>
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
          {children}

          {["Trade", "Chat"].map((item, index) => (
            <button
              key={item}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-300 
              ${
                item === "Chat"
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400"
                  : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
              }`}
            >
              {index === 0 && <ArrowUpDown className="w-5 h-5" />}
              {index === 1 && <MessageSquare className="w-5 h-5" />}
              <span className="font-medium">{item}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0D1117] to-[#121A29]">
        {/* Header */}
        <header className="h-16 border-b border-[#1C2333] flex items-center justify-between px-6">
          <div className="text-gray-400 text-sm">
            {connected
              ? `Connected to Injective Chain: ${injectiveAddress.slice(0, 10)}...`
              : "Not connected"}
          </div>
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
                  <h3 className="text-white font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
          <Message messages={messages} />
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
                  loading ? "opacity-50 cursor-not-allowed" : ""
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

        {/* Agent Address Display */}
        {connected && agentAddress && (
          <div className="border-t border-[#1C2333] p-6">
            <div className="max-w-4xl mx-auto">
              <textarea
                className="w-full px-6 py-3 bg-[#1C2333] rounded-xl border border-[#2A3441] focus:outline-none focus:border-cyan-500/50 transition-all duration-300 text-gray-200 placeholder-gray-500"
                rows={4}
                value={`AI Agent Address: ${agentAddress}`}
                readOnly
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;