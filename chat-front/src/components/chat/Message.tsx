import React, { useEffect,useState } from 'react';
import { Socket } from "dgram";
export interface IMessage {
  username: string;
  content: string;
  timeSent: string;
}

interface Props {
  message: IMessage;
  isMe: boolean;
  socket: Socket;
}

const Message = ({ message, isMe ,socket }: Props) => {
  const [verificationData, setVerificationData] = useState("")
  const [infoStatus, setInfoStatus] = useState<"true" | "false" | "unverifiable">()
  const languageOptions = ['English', 'French','Arabic', 'Spanish', 'German', 'Italian', 'Japanese', 'Chinese', 'Russian'];
  const handleTranslate = (msg: any, language: any) => {
    socket.emit("translate-message", {msg, language})
  }
  const handleVerifyInformation = () => {
    socket.emit("verify-information", {message})
  }

  useEffect(() => {
    socket.on("verify-data", (data) => {
      if(data.message.timeSent === message.timeSent){
        setVerificationData(data.response)
        if(data.response.includes("This information can't be verified")){
          setInfoStatus("unverifiable")
        }
        if(data.response.includes("True")){
          setInfoStatus("true")
        }
        if(data.response.includes("False")){
          setInfoStatus("false")
        }
      }
    })
  }, [])
  return (
    <div className={`chat ${isMe ? "chat-end" : "chat-start"}`} >
      
     <div className="chat-header">
        {isMe ? "me " : message.username }
        <time className="text-xs opacity-50">{message.timeSent}</time>
      </div>
     <select id="languages"
        onChange={(e) => handleTranslate(message, e.target.value)}
         className={`select select-info w-full max-w-xs ${isMe ? "hidden" : ""}`}>
     {languageOptions.map((language, index) => (
        <option  disabled={index === 0} selected={index === 0}>
          {language}
        </option>
      ))}
      </select>
      <button className="btn btn-outline" onClick={handleVerifyInformation}>check</button>
      {verificationData && 
      <div className={`chat flex ${isMe ? "self-end" : "self-start"}`}>
        {infoStatus === "true" && <div className="chat-bubble chat-bubble-success">{verificationData}</div>}
        {infoStatus === "false" && <div className="chat-bubble chat-bubble-secondary">{verificationData}</div>}
        {infoStatus === "unverifiable" && <div className="chat-bubble chat-bubble-warning">{verificationData}</div>}
      </div>
      } 

      <div className="chat chat-start" >
        <div className="chat chat-start">
          <div className="chat-image avatar online">
          {!isMe && (
            <div className="w-10 rounded-full">
              <img alt="Tailwind CSS chat bubble component" src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
            </div>
          )}
          </div>
          <div className="chat-bubble">{message.content}</div>
        </div>
      </div>
    </div>
  );
};

const centeredDivStyle: React.CSSProperties = {
  position: 'relative',
  margin: '0 auto',
  width: '100%',
};

export default Message;
