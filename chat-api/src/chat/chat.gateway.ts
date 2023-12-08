import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import OpenAI from 'openai';

interface IMessage {
  username: string;
  content: string;
  timeSent: string;
}


const  openai = new OpenAI({apiKey: ''});

 async function translateMessage(message: IMessage,targetLanguage: string): Promise<IMessage> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `Translate in ${targetLanguage}.` },
        { role: 'user', content: `message to translate: ${message.content}` },
      ],
    });
  
    message.content = response.choices[0].message.content.trim()
    return message;
    
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Fallback to the original message on error
    return message;
  }
}

async function verifyInformation(message: IMessage) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: `You possess vast knowledge, and I am entrusting you with information. Please determine the accuracy of this information. Respond with 'true' if it is correct, provide the truth if it is false, or reply with "This information can't be verified" if its accuracy cannot be confirmed.` },
        { role: 'user', content: `Information: ${message.content}` },
      ],
      model: 'gpt-3.5-turbo',
    });

    return  chatCompletion.choices[0]?.message?.content || "No response from the model.";

  } catch (error) {
    console.error('Error in verifying information:', error);
    throw error; // Handle the error as needed
  }
}

async function SuggestResponse(msg: string){
  console.log(msg)
  const chatCompletion = await openai.chat.completions.create({
    
    messages: [
      { role: 'system', content: `I will give you a conversation which is a message,
        can you suggest me at list 3 possible answers,
        only answer with the possibilities and convert them into json format with "possibilities" as attribute`},
      { role: 'user', content: `the message: ${msg}`}
    ],
    model: 'gpt-3.5-turbo',
  });
  return chatCompletion.choices[0].message.content
}



@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Socket;
  clients: { client: Socket; username?: string }[] = [];
  chatMessages: IMessage[] = [];


  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    this.server.emit('message', payload);
    console.log({ payload });
    return 'Hello world!';
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(client: any, payload: IMessage): void {
    const c = this.clients.find((c) => c.client.id === client.id);
    if (c.username) {
      this.server.emit('chat-message', {
        ...payload,
        username: c.username,
      });
      this.chatMessages.push({
        ...payload,
        username: c.username,
      });
    }
  }

  @SubscribeMessage('translate-message')
  async handleTranslate(client: any, message: any, language: any){
    const currentMessage = this.chatMessages.find(({timeSent}) => timeSent === message.msg.timeSent)
    const currentMessageIndex =  this.chatMessages.findIndex((msg: any) => msg === currentMessage)
    if(currentMessageIndex != -1){
      const messageTranslated :IMessage  = await translateMessage( currentMessage, message.language)
      this.chatMessages.splice(currentMessageIndex, 1, messageTranslated)
      this.server.emit('messages-old', this.chatMessages)
    }
  }

  @SubscribeMessage('verify-information')
  async handleVerifyInformation(client: any, payload: any){
    console.log(payload)
    const response = await verifyInformation(payload.message)
    this.server.emit('verify-data', {response, message: payload.message	})
  }

  @SubscribeMessage('suggest-message')
  async handleSuggestResponse(client: any, payload: any){
    console.log(payload.msg);
    const response = await SuggestResponse(payload.msg)
    console.log(response)
    client.emit('suggest-message', response)
  }

  @SubscribeMessage('username-set')
  handleUsernameSet(client: any, payload: any): void {
    const c = this.clients.find((c) => c.client.id === client.id);
    if (c) {
      c.username = payload.username;
    }
  }

  handleConnection(client: Socket) {
    console.log('client connected ', client.id);
    this.clients.push({
      client,
    });
    client.emit('messages-old', this.chatMessages);
  }

  handleDisconnect(client: any) {
    console.log('client disconnected ', client.id);
    this.clients = this.clients.filter((c) => c.client.id !== client.id);
  }
}
