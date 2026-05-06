'use client'; 

import { useState, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("Selected file:", file.name);
    }
    e.target.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed "${selectedFile.name}". Once we connect the FastAPI backend, I'll provide real RAG answers!`,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screenbg-white text-zinc-100 p-4 md:p-12">
      <div className="max-w-3xl mx-auto flex flex-col h-[85vh] border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden">
        
        <header className="p-6 border-b border-zinc-800 bg-black flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold font-mono text-white">PDF RAG Summarizer</h1>
            <p className="text-xs text-white font-serif tracking-widest mt-1">Ask the RAG about anything from your PDF</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center">
              {!selectedFile ? (
                <div className="text-center text-zinc-600 italic animate-pulse">
                  Attach your PDF here and Start.
                </div>
              ) : (
                <div className="bg-zinc-900 border border-blue-500/30 p-8 rounded-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-20 bg-blue-600/20 rounded-md border-2 border-blue-500 flex items-center justify-center mb-4">
                    <span className="text-xs font-bold text-blue-400">PDF</span>
                  </div>
                  <h3 className="text-zinc-200 font-medium mb-1">{selectedFile.name}</h3>
                  <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="mt-6 text-xs text-red-400 hover:text-red-300 transition-colors underline"
                  >
                    Remove and choose another
                  </button>
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && <div className="text-zinc-500 text-xs animate-pulse">Agent is thinking...</div>}
        </div>

        <form onSubmit={handleSendMessage} className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex items-center gap-3">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf" 
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-zinc-800 rounded-md transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${selectedFile ? 'text-blue-400' : 'text-zinc-400'} group-hover:text-blue-400`}>
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedFile ? `Ask about ${selectedFile.name}...` : "Upload a PDF to start..."}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          
          <button 
            disabled={isLoading || !selectedFile}
            className={`px-5 py-2 rounded-md text-sm font-bold transition-all ${
              !selectedFile || isLoading 
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
              : 'bg-zinc-100 text-zinc-950 hover:bg-blue-400'
            }`}
          >
            SEND
          </button>
        </form>
      </div>
    </main>
  );
}