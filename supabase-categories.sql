-- ============================================
-- Finder App — Categories & Typeahead
-- Run this in the Supabase SQL Editor after the two previous files
-- ============================================

-- Add category column to items (existing rows get NULL, displayed as Miscellaneous)
ALTER TABLE items ADD COLUMN IF NOT EXISTS category text;

-- ============================================
-- Typeahead suggestion function
-- Uses pg_trgm word similarity + prefix matching to suggest item names
-- from the user's own collection as they type
-- ============================================
CREATE OR REPLACE FUNCTION suggest_items(query_text text, max_results int DEFAULT 5)
RETURNS TABLE (suggestion text)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      name,
      CASE
        -- Prefix match is highest priority
        WHEN lower(name) LIKE lower(query_text) || '%' THEN 1.0
        -- Substring match anywhere in the name
        WHEN lower(name) LIKE '%' || lower(query_text) || '%' THEN 0.8
        -- Fuzzy trigram match, but only at a high threshold to avoid noise
        WHEN word_similarity(lower(query_text), lower(name)) >= 0.45 THEN
          word_similarity(lower(query_text), lower(name))
        ELSE 0
      END AS score
    FROM items
    WHERE
      lower(name) LIKE lower(query_text) || '%'
      OR lower(name) LIKE '%' || lower(query_text) || '%'
      OR word_similarity(lower(query_text), lower(name)) >= 0.45
  ),
  deduped AS (
    SELECT DISTINCT ON (lower(name)) name, score
    FROM ranked
    WHERE score > 0
    ORDER BY lower(name), score DESC
  )
  SELECT name AS suggestion
  FROM deduped
  ORDER BY score DESC, length(name) ASC
  LIMIT max_results;
END;
$$;
