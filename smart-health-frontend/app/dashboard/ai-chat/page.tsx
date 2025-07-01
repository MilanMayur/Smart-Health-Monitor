//ai-chat/page.tsx
'use client';
import { JSX, useState } from 'react';

export default function AiChatPage() {
    const [input, setInput] = useState('');
    const [conversation, setConversation] = useState<{ sender: string, text: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setConversation(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3001/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message: input }),
            });

            const data = await res.json();
            const botMessage = { sender: 'bot', text: data.reply };
            setConversation(prev => [...prev, botMessage]);
        }
        catch {
            setConversation(prev => [...prev, { sender: 'bot', text: 'Error replying' }]);
        } 
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto h-[90vh] flex flex-col">
            <div className="text-3xl font-semibold text-center mb-4">
                Smart Health AI Assistant
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 bg-white dark:bg-zinc-900 
                p-4 border rounded-xl shadow">
                {conversation.map((msg, idx) => (
                    <div key={idx} className={`flex ${
                        msg.sender === 'user' 
                            ? 'justify-end' 
                            : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow ${
                            msg.sender === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white rounded-bl-none'
                        }`}>
                            <div className="text-xs font-semibold mb-1">
                                {msg.sender === 'user' ? 'You' : 'HealthBot'}
                            </div>
                            <div className="whitespace-pre-line">
                                {msg.sender === 'bot' ? formatMessage(msg.text) : <p>{msg.text}</p>}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                        HealthBot is typing...
                    </div>
                )}
            </div>

            <div className="mt-4 flex space-x-2">
                <textarea 
                    value={input}
                    rows={1}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    onInput={(e) => {
                        const el = e.currentTarget;
                        el.style.height = 'auto';
                        const maxHeight = 3 * 24; 
                        el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
                    }}
                    style={{
                        lineHeight: '24px', 
                        maxHeight: '72px',  
                    }}
                    placeholder="Ask anything health related..."
                    className="flex-1 p-3 rounded-xl border focus:outline-none 
                         dark:bg-zinc-800 dark:text-white resize-none overflow-hidden"
                />
                <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 
                        hover:to-blue-800 focus:ring-blue-400 cursor-pointer text-white px-5 
                        py-2 rounded-xl font-medium"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

function formatMessage(text: string) {
    if (!text) return 'Error';
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];

    const flushList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ol className="ml-5 list-decimal space-y-1" key={elements.length}>
                    {currentList.map((item, i) => (
                        <li key={i}>{item.replace(/^\d+[\.\)]\s+/, '')}</li>
                    ))}
                </ol>
            );
            currentList = [];
        }
    };

    for (const line of lines) {
        if (/^\d+[\.\)]\s+/.test(line)) {
            currentList.push(line);
        } 
        else {
            flushList();
            elements.push(
                <p className="mb-2" key={elements.length}>{line}</p>
            );
        }
    }
    flushList(); // flush remaining list
    return elements;
}