-- Create the items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'cleaning', 'essentials')),
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_of_measurement TEXT NOT NULL CHECK (unit_of_measurement IN ('pack', 'piece', 'box')),
  supplier_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the inventory_history table to track both check-ins and check-outs
CREATE TABLE inventory_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('check-in', 'check-out')),
  quantity INTEGER NOT NULL,
  performed_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for both tables
-- Note: If "items" is already in the publication, you can skip that line or use:
-- ALTER PUBLICATION supabase_realtime DROP TABLE items;
-- ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_history;

-- Create a function to update item quantity on history insert
CREATE OR REPLACE FUNCTION handle_inventory_history()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'check-in' THEN
    UPDATE items
    SET quantity = quantity + NEW.quantity
    WHERE id = NEW.item_id;
  ELSIF NEW.type = 'check-out' THEN
    UPDATE items
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function on history insert
CREATE TRIGGER on_inventory_history_insert
AFTER INSERT ON inventory_history
FOR EACH ROW
EXECUTE FUNCTION handle_inventory_history();

-- Set up Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to items" ON items FOR ALL USING (true);
CREATE POLICY "Allow all access to inventory_history" ON inventory_history FOR ALL USING (true);
