import { useState } from "react";
import { useSelector } from "react-redux";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const user = useSelector((state) => state.auth.user);

    const toggleChat = () => setIsOpen(!isOpen);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        setIsTyping(true);

        try {
            const response = await fetch("https://api.dify.ai/v1/chat-messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer app-xTVCju6gHXKT4y5Cr3RdTYWp",
                },
                body: JSON.stringify({
                    query: input,
                    inputs: {},
                    user: user?.id || "guests"
                }),
            });

            const data = await response.json();
            setIsTyping(false);
            setMessages((prev) => [...prev, { text: data.answer, sender: "bot" }]);
        } catch (error) {
            setIsTyping(false);
            console.error("Error:", error);
        }
    };

    return (
        <div>
            {/* Floating Chat Icon */}
            <button
                className="fixed bottom-5 right-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
                onClick={toggleChat}
            >
                💬
            </button>

            {/* Chatbox */}
            {isOpen && (
                <div className="fixed bottom-16 right-5 w-80 bg-white shadow-xl rounded-lg flex flex-col transition-all min-h-96 duration-300 transform scale-100">
                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-t-lg">
                        <h3 className="text-lg font-semibold">Chatbot</h3>
                        <button
                            onClick={toggleChat}
                            className="text-2xl font-bold hover:text-gray-300"
                        >
                            ✖
                        </button>
                    </div>
                    <div className="flex-1 max-h-[400px] p-3 overflow-y-auto bg-gray-50 space-y-4 rounded-b-lg">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-3 my-2 rounded-xl max-w-[75%] ${
                                    msg.sender === "user"
                                        ? "bg-blue-500 text-white self-end ml-auto"
                                        : "bg-gray-200 text-black"
                                }`}
                            >
                                {/* Check if the message contains HTML */}
                                {/<[a-z][\s\S]*>/i.test(msg.text) ? (
                                    <div
                                        dangerouslySetInnerHTML={{ __html: msg.text }}
                                        className="bg-white p-2 rounded-lg border"
                                    />
                                ) : (
                                    msg.text
                                )}
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="bg-gray-200 text-black p-2 my-1 rounded-xl flex items-center space-x-2 animate-pulse">
                                <span className="dot">•</span>
                                <span className="dot">•</span>
                                <span className="dot">•</span>
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t flex">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Type a message..."
                        />
                        <button
                            onClick={sendMessage}
                            className="ml-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-lg hover:scale-105 transition-all"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
