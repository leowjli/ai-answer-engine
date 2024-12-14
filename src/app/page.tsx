"use client";

import Image from "next/image";
import { useState } from "react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function Home() {
  const [openMenu, setOpenMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! How can I help you today?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = () => {
    setOpenMenu(!openMenu);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message to the conversation
    const userMessage = { role: "user" as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again.");
      }

      const data = await response.json();
      const aiReply = {
        role: "ai" as const,
        content: data.reply,
      }

      setMessages(prev => [...prev, aiReply]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* sidebar menu here */}
      <div className={`${openMenu ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-10 transition-transform duration-200 ease-in-out lg-block`}>
        <div className="flex flex-col w-64 h-screen text-gray p-2 overflow-y-auto">
          <button onClick={handleToggle} className="text-white p-4 text-2xl font-bold lg:hidden">
            Close Menu
          </button>
          <div className="space-y-3 flex-1"></div>
        </div>
      </div>
      {openMenu && (
        <div className="lg:hidden fixed inset-0 bg-black w-1/3 z-[5]" onClick={handleToggle}></div>
      )}
      {/* Main Chat Page */}
      <div className="flex flex-col flex-1 h-screen bg-gray-700 min-w-0">
        {/* Header */}
        <div className="w-full sticky top-0 bg-gray-800 border-b border-gray-700 p-4 z-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 sm:space-x-5">
              <button onClick={handleToggle} className="mr-1 p-2 rounded lg:hidden">
                <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.46447 20.5355C4.92893 22 7.28595 22 12 22C16.714 22 19.0711 22 20.5355 20.5355C22 19.0711 22 16.714 22 12C22 7.28595 22 4.92893 20.5355 3.46447C19.0711 2 16.714 2 12 2C7.28595 2 4.92893 2 3.46447 3.46447C2 4.92893 2 7.28595 2 12C2 16.714 2 19.0711 3.46447 20.5355ZM18.75 16C18.75 16.4142 18.4142 16.75 18 16.75H6C5.58579 16.75 5.25 16.4142 5.25 16C5.25 15.5858 5.58579 15.25 6 15.25H18C18.4142 15.25 18.75 15.5858 18.75 16ZM18 12.75C18.4142 12.75 18.75 12.4142 18.75 12C18.75 11.5858 18.4142 11.25 18 11.25H6C5.58579 11.25 5.25 11.5858 5.25 12C5.25 12.4142 5.58579 12.75 6 12.75H18ZM18.75 8C18.75 8.41421 18.4142 8.75 18 8.75H6C5.58579 8.75 5.25 8.41421 5.25 8C5.25 7.58579 5.58579 7.25 6 7.25H18C18.4142 7.25 18.75 7.58579 18.75 8Z" fill="#fff"/>
                </svg>
              </button>
              <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-xl">
                <Image src="/byte-bunny-logo.png" alt="Byte Bunny Logo" width={45} height={45} />
              </div>
              <h1 className="text-xl font-semibold text-white">ByteBunny</h1>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 pt-8">
          <div className="max-w-4xl mx-auto px-5">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-4 mb-4 ${msg.role === "ai"
                  ? "justify-start"
                  : "justify-end flex-row-reverse"
                  }`}
              >
                <Image className="w-[38px] h-[38px]"
                  src={msg.role === "ai"
                    ? "/byte-bunny-logo.png" : "/user.png"} 
                  alt={msg.role === "ai"
                    ? "Byte Bunny Logo" : "Default User logo"}
                  width={38} 
                  height={38} />
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.role === "ai"
                    ? "bg-gray-800 border border-gray-700 text-gray-100"
                    : "bg-cyan-600 text-white ml-auto"
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c.79 0 1.5-.71 1.5-1.5S8.79 9 8 9s-1.5.71-1.5 1.5S7.21 11 8 11zm8 0c.79 0 1.5-.71 1.5-1.5S16.79 9 16 9s-1.5.71-1.5 1.5.71 1.5 1.5 1.5zm-4 4c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4z" />
                  </svg>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-gray-800 border border-gray-700 text-gray-100">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="w-full bg-gray-800 border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <div className="flex gap-3 items-ends">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-cyan-600 text-white px-5 py-3 rounded-xl hover:bg-cyan-700 transition-all disabled:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : 
                  <svg width="20px" height="20px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <title>send-solid</title>
                  <g id="Layer_2" data-name="Layer 2">
                    <g id="invisible_box" data-name="invisible box">
                      <rect width="48" height="48" fill="none"/>
                    </g>
                    <g id="icons_Q2" data-name="icons Q2">
                      <path d="M44.9,23.2l-38-18L6,5A2,2,0,0,0,4,7L9.3,23H24a2.1,2.1,0,0,1,2,2,2,2,0,0,1-2,2H9.3L4,43a2,2,0,0,0,2,2l.9-.2,38-18A2,2,0,0,0,44.9,23.2Z" fill="#fff"/>
                    </g>
                  </g>
                </svg>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
