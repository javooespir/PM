-- PM Control Tower - Initial Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  customer TEXT,
  program TEXT,
  type TEXT CHECK (type IN ('automotive','aerospace','industrial','other')) DEFAULT 'automotive',
  status TEXT CHECK (status IN ('planning','active','on_hold','completed','cancelled')) DEFAULT 'active',
  start_date DATE,
  sop_date DATE,
  end_date DATE,
  health TEXT CHECK (health IN ('green','yellow','red')) DEFAULT 'green',
  completion_pct INTEGER DEFAULT 0 CHECK (completion_pct BETWEEN 0 AND 100),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS / PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin','pm','engineer','viewer')) DEFAULT 'engineer',
  area TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MILESTONES
-- ============================================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  type TEXT CHECK (type IN ('SOP','EVT','DVT','PVT','LVPT','Tooling','PPAP','Certification','Validation','Custom')) DEFAULT 'Custom',
  planned_date DATE,
  actual_date DATE,
  forecast_date DATE,
  status TEXT CHECK (status IN ('not_started','on_track','at_risk','delayed','completed')) DEFAULT 'not_started',
  health TEXT CHECK (health IN ('green','yellow','red')) DEFAULT 'green',
  completion_pct INTEGER DEFAULT 0,
  owner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  country TEXT,
  category TEXT,
  status TEXT CHECK (status IN ('active','critical','at_risk','inactive')) DEFAULT 'active',
  performance_score INTEGER DEFAULT 100 CHECK (performance_score BETWEEN 0 AND 100),
  lead_time_days INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  area TEXT,
  owner_id UUID REFERENCES profiles(id),
  priority TEXT CHECK (priority IN ('critical','high','medium','low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('not_started','in_progress','blocked','completed','cancelled')) DEFAULT 'not_started',
  due_date DATE,
  actual_close_date DATE,
  affects_sop BOOLEAN DEFAULT false,
  is_safety BOOLEAN DEFAULT false,
  blocks_tasks UUID[],
  score INTEGER DEFAULT 0,
  aging_days INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN status NOT IN ('completed','cancelled') AND due_date < CURRENT_DATE
      THEN (CURRENT_DATE - due_date)
      ELSE 0
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RISKS
-- ============================================================
CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('technical','schedule','cost','quality','supplier','regulatory','safety','other')) DEFAULT 'other',
  probability INTEGER CHECK (probability BETWEEN 1 AND 10) DEFAULT 5,
  severity INTEGER CHECK (severity BETWEEN 1 AND 10) DEFAULT 5,
  detectability INTEGER CHECK (detectability BETWEEN 1 AND 10) DEFAULT 5,
  rpn INTEGER GENERATED ALWAYS AS (probability * severity * detectability) STORED,
  owner_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('open','mitigating','monitoring','closed')) DEFAULT 'open',
  mitigation_plan TEXT,
  contingency_plan TEXT,
  trigger_condition TEXT,
  review_date DATE,
  closed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ESCALATIONS
-- ============================================================
CREATE TABLE escalations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  risk_id UUID REFERENCES risks(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  trigger_reason TEXT,
  severity TEXT CHECK (severity IN ('critical','high','medium')) DEFAULT 'high',
  status TEXT CHECK (status IN ('open','acknowledged','in_progress','resolved')) DEFAULT 'open',
  owner_id UUID REFERENCES profiles(id),
  escalated_to UUID REFERENCES profiles(id),
  due_date DATE,
  resolved_date DATE,
  resolution_notes TEXT,
  auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEETINGS
-- ============================================================
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('weekly_review','risk_review','milestone_review','supplier_meeting','kickoff','other')) DEFAULT 'other',
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  location TEXT,
  organizer_id UUID REFERENCES profiles(id),
  attendees UUID[],
  notes TEXT,
  decisions TEXT,
  status TEXT CHECK (status IN ('scheduled','completed','cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEETING ACTIONS (open points from meetings)
-- ============================================================
CREATE TABLE meeting_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id),
  due_date DATE,
  status TEXT CHECK (status IN ('open','in_progress','completed')) DEFAULT 'open',
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  risk_id UUID REFERENCES risks(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  size_bytes BIGINT,
  storage_path TEXT NOT NULL,
  url TEXT,
  tags TEXT[],
  version TEXT DEFAULT '1.0',
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMENTS (universal comment system)
-- ============================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  entity_type TEXT CHECK (entity_type IN ('task','risk','supplier','milestone','meeting','escalation')) NOT NULL,
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG (change history)
-- ============================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT CHECK (action IN ('created','updated','deleted','status_changed')) NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX idx_tasks_owner ON tasks(owner_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_risks_project ON risks(project_id);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_rpn ON risks(rpn);
CREATE INDEX idx_escalations_project ON escalations(project_id);
CREATE INDEX idx_escalations_status ON escalations(status);
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_suppliers_project ON suppliers(project_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can access their project data
CREATE POLICY "Authenticated access" ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON milestones FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON tasks FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON risks FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON escalations FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON meetings FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON meeting_actions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON comments FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated access" ON audit_log FOR ALL TO authenticated USING (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_escalations_updated_at BEFORE UPDATE ON escalations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-score tasks
CREATE OR REPLACE FUNCTION calculate_task_score()
RETURNS TRIGGER AS $$
DECLARE
  score_val INTEGER := 0;
BEGIN
  IF NEW.affects_sop THEN score_val := score_val + 40; END IF;
  IF NEW.is_safety THEN score_val := score_val + 50; END IF;
  IF NEW.due_date < CURRENT_DATE AND NEW.status NOT IN ('completed','cancelled') THEN score_val := score_val + 30; END IF;
  IF NEW.supplier_id IS NOT NULL THEN score_val := score_val + 20; END IF;
  IF NEW.blocks_tasks IS NOT NULL AND array_length(NEW.blocks_tasks, 1) > 0 THEN score_val := score_val + 25; END IF;
  NEW.score := score_val;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_score BEFORE INSERT OR UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION calculate_task_score();

-- Auto-create escalations for overdue critical tasks
CREATE OR REPLACE FUNCTION check_escalation_needed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('completed','cancelled')
     AND NEW.due_date < (CURRENT_DATE - INTERVAL '5 days')
     AND (NEW.priority = 'critical' OR NEW.affects_sop OR NEW.is_safety)
     AND NOT EXISTS (
       SELECT 1 FROM escalations
       WHERE task_id = NEW.id AND status NOT IN ('resolved')
     ) THEN
    INSERT INTO escalations (project_id, task_id, title, description, trigger_reason, severity, auto_generated)
    VALUES (
      NEW.project_id,
      NEW.id,
      'Auto-Escalation: ' || NEW.title,
      'Task overdue by more than 5 days with critical priority or SOP/Safety impact.',
      'overdue_critical_task',
      'critical',
      true
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_escalation AFTER INSERT OR UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION check_escalation_needed();

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;
CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Authenticated download" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents');
CREATE POLICY "Authenticated delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents');
