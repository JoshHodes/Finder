-- ============================================
-- Finder App — Bounding Box Spatial Grounding
-- Run this in the Supabase SQL Editor after the previous three files
-- ============================================

-- Store each item's bounding box from Gemini Vision as JSONB
-- Format: {"ymin": int, "xmin": int, "ymax": int, "xmax": int} on a 0–1000 scale
ALTER TABLE items ADD COLUMN IF NOT EXISTS box jsonb;

-- ============================================
-- Re-create match_items to also return box data
-- ============================================
DROP FUNCTION IF EXISTS match_items(vector, double precision, integer);

CREATE OR REPLACE FUNCTION match_items (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  location_id uuid,
  name text,
  category text,
  box jsonb,
  created_at timestamptz,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    items.id,
    items.location_id,
    items.name,
    items.category,
    items.box,
    items.created_at,
    1 - (items.embedding <=> query_embedding) AS similarity
  FROM items
  WHERE items.embedding IS NOT NULL
    AND 1 - (items.embedding <=> query_embedding) > match_threshold
  ORDER BY items.embedding <=> query_embedding
  LIMIT match_count;
$$;
