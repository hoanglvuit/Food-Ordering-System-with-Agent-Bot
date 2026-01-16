import { useState, useRef, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const API_BASE = 'http://localhost:8000/api/v1';

// Unescape SSE content - restore newlines
const unescapeSSEContent = (content) => {
    return content.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
};

function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [threadId, setThreadId] = useState(null);
    const messagesEndRef = useRef(null);
    const { addToast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Add items to localStorage cart
    const addItemsToCart = (cartItems) => {
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

        for (const item of cartItems) {
            const existingItem = existingCart.find((i) => i.id === item.item_id);

            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                existingCart.push({
                    id: item.item_id,
                    title: item.title,
                    price: item.discount
                        ? item.price * (1 - item.discount / 100)
                        : item.price,
                    quantity: item.quantity,
                });
            }
        }

        localStorage.setItem('cart', JSON.stringify(existingCart));
        addToast(`Đã thêm ${cartItems.length} món vào giỏ hàng!`, 'success');
    };

    // Parse SSE stream properly
    const parseSSEStream = async (response, onChunk, onDone) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Append new chunk to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = buffer.split('\n');
            // Keep the last incomplete line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        onDone();
                        return;
                    }
                    if (data.startsWith('[ERROR]')) {
                        onChunk(unescapeSSEContent(data));
                        onDone();
                        return;
                    }
                    if (data.startsWith('[CART_DATA]')) {
                        // Parse cart data and add to localStorage
                        try {
                            const cartJson = data.slice(11); // Remove '[CART_DATA]' prefix
                            const cartItems = JSON.parse(cartJson);
                            addItemsToCart(cartItems);
                        } catch (e) {
                            console.error('Failed to parse cart data:', e);
                        }
                        continue; // Don't add this to message content
                    }
                    // Unescape newlines before adding to message
                    onChunk(unescapeSSEContent(data));
                }
            }
        }

        // Process any remaining data in buffer
        if (buffer.startsWith('data: ')) {
            const data = buffer.slice(6);
            if (data && data !== '[DONE]' && !data.startsWith('[CART_DATA]')) {
                onChunk(unescapeSSEContent(data));
            }
        }
        onDone();
    };

    // Initialize chat when opened for the first time
    const initializeChat = async () => {
        const newThreadId = `chat-${Date.now()}`;
        setThreadId(newThreadId);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: '',
                    thread_id: newThreadId,
                    is_first_message: true,
                }),
            });

            let botMessage = '';
            setMessages([{ role: 'bot', content: '' }]);

            await parseSSEStream(
                response,
                (chunk) => {
                    botMessage += chunk;
                    setMessages([{ role: 'bot', content: botMessage }]);
                },
                () => { }
            );
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            setMessages([{ role: 'bot', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (!threadId) {
            initializeChat();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleNewChat = () => {
        setMessages([]);
        setThreadId(null);
        initializeChat();
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading || !threadId) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    thread_id: threadId,
                    is_first_message: false,
                }),
            });

            // Add a placeholder for the bot message
            setMessages((prev) => [...prev, { role: 'bot', content: '' }]);
            let botMessage = '';

            await parseSSEStream(
                response,
                (chunk) => {
                    botMessage += chunk;
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { role: 'bot', content: botMessage };
                        return newMessages;
                    });
                },
                () => { }
            );
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'bot', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
                    aria-label="Open chat"
                >
                    <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[28rem] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-scale-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-xl">🍜</span>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Trợ lý đặt món</h3>
                                <p className="text-white/80 text-xs">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleNewChat}
                                className="text-white/80 hover:text-white p-1 transition-colors"
                                title="Cuộc trò chuyện mới"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <button
                                onClick={handleClose}
                                className="text-white/80 hover:text-white p-1 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${message.role === 'user'
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-md'
                                        : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && messages.length === 0 && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-2 rounded-2xl shadow-sm rounded-bl-md">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !inputValue.trim()}
                                className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatWidget;
