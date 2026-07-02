const { useState, useEffect, useRef } = React;

const MODELS = [
    { id: "google/gemini-2.5-pro:free", name: "Gemini 2.5 Pro (Free)" },
    { id: "google/gemma-2-9b-it:free", name: "Gemma 2 9B (Free)" },
    { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B (Free)" },
    { id: "openai/gpt-4o", name: "GPT-4o (Premium)" },
    { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku (Premium)" }
];

const SUGGESTED_CHIPS = [
    "Tell me about yourself",
    "Show your projects",
    "What technologies do you use?",
    "How can I contact you?",
    "Download your resume"
];

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I\'m Ritupurna\'s AI assistant. Ask me anything about her skills, projects, or experience!', timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState(MODELS[0].id);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize highlight.js for markdown
    useEffect(() => {
        marked.setOptions({
            highlight: function(code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            },
            langPrefix: 'hljs language-',
            breaks: true,
            gfm: true
        });
    }, []);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async (text = input) => {
        const trimmedText = text.trim();
        if (!trimmedText) return;

        const newUserMsg = { role: 'user', content: trimmedText, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
        const newMessages = [...messages, newUserMsg];
        
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Only send actual conversation history to API (no timestamps, just role/content)
            const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

            const response = await fetch('https://newportfolio-backend-26pw.onrender.com/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages, model })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
            } else {
                throw new Error(data.message || 'Error communicating with AI');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Oops! Something went wrong: ${error.message}. Please try again.`, 
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
                isError: true,
                originalText: trimmedText
            }]);
        } finally {
            setIsLoading(false);
            if (inputRef.current) inputRef.current.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        if (window.confirm("Are you sure you want to clear the conversation?")) {
            setMessages([{ role: 'assistant', content: 'Conversation cleared! How can I help you today?', timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
        }
    };

    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
            {isOpen && (
                <div className="chat-window glass">
                    <div className="chat-header">
                        <div className="header-info">
                            <div className="bot-avatar">🤖</div>
                            <div>
                                <h3>AI Assistant</h3>
                                <span className="status">Online</span>
                            </div>
                        </div>
                        <div className="header-controls">
                            <select 
                                className="model-select" 
                                value={model} 
                                onChange={(e) => setModel(e.target.value)}
                                title="Select AI Model"
                            >
                                {MODELS.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <button className="icon-btn" onClick={clearChat} title="Clear Chat">🗑️</button>
                            <button className="icon-btn close-btn" onClick={() => setIsOpen(false)} title="Close Chat">✖</button>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message-wrapper ${msg.role}`}>
                                <div className="message-content">
                                    <div 
                                        className={`message-bubble ${msg.isError ? 'error' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: msg.role === 'assistant' ? marked.parse(msg.content) : msg.content }}
                                    />
                                    <div className="message-meta">
                                        <span className="timestamp">{msg.timestamp}</span>
                                        {msg.role === 'assistant' && !msg.isError && (
                                            <button className="copy-btn" onClick={() => copyText(msg.content)} title="Copy Response">📋</button>
                                        )}
                                        {msg.role === 'assistant' && msg.isError && msg.originalText && (
                                            <button className="copy-btn" style={{color: 'var(--accent-start)'}} onClick={() => handleSend(msg.originalText)} title="Retry Message">🔄 Retry</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-wrapper assistant">
                                <div className="message-content">
                                    <div className="message-bubble typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length === 1 && (
                        <div className="suggested-chips">
                            {SUGGESTED_CHIPS.map((chip, idx) => (
                                <button key={idx} className="chip-btn" onClick={() => handleSend(chip)}>
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="chat-input-area">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            rows="1"
                            disabled={isLoading}
                        />
                        <button 
                            className="send-btn" 
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
            
            <button 
                className={`chat-fab ${isOpen ? 'hidden' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <span className="fab-icon">💬</span>
            </button>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('chatbot-root'));
root.render(<Chatbot />);
