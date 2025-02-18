import { ConversationPublic, MessageCreate, MessagePublic } from '../types/interfaces';

const conversationStore = new Map<string, MessagePublic[]>();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createMessageWithTimestamp = (content: string, role: string, conversationId?: number, messageContext = {}): MessagePublic => {
    const now = new Date().toISOString();
    return {
        id: Math.floor(Math.random() * 1000),
        content,
        role,
        created_at: now,
        updated_at: now,
        conversation_id: conversationId,
        message_context: messageContext
    };
};

export const createMessage = async (message: MessageCreate): Promise<MessagePublic> => {
    await delay(1000);
    
    const conversationId = message.conversation_id?.toString() || '0';
    
    const existingMessages = conversationStore.get(conversationId) || [];
    
    const userMessage = createMessageWithTimestamp(
        message.content,
        'user',
        message.conversation_id,
        message.message_context
    );
    
    const assistantResponse = createMessageWithTimestamp(
        `Analyzing data: ${message.content}`,
        'assistant',
        message.conversation_id,
        message.message_context
    );

    const updatedMessages = [...existingMessages, userMessage, assistantResponse];
    conversationStore.set(conversationId, updatedMessages);

    return assistantResponse;
};

export const readConversation = async (conversationId: string): Promise<ConversationPublic> => {
    await delay(100);
    
    const messages = conversationStore.get(conversationId) || [];
    
    if (messages.length === 0) {
        const initialMessage = createMessageWithTimestamp(
            'Hello! I can help you analyze this data. What would you like to know?',
            'assistant',
            parseInt(conversationId)
        );
        messages.push(initialMessage);
        conversationStore.set(conversationId, messages);
    }

    return {
        id: parseInt(conversationId),
        name: `Data Analysis Conversation ${conversationId}`,
        messages
    };
}; 