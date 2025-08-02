export default async function handler(req, res) {
  const { theme } = req.body;
  const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
  const instruction = `
    You are an expert designer and color theorist.
    Your task is to generate a harmonious and functional 5-color palette based on a theme.
    You must return ONLY a single, valid JSON object inside <json> tags. Do not include any other text or markdown formatting.

    Example Request: "A serene beach at sunset"
    Example Response:
    <json>
    {
      "palette": [
        {"role": "Primary", "hex": "#f2a65e", "name": "Sunset Orange"},
        {"role": "Secondary", "hex": "#738fa7", "name": "Dusky Blue"},
        {"role": "Accent", "hex": "#ffcdab", "name": "Sandy Peach"},
        {"role": "Neutral", "hex": "#f5f5f5", "name": "Cloud White"},
        {"role": "Dark", "hex": "#343a40", "name": "Deep Sea"}
      ],
      "justification": "This palette captures the warm, calming tones of a beach sunset. The orange and peach reflect the sun's glow, while the dusky blue and deep sea represent the water and encroaching night."
    }
    </json>

    The theme is: '${theme}'.
  `;
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`;
  try {
    const apiResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instruction }] }]
      }),
    });

    const result = await apiResponse.json();

    // --- START: Robust Error and Response Handling ---

    // 1. Check if the API returned any candidates at all.
    if (!result.candidates || result.candidates.length === 0) {
      // This often happens if the prompt is blocked entirely by safety settings.
      return res.status(500).json({ error: 'The AI model returned no content, possibly due to safety filters.' });
    }

    const textFromAI = result.candidates[0].content.parts[0].text;

    // 2. Check if the response text contains a JSON object.
    const startIndex = textFromAI.indexOf('{');
    const endIndex = textFromAI.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      // This happens if the AI responded with plain text instead of JSON.
      return res.status(500).json({ error: "The AI did not return a valid JSON object." });
    }

    // 3. If all checks pass, send the clean JSON back to the frontend.
    const cleanJson = textFromAI.substring(startIndex, endIndex + 1);
    res.status(200).send(cleanJson);
    // --- END: Robust Error and Response Handling ---

  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(500).json({ error: 'An unexpected error occurred on the server.' });
  }
}