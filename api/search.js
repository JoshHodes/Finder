import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

  const query = q.trim();

  try {
    // 1. Generate embedding for the search query
    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const embeddingResult = await embeddingModel.embedContent({
      content: { parts: [{ text: query }] },
      outputDimensionality: 768
    });
    const queryEmbedding = embeddingResult.embedding.values;

    // 2. Perform vector similarity search using RPC
    const { data: matchedItems, error } = await supabase.rpc("match_items", {
      query_embedding: queryEmbedding,
      match_threshold: 0.65,
      match_count: 50,
    });

    if (error) {
      return res.status(500).json({
        error: "Search failed",
        details: error.message,
      });
    }

    if (!matchedItems || matchedItems.length === 0) {
      return res.status(200).json({
        query: q,
        resultCount: 0,
        locations: [],
      });
    }

    // 3. Fetch location data for the matched items
    const locationIds = [...new Set(matchedItems.map(item => item.location_id))];
    const { data: locations, error: locError } = await supabase
      .from("locations")
      .select("*")
      .in("id", locationIds);

    if (locError) {
      return res.status(500).json({
        error: "Failed to fetch locations",
        details: locError.message,
      });
    }

    const locationsById = {};
    for (const loc of locations) {
      locationsById[loc.id] = loc;
    }

    // 4. Group results by location
    const locationMap = new Map();

    for (const item of matchedItems) {
      const loc = locationsById[item.location_id];
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
        similarity: item.similarity,
        box: item.box || null,
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
