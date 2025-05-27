-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'premium', 'moderator', 'admin');
CREATE TYPE guide_status AS ENUM ('draft', 'published', 'archived', 'deleted');
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guides table
CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status guide_status DEFAULT 'draft',
    featured_image TEXT,
    meta_description TEXT,
    views_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_approved BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment likes table
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, guide_id)
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- File uploads table
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
    upload_type VARCHAR(50) DEFAULT 'image',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light',
    email_notifications BOOLEAN DEFAULT TRUE,
    public_profile BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game data table (for WoW-specific user data)
CREATE TABLE user_game_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    battle_tag VARCHAR(50),
    main_character_name VARCHAR(50),
    main_character_realm VARCHAR(100),
    main_character_class VARCHAR(50),
    main_character_level INTEGER CHECK (main_character_level >= 1 AND main_character_level <= 80),
    main_character_faction VARCHAR(20) CHECK (main_character_faction IN ('Alliance', 'Horde')),
    achievements JSONB DEFAULT '[]',
    professions JSONB DEFAULT '[]',
    delve_progress JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profession data table
CREATE TABLE professions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    icon_url TEXT,
    max_level INTEGER DEFAULT 100,
    specializations JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profession progress table
CREATE TABLE user_profession_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profession_id UUID NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    specialization_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, profession_id)
);

-- Delves table
CREATE TABLE delves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    zone VARCHAR(100) NOT NULL,
    description TEXT,
    min_level INTEGER DEFAULT 70,
    max_players INTEGER DEFAULT 4,
    difficulty_tiers INTEGER DEFAULT 8,
    rewards JSONB DEFAULT '[]',
    location_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User delve progress table
CREATE TABLE user_delve_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delve_id UUID NOT NULL REFERENCES delves(id) ON DELETE CASCADE,
    highest_tier_completed INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    best_time INTEGER, -- in seconds
    last_completed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, delve_id)
);

-- News/announcements table
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    featured_image TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_guides_slug ON guides(slug);
CREATE INDEX idx_guides_author_id ON guides(author_id);
CREATE INDEX idx_guides_status ON guides(status);
CREATE INDEX idx_guides_category ON guides(category);
CREATE INDEX idx_guides_tags ON guides USING GIN(tags);
CREATE INDEX idx_guides_published_at ON guides(published_at);
CREATE INDEX idx_guides_rating_average ON guides(rating_average);
CREATE INDEX idx_guides_views_count ON guides(views_count);
CREATE INDEX idx_guides_is_featured ON guides(is_featured);

