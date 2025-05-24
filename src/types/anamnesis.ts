
export interface AnamnesisField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'scale';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

export interface AnamnesisSection {
  id: string;
  title: string;
  description?: string;
  fields: AnamnesisField[];
}

export interface AnamnesisTemplate {
  id: string;
  name: string;
  description?: string;
  sections: AnamnesisSection[];
  psychologist_id: string;
  is_default: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Anamnesis {
  id: string;
  status: string;
  created_at: string;
  sent_at: string;
  completed_at: string;
  locked_at: string;
  patient: {
    name: string;
    email: string;
  };
  template: {
    name: string;
  };
}

export interface AnamnesisApplication {
  id: string;
  status: 'sent' | 'in_progress' | 'completed' | 'locked';
  created_at: string;
  sent_at: string;
  completed_at: string;
  locked_at: string;
  started_at: string;
  patient: {
    name: string;
    email: string;
  };
  template: {
    name: string;
    description: string;
  };
  responses: Record<string, any>;
  psychologist_notes: Record<string, string>;
}

// Helper functions for type conversion
export const parseJsonField = <T>(field: any): T => {
  if (!field) return {} as T;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch {
      return {} as T;
    }
  }
  return field as T;
};

export const stringifyForSupabase = (data: any): any => {
  return JSON.parse(JSON.stringify(data));
};
