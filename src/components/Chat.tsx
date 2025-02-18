import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { MessagePublic, TableData } from '../types/interfaces';
import { createMessage } from '../services/api';

interface ChatProps {
    conversationId: number;
    messages: MessagePublic[];
    onNewMessage: (message: MessagePublic) => void;
    tableData: TableData[];
    selectedRowData?: TableData;
}

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #1a1a1a;
    overflow: hidden;
`;

const MessagesContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    overflow-y: auto;
    flex: 1;
`;

const MessageWrapper = styled.div<{ isUser: boolean }>`
    display: flex;
    flex-direction: column;
    align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
    align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
    gap: 4px;
    width: fit-content;
    max-width: 70%;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
    padding: 12px 16px;
    border-radius: 12px;
    background-color: ${props => props.isUser ? '#007AFF' : '#2a2a2a'};
    color: #ffffff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    position: relative;
    width: fit-content;
    max-width: 100%;
    word-break: break-word;
`;

const MessageTime = styled.span<{ isUser: boolean }>`
    font-size: 12px;
    color: #666;
    text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const InputContainer = styled.div`
    padding: 24px;
    background-color: #1a1a1a;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: 12px;
`;

const Input = styled.input`
    flex: 1;
    padding: 12px;
    background-color: #2a2a2a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-size: 14px;
    color: #ffffff;
    &::placeholder {
        color: #666666;
    }
    &:focus {
        outline: none;
        border-color: #007AFF;
    }
`;

const SendButton = styled.button`
    padding: 12px 24px;
    background-color: #007AFF;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    &:disabled {
        background-color: #2a2a2a;
        color: #666666;
    }
`;

const CopyButton = styled.button`
    position: absolute;
    top: 4px;
    right: 4px;
    padding: 4px;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    color: #ffffff;
    ${MessageBubble}:hover & {
        opacity: 0.7;
    }
    &:hover {
        opacity: 1;
    }
`;

const Chat: React.FC<ChatProps> = ({ conversationId, messages, onNewMessage, tableData, selectedRowData }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedRowData) {
            setInput(JSON.stringify(selectedRowData, null, 2));
        }
    }, [selectedRowData]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        try {
            const userMessage: MessagePublic = {
                id: Date.now(),
                content: input,
                role: 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                conversation_id: conversationId,
                message_context: {
                    tabular_data: JSON.stringify(tableData)
                }
            };
            onNewMessage(userMessage);

            const response = await createMessage({
                conversation_id: conversationId,
                content: input,
                message_context: {
                    tabular_data: JSON.stringify(tableData)
                }
            });

            onNewMessage(response);
            setInput('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessages = () => {
        return messages.map((message, index) => {
            const isUser = message.role ? message.role.toLowerCase() === 'user' : false;
            const time = message.created_at ? formatTime(message.created_at) : '';
            
            return (
                <MessageWrapper key={index} isUser={isUser}>
                    <MessageBubble isUser={isUser}>
                        {message.content}
                        <CopyButton onClick={() => handleCopy(message.content)}>
                            📋
                        </CopyButton>
                    </MessageBubble>
                    <MessageTime isUser={isUser}>{time}</MessageTime>
                </MessageWrapper>
            );
        });
    };

    return (
        <ChatContainer>
            <MessagesContainer>
                {renderMessages()}
                <div ref={messagesEndRef} />
            </MessagesContainer>
            <InputContainer>
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <SendButton onClick={handleSend} disabled={isLoading || !input.trim()}>
                    {isLoading ? 'Sending...' : 'Send'}
                </SendButton>
            </InputContainer>
        </ChatContainer>
    );
};

export default Chat; 