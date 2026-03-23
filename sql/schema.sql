-- ============================================
-- 금융시스템매니저 DB 스키마
-- Supabase SQL Editor에서 실행
-- ============================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'office', 'field')),
  profile_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. stores (거래처)
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_number TEXT,
  owner_name TEXT,
  phone TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  region TEXT CHECK (region IN ('여수', '순천', '광양', '기타')),
  has_card_terminal BOOLEAN DEFAULT false,
  has_pos BOOLEAN DEFAULT false,
  has_kiosk BOOLEAN DEFAULT false,
  has_table_order BOOLEAN DEFAULT false,
  terminal_count INTEGER DEFAULT 0,
  pos_count INTEGER DEFAULT 0,
  franchise TEXT,
  van_type TEXT,
  contract_date DATE,
  memo TEXT,
  last_visit_at TIMESTAMPTZ,
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stores_name ON stores USING gin(name gin_trgm_ops);
CREATE INDEX idx_stores_region ON stores(region);

-- 4. tickets (업무 티켓)
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL,
  store_id UUID REFERENCES stores(id),
  store_name TEXT NOT NULL,
  store_phone TEXT,
  store_address TEXT,
  type TEXT NOT NULL CHECK (type IN ('as', 'install', 'paper', 'inspect', 'sales', 'other')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'low')),
  title TEXT NOT NULL,
  description TEXT,
  equipment_type TEXT CHECK (equipment_type IN ('card_terminal', 'pos', 'kiosk', 'table_order', 'printer', 'other')),
  equipment_detail TEXT,
  paper_type TEXT CHECK (paper_type IN ('pos', 'thermal', 'portable')),
  paper_quantity INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  source TEXT DEFAULT 'internal' CHECK (source IN ('internal', 'external')),
  created_by UUID REFERENCES employees(id),
  assigned_to UUID REFERENCES employees(id),
  completion_memo TEXT,
  completed_at TIMESTAMPTZ,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_type ON tickets(type);
CREATE INDEX idx_tickets_source ON tickets(source);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- 5. ticket_comments
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id),
  content TEXT NOT NULL,
  images TEXT[],
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. sales_projects (영업/설치 프로젝트)
CREATE TABLE sales_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number SERIAL,
  store_id UUID REFERENCES stores(id),
  store_name TEXT NOT NULL,
  store_phone TEXT,
  store_address TEXT,
  owner_name TEXT,
  business_number TEXT,
  franchise TEXT,
  sales_person UUID REFERENCES employees(id),
  sales_status TEXT DEFAULT 'prospecting' CHECK (sales_status IN (
    'prospecting', 'contracted', 'install_scheduled', 'installing', 'completed', 'cancelled'
  )),
  contract_date DATE,
  contract_type TEXT CHECK (contract_type IN ('purchase', 'lease', 'consignment')),
  open_date DATE,
  install_date DATE,
  installer UUID REFERENCES employees(id),
  equipment_config JSONB,
  sales_checklist JSONB DEFAULT '{}',
  install_checklist JSONB DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  memo TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sales_status ON sales_projects(sales_status);
CREATE INDEX idx_sales_install_date ON sales_projects(install_date);

-- 7. notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN (
    'new_ticket', 'external_ticket', 'ticket_accepted', 'ticket_completed',
    'ticket_cancelled', 'low_stock', 'comment',
    'sales_update', 'install_scheduled', 'install_reminder'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_ticket_id UUID REFERENCES tickets(id),
  related_sales_id UUID REFERENCES sales_projects(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_target ON notifications(target, is_read, created_at DESC);

-- 8. paper_stock
CREATE TABLE paper_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('pos', 'thermal', 'portable')),
  quantity INTEGER NOT NULL DEFAULT 0,
  low_threshold INTEGER NOT NULL,
  box_unit INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO paper_stock (type, quantity, low_threshold, box_unit) VALUES
  ('pos', 0, 40, 20), ('thermal', 0, 15, 10), ('portable', 0, 10, 5);

-- 9. paper_transactions
CREATE TABLE paper_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('out', 'in', 'adjust')),
  paper_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  boxes INTEGER,
  store_name TEXT,
  ticket_id UUID REFERENCES tickets(id),
  employee_id UUID REFERENCES employees(id),
  memo TEXT,
  prev_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. RLS (Row Level Security)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_transactions ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자 전체 허용 정책
CREATE POLICY "Authenticated users full access" ON employees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON stores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON tickets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON ticket_comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON sales_projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON paper_stock FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON paper_transactions FOR ALL USING (auth.role() = 'authenticated');

-- 외부 접수: 비인증 사용자도 티켓 INSERT 가능 (source='external')
CREATE POLICY "External ticket insert" ON tickets FOR INSERT WITH CHECK (source = 'external');

-- 11. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE paper_stock;
ALTER PUBLICATION supabase_realtime ADD TABLE sales_projects;

-- 12. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_sales_updated_at BEFORE UPDATE ON sales_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
