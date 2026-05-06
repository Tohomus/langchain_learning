'use client';

import { useState, useRef } from 'react';
import { apiService } from "@/lib/api";

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
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsFileUploaded(false); // Reset upload status for new file
      console.log("Selected file:", file.name);
    }
    e.target.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedFile) return;

    // 1. Add User Message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // 2. Upload file if not already uploaded in this session
      if (!isFileUploaded) {
        await apiService.uploadFile(selectedFile);
        setIsFileUploaded(true);
      }

      // 3. Call the FastAPI /chat endpoint
      const data = await apiService.sendMessage(currentInput);

      // 4. Add Assistant Message to UI
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error("Connection Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Error: Could not connect to the Python backend. Make sure api.py is running!",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-100 p-4 md:p-12">
      <div className="max-w-3xl mx-auto flex flex-col h-[85vh] border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden shadow-2xl">
        
        <header className="p-6 border-b border-zinc-800 bg-black flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold font-mono text-white tracking-tighter">AGENTIC RAG v1.0</h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] mt-1">Status: {isLoading ? 'Processing' : 'Standby'}</p>
          </div>
          {selectedFile && (
             <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-blue-400 uppercase">{selectedFile.name}</span>
             </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center">
              {!selectedFile ? (
                <div className="text-center space-y-4">
                  <div className="text-zinc-500 text-sm font-mono animate-pulse">
                    Upload your pdf
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-20 bg-zinc-800 rounded-md border border-zinc-700 flex items-center justify-center mb-4 shadow-xl">
                    <span className="text-[10px] font-bold text-zinc-500 font-mono">PDF</span>
                  </div>
                  <h3 className="text-zinc-200 font-mono text-sm mb-1">{selectedFile.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  <button 
                    onClick={() => {setSelectedFile(null); setIsFileUploaded(false);}}
                    className="mt-6 text-[10px] font-mono text-zinc-500 hover:text-red-400 transition-colors tracking-widest uppercase border-b border-zinc-800"
                  >
                    [ DISCARD_FILE ]
                  </button>
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 text-sm font-mono ${
                msg.role === 'user' 
                ? 'bg-zinc-100 text-black rounded-sm' 
                : 'bg-zinc-800/50 text-zinc-200 border border-zinc-800 rounded-sm'
              }`}>
                <div className="text-[10px] opacity-40 mb-1 uppercase tracking-tighter">
                    {msg.role === 'user' ? 'Local_User' : 'Agent_Response'}
                </div>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 items-center">
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-blue-500 animate-bounce" />
                    <div className="w-1 h-1 bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">Running Inference...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-6 bg-black border-t border-zinc-800 flex items-center gap-3">
          
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
            className="p-2 hover:bg-zinc-800 rounded-md transition-all group border border-transparent hover:border-zinc-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`${selectedFile ? 'text-blue-400' : 'text-zinc-500'} group-hover:text-blue-400 transition-colors`}>
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedFile ? `QUERY: ${selectedFile.name.toUpperCase()}` : "AWAITING_PDF_INPUT..."}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-xs font-mono focus:outline-none focus:border-zinc-600 transition-all placeholder:text-zinc-700 text-zinc-300"
          />
          
          <button 
            disabled={isLoading || !selectedFile}
            className={`px-6 py-3 rounded-sm text-[10px] font-bold tracking-[0.2em] transition-all border ${
              !selectedFile || isLoading 
              ? 'bg-transparent border-zinc-800 text-zinc-700 cursor-not-allowed' 
              : 'bg-zinc-100 text-black border-white hover:bg-blue-400 hover:border-blue-400'
            }`}
          >
            EXECUTE
          </button>
        </form>
      </div>
    </main>
  );
}