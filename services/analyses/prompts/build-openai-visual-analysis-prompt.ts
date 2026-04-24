export type BuiltOpenAiVisualAnalysisPrompt = {
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
  schema: Record<string, unknown>;
};

type PromptInput = {
  originalName: string;
};

export function buildOpenAiVisualAnalysisPrompt(
  input: PromptInput,
): BuiltOpenAiVisualAnalysisPrompt {
  return {
    systemPrompt: [
      "You analyze a photo and classify its Korean copywriting style from the actual image content.",
      "Use the image first. Treat the file name only as a weak hint.",
      "Do not hallucinate night loneliness unless the image is actually quiet, dark, solitary, and reflective.",
      "For drifting, racing, motorsports, smoke, speed, aggressive movement, or hard control scenes, choose action_speed or sports_energy.",
      "Return valid JSON only.",
    ].join("\n"),
    userPrompt: [
      "[Task]",
      "Analyze the uploaded image and return one structured Korean-oriented style analysis payload.",
      "",
      "[Weak hint]",
      `- file_name_hint: ${input.originalName}`,
      "",
      "[photo_style_type definitions]",
      "- emotional_landscape: quiet emotional landscape, empathy, residue, stored feeling",
      "- spring_healing: spring warmth, light comfort, recovery, softness",
      "- lonely_night: solitary night, emotional isolation, late-night residue",
      "- reflective_fog: fog, direction, pause, thought, uncertainty",
      "- travel_korean: travel, hanok, Korean place mood, memory, atmosphere",
      "- natural_healing: nature, calm breathing, soft recovery, rest",
      "- action_speed: drift, racing, motorsport, speed, smoke, risk, control, thrill",
      "- sports_energy: athlete, match, workout, movement, competition, aggression, focus",
      "- urban_mood: city mood, neon, alley, modern solitude, urban texture",
      "- other: none of the above clearly fit",
      "",
      "[Rules]",
      "- Base the answer on the image itself.",
      "- Keep short_review to one concise sentence.",
      "- Keep long_review to two concise Korean-oriented sentences.",
      "- recommended_text_position must be one of: top_left, top_center, top_right, left_center, center, right_center, bottom_left, bottom_center, bottom_right.",
      "- Scores are integers from 0 to 100.",
      "- hashtags must be 5 to 10 short Korean hashtags.",
      "",
      "[Output JSON schema]",
      JSON.stringify(
        {
          scene_type: "string",
          mood_category: "string",
          photo_style_type:
            "emotional_landscape | spring_healing | lonely_night | reflective_fog | travel_korean | natural_healing | action_speed | sports_energy | urban_mood | other",
          short_review: "string",
          long_review: "string",
          recommended_text_position: "string",
          wallpaper_score: 80,
          social_score: 80,
          commercial_score: 80,
          hashtags: ["#예시"],
        },
        null,
        2,
      ),
    ].join("\n"),
    schemaName: "photo_visual_analysis_payload",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        scene_type: { type: "string" },
        mood_category: { type: "string" },
        photo_style_type: {
          type: "string",
          enum: [
            "emotional_landscape",
            "spring_healing",
            "lonely_night",
            "reflective_fog",
            "travel_korean",
            "natural_healing",
            "action_speed",
            "sports_energy",
            "urban_mood",
            "other",
          ],
        },
        short_review: { type: "string" },
        long_review: { type: "string" },
        recommended_text_position: { type: "string" },
        wallpaper_score: { type: "number" },
        social_score: { type: "number" },
        commercial_score: { type: "number" },
        hashtags: {
          type: "array",
          minItems: 5,
          maxItems: 10,
          items: { type: "string" },
        },
      },
      required: [
        "scene_type",
        "mood_category",
        "photo_style_type",
        "short_review",
        "long_review",
        "recommended_text_position",
        "wallpaper_score",
        "social_score",
        "commercial_score",
        "hashtags",
      ],
    },
  };
}
