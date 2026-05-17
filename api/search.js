import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: "Missing search query parameter: q" });
  }

  const query = q.trim().toLowerCase();

  try {
    // Fuzzy search items using ILIKE for substring matching
    const { data: matchedItems, error } = await supabase
      .from("items")
      .select("*, locations(*)")
      .ilike("name", `%${query}%`);

    if (error) {
      return res.status(500).json({
        error: "Search failed",
        details: error.message,
      });
    }

    // Group results by location
    const locationMap = new Map();

    for (const item of matchedItems) {
      const loc = item.locations;
      if (!loc) continue;

      if (!locationMap.has(loc.id)) {
        locationMap.set(loc.id, {
          ...loc,
          photoUrl: supabase.storage
            .from("location-photos")
            .getPublicUrl(loc.photo_path).data.publicUrl,
          matchedItems: [],
        });
      }

      locationMap.get(loc.id).matchedItems.push({
        id: item.id,
        name: item.name,
      });
    }

    const results = Array.from(locationMap.values());

    return res.status(200).json({
      query: q,
      resultCount: matchedItems.length,
      locations: results,
    });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}
