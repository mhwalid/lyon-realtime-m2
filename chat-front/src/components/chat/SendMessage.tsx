"use client";
import { useState } from "react";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  username: string;
}

const SendMessage = ({ socket, username }: Props) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("chat-message", {
      username,
      content: text,
      timeSent: new Date().toISOString(),
    });

    setText("");
  };
  
  return (
    <div className="bg-gray-200  bottom-0  py-10 shadow-lg">
    <form onSubmit={handleSubmit} className="px-2 containerWrap center flex">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="input focus:outline-none bg-gray-100 rounded-r-none w-full" 
      />
      <button type="submit" className="w-auto bg-gray-500 text-white rounded-r-lg px-5 text-sm">Send</button>
    </form>
    </div>
  );
};

export default SendMessage;
