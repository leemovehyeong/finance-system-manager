import {
  TICKET_TYPES,
  TICKET_STATUS,
  PRIORITY,
  SALES_STATUS,
  PAPER_TYPES,
  ROLES,
  EQUIPMENT_TYPES,
  TICKET_SOURCE,
  REGIONS,
} from '@/lib/constants';

// --- Key 파생 타입 ---
export type TicketType = keyof typeof TICKET_TYPES;
export type TicketStatus = keyof typeof TICKET_STATUS;
export type Priority = keyof typeof PRIORITY;
export type SalesStatus = keyof typeof SALES_STATUS;
export type PaperType = keyof typeof PAPER_TYPES;
export type Role = keyof typeof ROLES;
export type EquipmentType = keyof typeof EQUIPMENT_TYPES;
export type TicketSource = keyof typeof TICKET_SOURCE;
export type Region = (typeof REGIONS)[number];

// --- DB 테이블 타입 ---
export interface Employee {
  id: string;
  auth_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: Role | null;
  profile_image: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  business_number: string | null;
  owner_name: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  region: Region | null;
  has_card_terminal: boolean;
  has_pos: boolean;
  has_kiosk: boolean;
  has_table_order: boolean;
  terminal_count: number;
  pos_count: number;
  franchise: string | null;
  van_type: string | null;
  contract_date: string | null;
  memo: string | null;
  last_visit_at: string | null;
  visit_count: number;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: number;
  store_id: string | null;
  store_name: string;
  store_phone: string | null;
  store_address: string | null;
  type: TicketType;
  priority: Priority;
  title: string;
  description: string | null;
  equipment_type: EquipmentType | null;
  equipment_detail: string | null;
  paper_type: PaperType | null;
  paper_quantity: number | null;
  status: TicketStatus;
  source: TicketSource;
  created_by: string | null;
  assigned_to: string | null;
  completion_memo: string | null;
  completed_at: string | null;
  images: string[] | null;
  created_at: string;
  accepted_at: string | null;
  updated_at: string;
  // JOIN 필드
  created_by_employee?: Employee;
  assigned_to_employee?: Employee;
  store?: Store;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  employee_id: string;
  content: string;
  images: string[] | null;
  is_system: boolean;
  created_at: string;
  // JOIN 필드
  employee?: Employee;
}

export interface SalesProject {
  id: string;
  project_number: number;
  store_id: string | null;
  store_name: string;
  store_phone: string | null;
  store_address: string | null;
  owner_name: string | null;
  business_number: string | null;
  franchise: string | null;
  sales_person: string | null;
  sales_status: SalesStatus;
  contract_date: string | null;
  contract_type: 'purchase' | 'lease' | 'consignment' | null;
  open_date: string | null;
  install_date: string | null;
  installer: string | null;
  equipment_config: Record<string, unknown> | null;
  sales_checklist: Record<string, boolean>;
  install_checklist: Record<string, boolean>;
  documents: Array<{ name: string; url: string; type: string }>;
  memo: string | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  target: string;
  is_read: boolean;
  related_ticket_id: string | null;
  related_sales_id: string | null;
  created_at: string;
}

export interface PaperStock {
  id: string;
  type: PaperType;
  quantity: number;
  low_threshold: number;
  box_unit: number;
  updated_at: string;
}

export interface PaperTransaction {
  id: string;
  type: 'out' | 'in' | 'adjust';
  paper_type: string;
  quantity: number;
  boxes: number | null;
  store_name: string | null;
  ticket_id: string | null;
  employee_id: string | null;
  memo: string | null;
  prev_stock: number;
  new_stock: number;
  created_at: string;
}
