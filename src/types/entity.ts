export interface FieldValue {
  id: number;
  value: string;
}

export interface CustomField {
  id: number;
  name: string;
  field_type: 'text' | 'dropdown' | 'radio' | 'textarea' | 'checkbox';
  is_required: boolean;
  field_values: FieldValue[];
}

export interface Entity {
  isPaid: any;
  total(total: any): import("react").ReactNode;
  id: number;
  name: string;
  entity_type: string;
  email: string;
  mobile_number: string;
  custom_fields: CustomField[];
  created_date: string;
  updated_date: string;
}
