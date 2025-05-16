import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Avatar } from "@mui/material"; // Import MUI Avatar component
import SmartToySharpIcon from "@mui/icons-material/SmartToySharp";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const user = useSelector((state) => state.auth.user);

    const chatEndRef = useRef(null); // Ref for scrolling

    useEffect(() => {
        const savedMessages = JSON.parse(localStorage.getItem("chatHistory"));
        if (savedMessages) {
            setMessages(savedMessages);
        } else {
            setMessages([{ text: "Hello! How can I assist you today?", sender: "bot" }]);
        }
    }, []);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

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
                    Authorization: "Bearer app-F89s3ydfXgpPzg743BsxeRIc",
                },
                body: JSON.stringify({
                    query: input,
                    inputs: {},
                    user: user?.id || "guests",
                }),
            });

            const data = await response.json();
            setIsTyping(false);
            const botMessage = { text: data.answer, sender: "bot" };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            setIsTyping(false);
            console.error("Error:", error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(messages));
    }, [messages]);

    return (
        <div>
            {/* Floating Chat Icon */}
            <button
                className="fixed bottom-5 right-5 bg-red-600 text-white p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 sm:p-3 sm:bottom-4 sm:right-4"
                onClick={toggleChat}
            >
                <SmartToySharpIcon fontSize="large" className="sm:text-base" />
            </button>

            {/* Chatbox */}
            {isOpen && (
                <div className="fixed bottom-16 right-5 w-[90%] max-w-[500px] bg-white shadow-lg min-h-[400px] rounded-xl flex flex-col transition-all transform duration-300 ease-in-out sm:bottom-14 sm:right-3 sm:min-h-[300px]">
                    {/* Chat Header */}
                    <div className="flex justify-between items-center bg-red-600 text-white p-4 rounded-t-xl sm:p-3">
                        <h3 className="text-lg font-semibold sm:text-base">Chatbot</h3>
                        <button className="text-white font-bold" onClick={toggleChat}>
                            <span className="text-2xl sm:text-xl">&times;</span>
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 max-h-[400px] min-h-[400px] p-4 overflow-y-auto bg-gray-50 space-y-3 sm:max-h-[300px] sm:min-h-[500px] sm:p-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex items-start space-x-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.sender === "bot" && (
                                    <Avatar sx={{ width: 26, height: 26 }} className="mr-1">
                                        <SmartToySharpIcon fontSize="small" />
                                    </Avatar>
                                )}

                                <div
                                    className={`p-3 rounded-lg max-w-[80%] transition-all duration-300 ease-in-out sm:text-sm sm:p-2 ${
                                        msg.sender === "user"
                                            ? "bg-red-600 text-white self-end ml-auto"
                                            : "bg-gray-200 text-gray-800"
                                    }`}
                                >
                                    {/<[a-z][\s\S]*>/i.test(msg.text) ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: `<div class="p-4 bg-white rounded-lg border border-black shadow-lg">${msg.text}</div>`,
                                            }}
                                        />
                                    ) : (
                                        <div className="whitespace-pre-wrap break-words">{msg.text}</div>  // Added break-words for proper wrapping
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div
                                className={`flex items-start space-x-3 ${"bot" === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {/* Avatar */}
                                <Avatar sx={{ width: 26, height: 26 }} className="mr-1">
                                    <SmartToySharpIcon fontSize="small" />
                                </Avatar>

                                {/* Typing Indicator */}
                                <div
                                    className={`p-3 rounded-lg max-w-[80%] transition-all duration-300 ease-in-out sm:text-sm sm:p-2 bg-gray-200 text-gray-800`}
                                >
                                    <span className="dot-animation">•</span>
                                    <span className="dot-animation">•</span>
                                    <span className="dot-animation">•</span>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 border-t flex items-center sm:p-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}

                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 sm:p-4 sm:text-base resize-none"
                            placeholder="Type a message..."
                            rows={2} // You can adjust the number of rows as needed
                        />
                        <button
                            onClick={sendMessage}
                            className="ml-3 bg-red-600 text-white p-3 rounded-full hover:bg-red-500 transition-all sm:p-2"
                        >
                            <span className="text-lg font-semibold sm:text-sm">Send</span>
                        </button>
                    </div>



                </div>
            )}
        </div>
    );
};

export default Chatbot;
