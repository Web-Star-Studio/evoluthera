
export interface Conversation {
  id: string;
  psychologist_id: string;
  patient_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_content: string;
  encrypted_content?: Uint8Array;
  message_type: 'text' | 'file' | 'image';
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  edited_at?: string;
}

export interface ChatSettings {
  id: string;
  psychologist_id: string;
  chat_enabled: boolean;
  daily_message_limit: number;
  max_message_length: number;
  auto_response_enabled: boolean;
  auto_response_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyMessageUsage {
  id: string;
  patient_id: string;
  psychologist_id: string;
  usage_date: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}
