import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q, limit } = req.query;

  if (!q || q.trim().length < 3) {
    return res.status(200).json({ suggestions: [] });
  }

  const query = q.trim();
  const maxResults = Math.min(parseInt(limit, 10) || 5, 10);

  try {
    // Call the suggest_items RPC which combines prefix/substring matching
    // with pg_trgm word similarity (high threshold only) to avoid noise
    const { data, error } = await supabase.rpc("suggest_items", {
      query_text: query,
      max_results: maxResults,
    });

    if (error) {
      console.error("Suggest RPC error:", error);
      return res.status(500).json({ error: "Suggestion lookup failed", details: error.message });
    }

    const suggestions = (data || []).map((row) => row.suggestion);

    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error("Suggest error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
