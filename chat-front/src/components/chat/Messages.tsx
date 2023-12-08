import Message, { IMessage } from "./Message";
import React, { useEffect,useState } from 'react';

interface Props {
  messages: IMessage[];
  username: string;
  socket: any;
 
}

const Messages = ({ messages, username,socket }: Props) => {
  const [suggestedResponses, setSuggestedResponses] = useState([]);
  const [loader, setLoader] = useState(true);
  
  const handleSuggestMessage = () => {
    let msg= messages[messages.length - 1].content;
    setLoader(true)
    socket.emit("suggest-message", {msg})
  }
  useEffect(() => {
    socket.on("suggest-message", (data) => {
      console.log(JSON.parse(data).possibilities)
      const parsedData = JSON.parse(data).possibilities;
      setSuggestedResponses(parsedData);
      setLoader(false);
    })
  }, [])



  return (
    <div className="mx-4 " >
      {messages.map((msg) => (
        <div key={msg.timeSent}>
          <Message message={msg} isMe={msg.username === username} socket={socket} />
        </div>
      ))}
      <button className="btn btn-outline" onClick={handleSuggestMessage}>GET</button>
      <h3>Suggested Responses:</h3>
        <ul>
          {suggestedResponses.map((response, index) => (
            <li key={index}>{response}</li>
          ))}
        </ul>
    </div>
  );
};

export default Messages;
