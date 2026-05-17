import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const locationId = req.params?.id || req.query?.id;
    const { photoBase64, mimeType } = req.body;

    if (!locationId || !photoBase64 || !mimeType) {
      return res.status(400).json({
        error: "Missing required fields: locationId, photoBase64, mimeType",
      });
    }

    // 1. Verify location exists and get old photo path
    const { data: location, error: fetchError } = await supabase
      .from("locations")
      .select("photo_path")
      .eq("id", locationId)
      .single();

    if (fetchError || !location) {
      return res.status(404).json({ error: "Location not found" });
    }

    // 2. Analyze new photo with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        text: `You are an item identification assistant. Look at this photo of a storage location (drawer, shelf, box, etc.) and list every distinct item you can see.

Rules:
- Return ONLY a valid JSON array of strings
- Each string should be a concise but specific item name (e.g. "blue scissors", "AA batteries", "roll of tape")
- Include every visible item, even partially hidden ones
- Do not include the container itself
- No explanations, just the JSON array

Example output: ["blue scissors", "roll of tape", "3 AA batteries", "Phillips screwdriver"]`,
      },
      {
        inlineData: {
          data: photoBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();

    let items;
    try {
      const cleaned = responseText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      items = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({
        error: "Failed to parse AI response",
        raw: responseText,
      });
    }

    if (!Array.isArray(items)) {
      return res.status(500).json({
        error: "AI response was not an array",
        raw: responseText,
      });
    }

    // 3. Delete old photo from storage
    await supabase.storage
      .from("location-photos")
      .remove([location.photo_path]);

    // 4. Upload new photo
    const photoBuffer = Buffer.from(photoBase64, "base64");
    const ext = mimeType.split("/")[1] || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("location-photos")
      .upload(fileName, photoBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({
        error: "Failed to upload photo",
        details: uploadError.message,
      });
    }

    // 5. Update location photo path
    const { error: updateError } = await supabase
      .from("locations")
      .update({ photo_path: fileName })
      .eq("id", locationId);

    if (updateError) {
      return res.status(500).json({
        error: "Failed to update location",
        details: updateError.message,
      });
    }

    // 6. Delete old items and insert new ones
    await supabase.from("items").delete().eq("location_id", locationId);

    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const itemRows = await Promise.all(items.map(async (name) => {
      const result = await embeddingModel.embedContent({
        content: { parts: [{ text: name }] },
        outputDimensionality: 768
      });
      return {
        location_id: locationId,
        name: name,
        embedding: result.embedding.values,
      };
    }));

    const { data: savedItems, error: itemsError } = await supabase
      .from("items")
      .insert(itemRows)
      .select();

    if (itemsError) {
      return res.status(500).json({
        error: "Failed to save items",
        details: itemsError.message,
      });
    }

    return res.status(200).json({
      items: savedItems,
      photoUrl: supabase.storage
        .from("location-photos")
        .getPublicUrl(fileName).data.publicUrl,
    });
  } catch (err) {
    console.error("Rescan error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}
