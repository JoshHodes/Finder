import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get all locations with their item counts
    const { data: locations, error } = await supabase
      .from("locations")
      .select("*, items(count)")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        error: "Failed to fetch locations",
        details: error.message,
      });
    }

    // Attach photo URLs
    const locationsWithUrls = locations.map((loc) => ({
      ...loc,
      item_count: loc.items?.[0]?.count || 0,
      photoUrl: supabase.storage
        .from("location-photos")
        .getPublicUrl(loc.photo_path).data.publicUrl,
    }));

    return res.status(200).json(locationsWithUrls);
  } catch (err) {
    console.error("Locations error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}
