-- ================================================================
-- Japanese Sensei — Schéma de base de données
-- À exécuter dans le SQL Editor de Neon / Vercel Dashboard
-- ================================================================

-- Extension pour les UUID et le hachage de mot de passe
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------
-- USERS
-- Création manuelle via :
--   INSERT INTO users (username, password_hash)
--   VALUES ('alice', crypt('monMotDePasse', gen_salt('bf', 8)));
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username     VARCHAR(50)  UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  display_name VARCHAR(100),
  avatar_emoji  VARCHAR(10)  DEFAULT '\uD83C\uDF00',
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- KANJI ENTRIES (collection personnelle, stockée en JSONB)
-- id = UUID généré côté client, préservé pour la migration localStorage
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanji_entries (
  id         UUID PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kanji      VARCHAR(20) NOT NULL,
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, kanji)
);

-- ----------------------------------------------------------------
-- LEARNING DATA (progression par kanji, stockée en JSONB)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_data (
  kanji_entry_id UUID NOT NULL REFERENCES kanji_entries(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data           JSONB NOT NULL DEFAULT '{}',
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (kanji_entry_id, user_id)
);

-- ----------------------------------------------------------------
-- FRIENDSHIPS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS friendships (
  requester_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        VARCHAR(20) DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

-- ----------------------------------------------------------------
-- CHALLENGES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS challenges (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenged_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type        VARCHAR(50) NOT NULL,
  status           VARCHAR(20) DEFAULT 'pending'
                     CHECK (status IN ('pending', 'accepted', 'completed', 'declined', 'expired')),
  challenger_score INTEGER,
  challenged_score INTEGER,
  expires_at       TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- ----------------------------------------------------------------
-- GAME SCORES (historique)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_scores (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type VARCHAR(50) NOT NULL,
  score     INTEGER NOT NULL,
  details   JSONB DEFAULT '{}',
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- INDEX
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_kanji_entries_user    ON kanji_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_data_user    ON learning_data(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenged ON challenges(challenged_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_user      ON game_scores(user_id);


-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------
-- USERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(50)  UNIQUE NOT NULL,
  password_hash TEXT       NOT NULL,
  display_name  VARCHAR(100),
  avatar_emoji  VARCHAR(10)  DEFAULT '🎌',
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- KANJI ENTRIES (collection personnelle par utilisateur)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanji_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kanji         VARCHAR(20) NOT NULL,
  onyomi        TEXT[] DEFAULT '{}',
  kunyomi       TEXT[] DEFAULT '{}',
  primary_reading TEXT,
  meanings      TEXT[] DEFAULT '{}',
  primary_meaning TEXT,
  radicals      TEXT[] DEFAULT '{}',
  stroke_count  SMALLINT,
  jlpt_level    VARCHAR(5),
  frequency     INTEGER,
  custom_notes  TEXT,
  tags          TEXT[] DEFAULT '{}',
  is_common     BOOLEAN DEFAULT FALSE,
  source        VARCHAR(20) DEFAULT 'manual', -- 'manual' | 'jlpt_import' | 'jisho'
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, kanji)
);

-- ----------------------------------------------------------------
-- LEARNING DATA (progression d'apprentissage par kanji)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_data (
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kanji_entry_id      UUID NOT NULL REFERENCES kanji_entries(id) ON DELETE CASCADE,
  score               SMALLINT DEFAULT 0 CHECK (score BETWEEN 0 AND 3),
  last_seen_at        TIMESTAMPTZ DEFAULT NOW(),
  total_attempts      INTEGER DEFAULT 0,
  correct_attempts    INTEGER DEFAULT 0,
  consecutive_correct SMALLINT DEFAULT 0,
  consecutive_incorrect SMALLINT DEFAULT 0,
  PRIMARY KEY (user_id, kanji_entry_id)
);

-- ----------------------------------------------------------------
-- FRIENDS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS friendships (
  requester_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

-- ----------------------------------------------------------------
-- KANJI PACKS (listes partageables)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanji_packs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  is_public     BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kanji_pack_items (
  pack_id         UUID NOT NULL REFERENCES kanji_packs(id) ON DELETE CASCADE,
  kanji_entry_id  UUID NOT NULL REFERENCES kanji_entries(id) ON DELETE CASCADE,
  PRIMARY KEY (pack_id, kanji_entry_id)
);

-- Accès partagé aux packs entre amis
CREATE TABLE IF NOT EXISTS pack_shares (
  pack_id     UUID NOT NULL REFERENCES kanji_packs(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (pack_id, shared_with)
);

-- ----------------------------------------------------------------
-- CHALLENGES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS challenges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenged_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type       VARCHAR(50) NOT NULL, -- 'speed_match' | 'kana_rain' | 'memory' | 'hidden_meaning' | 'fill_blank'
  game_config     JSONB DEFAULT '{}',   -- paramètres du jeu (nb questions, tags filtrés, etc.)
  status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'declined', 'expired')),
  challenger_score  INTEGER,
  challenged_score  INTEGER,
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- ----------------------------------------------------------------
-- GAME SCORES (historique des parties)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS game_scores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type   VARCHAR(50) NOT NULL,
  score       INTEGER NOT NULL,
  details     JSONB DEFAULT '{}', -- nb bonnes réponses, temps, etc.
  played_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- INDEX pour les performances
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_kanji_entries_user_id ON kanji_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_data_user_id ON learning_data(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenged ON challenges(challenged_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id, game_type);
CREATE INDEX IF NOT EXISTS idx_pack_shares_user ON pack_shares(shared_with);
