-- Enable the pgvector extension
create extension if not exists vector;

-- Add an embedding column to the items table
-- We use 768 dimensions because that is what Gemini's text-embedding-004 outputs
alter table items add column if not exists embedding vector(768);

-- Create a function to search for items
create or replace function match_items (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  location_id uuid,
  name text,
  created_at timestamptz,
  similarity float
)
language sql stable
as $$
  select
    items.id,
    items.location_id,
    items.name,
    items.created_at,
    1 - (items.embedding <=> query_embedding) as similarity
  from items
  where 1 - (items.embedding <=> query_embedding) > match_threshold
  order by items.embedding <=> query_embedding
  limit match_count;
$$;