CREATE INDEX idx_comments_guide_id ON comments(guide_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_is_approved ON comments(is_approved);
CREATE INDEX idx_comments_is_deleted ON comments(is_deleted);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

CREATE INDEX idx_ratings_guide_id ON ratings(guide_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_guide_id ON uploads(guide_id);
CREATE INDEX idx_uploads_upload_type ON uploads(upload_type);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Full-text search indexes
CREATE INDEX idx_guides_search ON guides USING GIN(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_comments_search ON comments USING GIN(to_tsvector('english', content));

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_game_data_updated_at BEFORE UPDATE ON user_game_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profession_progress_updated_at BEFORE UPDATE ON user_profession_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_delve_progress_updated_at BEFORE UPDATE ON user_delve_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profession_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_delve_progress ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and public profiles
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id OR is_active = true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Guides policies
CREATE POLICY "Anyone can view published guides" ON guides
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can manage their guides" ON guides
    FOR ALL USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Anyone can view approved comments" ON comments
    FOR SELECT USING (is_approved = true AND is_deleted = false);

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Anyone can view ratings" ON ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own ratings" ON ratings
    FOR ALL USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- User game data policies
CREATE POLICY "Users can view public game data" ON user_game_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_preferences up 
            WHERE up.user_id = user_game_data.user_id 
            AND up.public_profile = true
        ) OR auth.uid() = user_id
    );

CREATE POLICY "Users can manage own game data" ON user_game_data
    FOR ALL USING (auth.uid() = user_id);

-- Insert default professions data
INSERT INTO professions (name, category, description, max_level) VALUES
('Alchemy', 'Crafting', 'Create potions, flasks, and transmute materials', 100),
('Blacksmithing', 'Crafting', 'Forge weapons, armor, and tools', 100),
('Enchanting', 'Crafting', 'Enhance gear with magical properties', 100),
('Engineering', 'Crafting', 'Create gadgets, explosives, and mechanical devices', 100),
('Herbalism', 'Gathering', 'Gather herbs and plants for alchemy', 100),
('Inscription', 'Crafting', 'Create glyphs, scrolls, and books', 100),
('Jewelcrafting', 'Crafting', 'Cut gems and create jewelry', 100),
('Leatherworking', 'Crafting', 'Craft leather and mail armor', 100),
('Mining', 'Gathering', 'Extract ores and gems from deposits', 100),
('Skinning', 'Gathering', 'Skin creatures for leather and scales', 100),
('Tailoring', 'Crafting', 'Create cloth armor and bags', 100),
('Cooking', 'Secondary', 'Prepare food that provides beneficial effects', 100),
('Fishing', 'Secondary', 'Catch fish and other aquatic creatures', 100),
('First Aid', 'Secondary', 'Create bandages and healing items', 100);

-- Insert default delves data
INSERT INTO delves (name, zone, description, min_level, max_players, difficulty_tiers) VALUES
('The Dread Pit', 'Isle of Dorn', 'A dark cavern filled with ancient horrors', 70, 4, 8),
('Earthcrawl Mines', 'The Ringing Deeps', 'Abandoned mining tunnels with mechanical guardians', 70, 4, 8),
('Fungal Folly', 'The Ringing Deeps', 'A mushroom-infested underground network', 70, 4, 8),
('Kriegval''s Rest', 'Isle of Dorn', 'The tomb of an ancient vrykul warrior', 70, 4, 8),
('Mycomancer Cavern', 'The Ringing Deeps', 'A cavern controlled by fungal magic', 70, 4, 8),
('Nightfall Sanctum', 'Hallowfall', 'A sacred site corrupted by shadow', 70, 4, 8),
('The Sinkhole', 'The Ringing Deeps', 'A massive crater with hidden depths', 70, 4, 8),
('Skittering Breach', 'Azj-Kahet', 'A nerubian outpost on the surface', 70, 4, 8),
('The Spiral Weave', 'Azj-Kahet', 'A web-like structure in nerubian territory', 70, 4, 8),
('Tak-Rethan Abyss', 'Azj-Kahet', 'The deepest reaches of the nerubian empire', 70, 4, 8),
('The Underkeep', 'Isle of Dorn', 'A fortress built into the mountainside', 70, 4, 8),
('The Waterworks', 'The Ringing Deeps', 'Ancient titan machinery that controls water flow', 70, 4, 8),
('Zekvir''s Lair', 'Azj-Kahet', 'The personal domain of a powerful nerubian lord', 70, 4, 8);

-- Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a function to update guide statistics
CREATE OR REPLACE FUNCTION update_guide_stats(guide_uuid UUID)
RETURNS void AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    rating_cnt INTEGER;
    comment_cnt INTEGER;
BEGIN
    -- Calculate average rating
    SELECT AVG(rating), COUNT(*) INTO avg_rating, rating_cnt
    FROM ratings WHERE guide_id = guide_uuid;
    
    -- Count approved comments
    SELECT COUNT(*) INTO comment_cnt
    FROM comments 
    WHERE guide_id = guide_uuid 
    AND is_approved = true 
    AND is_deleted = false;
    
    -- Update guide
    UPDATE guides 
    SET 
        rating_average = COALESCE(avg_rating, 0),
        rating_count = COALESCE(rating_cnt, 0),
        comments_count = COALESCE(comment_cnt, 0)
    WHERE id = guide_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update guide stats
CREATE OR REPLACE FUNCTION trigger_update_guide_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_guide_stats(OLD.guide_id);
        RETURN OLD;
    ELSE
        PERFORM update_guide_stats(NEW.guide_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guide_stats_on_rating
    AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH ROW EXECUTE FUNCTION trigger_update_guide_stats();

CREATE TRIGGER update_guide_stats_on_comment
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION trigger_update_guide_stats(); 