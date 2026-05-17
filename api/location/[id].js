import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing location ID" });
  }

  if (req.method === "GET") {
    return getLocation(id, res);
  } else if (req.method === "DELETE") {
    return deleteLocation(id, res);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function getLocation(id, res) {
  try {
    // Get location with all its items
    const { data: location, error } = await supabase
      .from("locations")
      .select("*, items(*)")
      .eq("id", id)
      .single();

    if (error || !location) {
      return res.status(404).json({ error: "Location not found" });
    }

    // Attach photo URL
    location.photoUrl = supabase.storage
      .from("location-photos")
      .getPublicUrl(location.photo_path).data.publicUrl;

    return res.status(200).json(location);
  } catch (err) {
    console.error("Get location error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}

async function deleteLocation(id, res) {
  try {
    // Get the photo path before deleting
    const { data: location, error: fetchError } = await supabase
      .from("locations")
      .select("photo_path")
      .eq("id", id)
      .single();

    if (fetchError || !location) {
      return res.status(404).json({ error: "Location not found" });
    }

    // Delete from storage
    await supabase.storage
      .from("location-photos")
      .remove([location.photo_path]);

    // Delete from database (items cascade automatically)
    const { error: deleteError } = await supabase
      .from("locations")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return res.status(500).json({
        error: "Failed to delete location",
        details: deleteError.message,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete location error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}
