CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id INTEGER NOT NULL,
  scene_type TEXT NOT NULL,
  mood_category TEXT NOT NULL,
  short_review TEXT NOT NULL,
  long_review TEXT NOT NULL,
  recommended_text_position TEXT NOT NULL,
  wallpaper_score REAL NOT NULL,
  social_score REAL NOT NULL,
  commercial_score REAL NOT NULL,
  phrases_json TEXT NOT NULL DEFAULT '[]',
  captions_json TEXT NOT NULL DEFAULT '[]',
  hashtags_json TEXT NOT NULL DEFAULT '[]',
  content_set_json TEXT,
  commerce_content_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_analyses_photo
    FOREIGN KEY (photo_id)
    REFERENCES photos(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_photos_created_at
  ON photos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analyses_photo_id
  ON analyses(photo_id);

CREATE INDEX IF NOT EXISTS idx_analyses_created_at
  ON analyses(created_at DESC);
