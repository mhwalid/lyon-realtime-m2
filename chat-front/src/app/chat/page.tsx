"use client";
import Messages from "@/components/chat/Messages";
import SendMessage from "@/components/chat/SendMessage";
import Username from "@/components/chat/Username";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [messageSuggestions, setmessageSuggestions] = useState([]);
  const [suggestedResponses, setSuggestedResponses] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.on("messages-old", (data) => {
      setMessages((msg) => [msg, ...data] as any);
    });

    socket.on("chat-message", (data) => {
      setMessages((msg) => [...msg, data] as any);
    });


  }, []);

  



 

  return (
    <div className="container bg-base-100 shadow-2xl"  style={centeredDivStyle}>
    <div className=" container-center "  >
      <Username socket={socket} setUsername={setUsername} />
      <Messages  messages={messages} username={username}  socket={socket}/>
      <SendMessage socket={socket} username={username} />
    </div>
    
    </div>
  );
};



const centeredDivStyle: React.CSSProperties = {
  marginLeft: '12%',
  borderRadius: '40px',
  width:'80%',
};



export default Chat;
