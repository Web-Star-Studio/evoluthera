
export interface AnamnesisField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiple_choice' | 'scale' | 'date' | 'number' | 'observation';
  label: string;
  required?: boolean;
  order: number;
  options?: string[];
  multiple?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface AnamnesisSection {
  id: string;
  title: string;
  order: number;
  fields: AnamnesisField[];
}

export interface AnamnesisTemplate {
  id: string;
  psychologist_id: string;
  name: string;
  description?: string;
  sections: AnamnesisSection[];
  is_default: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnamnesisApplication {
  id: string;
  template_id: string;
  patient_id: string;
  psychologist_id: string;
  responses: Record<string, any>;
  psychologist_notes: Record<string, string>;
  status: 'sent' | 'in_progress' | 'completed' | 'locked';
  sent_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  locked_at?: string | null;
  created_at: string;
  updated_at: string;
  template?: {
    name: string;
    description?: string;
  };
  patient?: {
    name: string;
    email: string;
  };
}

export interface DefaultTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  sections: AnamnesisSection[];
  created_at: string;
}

export interface ResponseHistory {
  id: string;
  application_id: string;
  responses: Record<string, any>;
  version_number: number;
  created_at: string;
  created_by: string;
}
