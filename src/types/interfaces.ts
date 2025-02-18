export interface ConversationPublic {
    name: string;
    id: number;
    messages?: Array<MessagePublic>;
}

export interface MessageContextPayload {
    tabular_data?: string;
}

export interface MessageCreate {
    conversation_id?: number;
    content: string;
    message_context?: MessageContextPayload;
}

export interface MessagePublic {
    created_at?: string;
    updated_at?: string;
    content: string;
    role?: string;
    conversation_id?: number;
    id: number;
    message_context: MessageContextPayload;
}

export interface TableFilter {
    column: string;
    value: string;
}

export interface TableData {
    [key: string]: string | number;
} 