-- DARI LUXE ERP — Migration 04: Room Engineering & Architectural Technical System
-- Hierarchical Structure: Project -> Building -> Floor -> Room -> Walls & Technical Details

-- 1. Project Buildings (المباني)
CREATE TABLE IF NOT EXISTS project_buildings (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    building_name TEXT NOT NULL DEFAULT 'المبنى الرئيسي',
    building_type TEXT DEFAULT 'villa',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add building_id to project_floors and project_rooms if not already present
ALTER TABLE project_floors ADD COLUMN IF NOT EXISTS building_id TEXT REFERENCES project_buildings(id) ON DELETE SET NULL;
ALTER TABLE project_rooms ADD COLUMN IF NOT EXISTS building_id TEXT REFERENCES project_buildings(id) ON DELETE SET NULL;
ALTER TABLE project_rooms ADD COLUMN IF NOT EXISTS volume NUMERIC DEFAULT 0;
ALTER TABLE project_rooms ADD COLUMN IF NOT EXISTS room_area NUMERIC DEFAULT 0;

-- 2. Room Walls (جدران الغرفة المستقلة)
CREATE TABLE IF NOT EXISTS room_walls (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES project_rooms(id) ON DELETE CASCADE,
    wall_name TEXT NOT NULL,
    wall_position TEXT DEFAULT 'front',
    length NUMERIC NOT NULL DEFAULT 4.0,
    height NUMERIC NOT NULL DEFAULT 2.8,
    area NUMERIC NOT NULL DEFAULT 11.2,
    finish_type TEXT DEFAULT 'plaster',
    paint_type TEXT DEFAULT 'vinyle',
    needs_finish BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend room_doors with wall_id & pricing
ALTER TABLE room_doors ADD COLUMN IF NOT EXISTS wall_id TEXT REFERENCES room_walls(id) ON DELETE SET NULL;
ALTER TABLE room_doors ADD COLUMN IF NOT EXISTS size_category TEXT DEFAULT 'medium';
ALTER TABLE room_doors ADD COLUMN IF NOT EXISTS door_type TEXT DEFAULT 'chambre';
ALTER TABLE room_doors ADD COLUMN IF NOT EXISTS material TEXT DEFAULT 'bois';
ALTER TABLE room_doors ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'naturel';
ALTER TABLE room_doors ADD COLUMN IF NOT EXISTS door_price NUMERIC DEFAULT 0;
ALTER TABLE room_doors ADD COLUMN IF NOT EXISTS installation_cost NUMERIC DEFAULT 0;

-- Extend room_windows with wall_id & pricing
ALTER TABLE room_windows ADD COLUMN IF NOT EXISTS wall_id TEXT REFERENCES room_walls(id) ON DELETE SET NULL;
ALTER TABLE room_windows ADD COLUMN IF NOT EXISTS material TEXT DEFAULT 'aluminium';
ALTER TABLE room_windows ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blanc';
ALTER TABLE room_windows ADD COLUMN IF NOT EXISTS window_price NUMERIC DEFAULT 0;
ALTER TABLE room_windows ADD COLUMN IF NOT EXISTS installation_cost NUMERIC DEFAULT 0;

-- 3. Room Lighting (إدارة الإنارة)
CREATE TABLE IF NOT EXISTS room_lighting (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES project_rooms(id) ON DELETE CASCADE,
    wall_id TEXT REFERENCES room_walls(id) ON DELETE SET NULL,
    lighting_type TEXT NOT NULL DEFAULT 'spot',
    model_name TEXT NOT NULL DEFAULT 'Spot LED Encastré',
    quantity INTEGER NOT NULL DEFAULT 1,
    power_watts NUMERIC DEFAULT 7,
    unit_price NUMERIC DEFAULT 0,
    installation_cost NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Room Electrical (التجهيزات الكهربائية والمقابس)
CREATE TABLE IF NOT EXISTS room_electrical (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES project_rooms(id) ON DELETE CASCADE,
    wall_id TEXT REFERENCES room_walls(id) ON DELETE SET NULL,
    fixture_type TEXT NOT NULL DEFAULT 'prise',
    name TEXT NOT NULL DEFAULT 'Prise de courant 16A',
    quantity INTEGER NOT NULL DEFAULT 1,
    height_from_floor NUMERIC DEFAULT 30,
    unit_price NUMERIC DEFAULT 0,
    installation_cost NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Room Decorations & Finishes (الديكور والتشطيبات)
CREATE TABLE IF NOT EXISTS room_decorations (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES project_rooms(id) ON DELETE CASCADE,
    wall_id TEXT REFERENCES room_walls(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL DEFAULT 'wall',
    decor_type TEXT NOT NULL DEFAULT 'ba13_ceiling',
    title TEXT NOT NULL,
    quantity_or_area NUMERIC DEFAULT 1,
    unit TEXT DEFAULT 'm²',
    material_cost NUMERIC DEFAULT 0,
    labor_cost NUMERIC DEFAULT 0,
    total_cost NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Room Attachments & Notes
CREATE TABLE IF NOT EXISTS room_attachments (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES project_rooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url_or_data TEXT,
    attachment_type TEXT DEFAULT 'image',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and public access policies
ALTER TABLE project_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_lighting ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_electrical ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_decorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access to project_buildings" ON project_buildings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to room_walls" ON room_walls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to room_lighting" ON room_lighting FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to room_electrical" ON room_electrical FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to room_decorations" ON room_decorations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to room_attachments" ON room_attachments FOR ALL USING (true) WITH CHECK (true);
