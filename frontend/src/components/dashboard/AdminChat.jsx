import React, { useState, useRef, useEffect } from 'react';
import { useAdminChat } from '../../hooks/useAdminChat';
import { FaUserCircle, FaPaperPlane, FaCircle } from 'react-icons/fa';

const AdminChat = () => {
    const { conversations, activeChat, setActiveChat, messages, sendMessage, isConnected } = useAdminChat();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (sendMessage(input)) {
            setInput('');
        }
    };

    return (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex h-[600px]">
            {/* Sidebar: Conversations List */}
            <div className="w-1/3 border-r overflow-y-auto">
                <div className="p-4 border-b bg-neutral-50 font-bold text-gray-700">
                    Active Conversations
                </div>
                {conversations.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 text-sm">No active chats</div>
                ) : (
                    conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => setActiveChat(conv)}
                            className={`p-4 border-b cursor-pointer transition-colors ${activeChat?.id === conv.id ? 'bg-purple-50 border-r-4 border-r-purple-600' : 'hover:bg-neutral-50'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-sm text-gray-800 truncate">{conv.customer?.email}</span>
                                {conv.unread_count > 0 && (
                                    <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {conv.unread_count}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                                {conv.last_message?.text || "No messages yet"}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Main: Chat Area */}
            <div className="flex-1 flex flex-col bg-neutral-50/30">
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <FaUserCircle size={32} className="text-purple-200" />
                                <div>
                                    <div className="font-bold text-sm">{activeChat.customer?.email}</div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                        <FaCircle size={6} className={isConnected ? "text-green-500" : "text-gray-300"} />
                                        {isConnected ? "Connected" : "Disconnected"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                                        msg.from === 'admin' 
                                            ? 'bg-purple-600 text-white rounded-tr-none' 
                                            : 'bg-white border text-gray-800 rounded-tl-none'
                                    }`}>
                                        <p>{msg.text}</p>
                                        <div className={`text-[9px] mt-1 font-bold uppercase ${msg.from === 'admin' ? 'text-purple-200' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a reply..."
                                className="flex-1 bg-neutral-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || !isConnected}
                                className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                <FaPaperPlane size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                            <FaUserCircle size={40} className="text-neutral-300" />
                        </div>
                        <h3 className="font-bold text-gray-600">Select a Conversation</h3>
                        <p className="text-sm">Choose a customer from the left to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
