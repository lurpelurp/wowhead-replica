const { supabaseAdmin } = require('../config/supabase');

class Guide {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.slug = data.slug;
        this.content = data.content;
        this.excerpt = data.excerpt;
        this.category = data.category;
        this.tags = data.tags || [];
        this.author_id = data.author_id;
        this.status = data.status || 'draft';
        this.featured_image = data.featured_image;
        this.meta_description = data.meta_description;
        this.views_count = data.views_count || 0;
        this.rating_average = data.rating_average || 0;
        this.rating_count = data.rating_count || 0;
        this.comments_count = data.comments_count || 0;
        this.is_featured = data.is_featured || false;
        this.published_at = data.published_at;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        
        // Joined data
        this.author = data.author;
    }

    // Create a new guide
    static async create(guideData) {
        try {
            const slug = this.generateSlug(guideData.title);
            
            const { data, error } = await supabaseAdmin
                .from('guides')
                .insert([{
                    title: guideData.title,
                    slug: slug,
                    content: guideData.content,
                    excerpt: guideData.excerpt,
                    category: guideData.category,
                    tags: guideData.tags || [],
                    author_id: guideData.author_id,
                    status: guideData.status || 'draft',
                    featured_image: guideData.featured_image,
                    meta_description: guideData.meta_description,
                    is_featured: guideData.is_featured || false,
                    published_at: guideData.status === 'published' ? new Date().toISOString() : null
                }])
                .select(`
                    *,
                    author:users(id, username, display_name, avatar_url, role)
                `)
                .single();

            if (error) throw error;
            return new Guide(data);
        } catch (error) {
            throw new Error(`Failed to create guide: ${error.message}`);
        }
    }

    // Generate URL-friendly slug
    static generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    // Find guide by ID
    static async findById(id) {
        try {
            const { data, error } = await supabaseAdmin
                .from('guides')
                .select(`
                    *,
                    author:users(id, username, display_name, avatar_url, role)
                `)
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            return new Guide(data);
        } catch (error) {
            throw new Error(`Failed to find guide: ${error.message}`);
        }
    }

    // Find guide by slug
    static async findBySlug(slug) {
        try {
            const { data, error } = await supabaseAdmin
                .from('guides')
                .select(`
                    *,
                    author:users(id, username, display_name, avatar_url, role)
                `)
                .eq('slug', slug)
                .eq('status', 'published')
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            return new Guide(data);
        } catch (error) {
            throw new Error(`Failed to find guide by slug: ${error.message}`);
        }
    }

    // Get all guides with filtering and pagination
    static async findAll(options = {}) {
        try {
            let query = supabaseAdmin
                .from('guides')
                .select(`
                    *,
                    author:users(id, username, display_name, avatar_url, role)
                `);

            // Apply filters
            if (options.status) {
                query = query.eq('status', options.status);
            } else {
                query = query.eq('status', 'published'); // Default to published only
            }

            if (options.category) {
                query = query.eq('category', options.category);
            }

            if (options.author_id) {
                query = query.eq('author_id', options.author_id);
            }

            if (options.featured) {
                query = query.eq('is_featured', true);
            }

            if (options.tags && options.tags.length > 0) {
                query = query.overlaps('tags', options.tags);
            }

            if (options.search) {
                query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
            }

            // Apply sorting
            const sortBy = options.sortBy || 'created_at';
            const sortOrder = options.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
            query = query.order(sortBy, sortOrder);

            // Apply pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data.map(guide => new Guide(guide));
        } catch (error) {
            throw new Error(`Failed to find guides: ${error.message}`);
        }
    }

    // Get featured guides
    static async getFeatured(limit = 5) {
        try {
            const { data, error } = await supabaseAdmin
                .from('guides')
                .select(`
                    *,
                    author:users(id, username, display_name, avatar_url, role)
                `)
                .eq('status', 'published')
                .eq('is_featured', true)
                .order('published_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data.map(guide => new Guide(guide));
        } catch (error) {
            throw new Error(`Failed to get featured guides: ${error.message}`);
        }
    }

    // Get popular guides (by views)
    static async getPopular(limit = 10) {
        try {
            const { data, error } = await supabaseAdmin
                .from('guides')
                .select(`
                    *,
                    author:users(id, username, display_name, avatar_url, role)
                `)
                .eq('status', 'published')
                .order('views_count', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data.map(guide => new Guide(guide));
        } catch (error) {
            throw new Error(`Failed to get popular guides: ${error.message}`);
        }
    }

    // Get recent guides
    static async getRecent(limit = 10) {
        try {
            const { data, error } = await supabaseAdmin
                .from('guides')
                .select(`
                    *,
                    author:users(id, username, display_name, avatar_url, role)
                `)
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data.map(guide => new Guide(guide));
        } catch (error) {
            throw new Error(`Failed to get recent guides: ${error.message}`);
        }
    }

    // Update guide
    async update(updateData) {
        try {
            const allowedFields = [
                'title', 'content', 'excerpt', 'category', 'tags', 
                'status', 'featured_image', 'meta_description', 'is_featured'
            ];
            const filteredData = {};
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }

            // Update slug if title changed
            if (updateData.title) {
                filteredData.slug = Guide.generateSlug(updateData.title);
            }

            // Set published_at if status changed to published
            if (updateData.status === 'published' && this.status !== 'published') {
                filteredData.published_at = new Date().toISOString();
            }

            filteredData.updated_at = new Date().toISOString();

            const { data, error } = await supabaseAdmin
                .from('guides')
                .update(filteredData)
                .eq('id', this.id)
                .select(`
                    *,
                    author:users(id, username, display_name, avatar_url, role)
                `)
                .single();

            if (error) throw error;
            
            Object.assign(this, data);
            return this;
        } catch (error) {
            throw new Error(`Failed to update guide: ${error.message}`);
        }
    }

    // Delete guide (soft delete)
    async delete() {
        try {
            const { error } = await supabaseAdmin
                .from('guides')
                .update({ 
                    status: 'deleted',
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.id);

            if (error) throw error;
            this.status = 'deleted';
            return true;
        } catch (error) {
            throw new Error(`Failed to delete guide: ${error.message}`);
        }
    }

    // Increment view count
    async incrementViews() {
        try {
            const { error } = await supabaseAdmin
                .from('guides')
                .update({ views_count: this.views_count + 1 })
                .eq('id', this.id);

            if (error) throw error;
            this.views_count += 1;
            return this.views_count;
        } catch (error) {
            throw new Error(`Failed to increment views: ${error.message}`);
        }
    }

    // Update rating
    async updateRating() {
        try {
            // Get all ratings for this guide
            const { data: ratings, error } = await supabaseAdmin
                .from('ratings')
                .select('rating')
                .eq('guide_id', this.id);

            if (error) throw error;

            if (ratings.length === 0) {
                this.rating_average = 0;
                this.rating_count = 0;
            } else {
                const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
                this.rating_average = Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal
                this.rating_count = ratings.length;
            }

            // Update in database
            const { error: updateError } = await supabaseAdmin
                .from('guides')
                .update({
                    rating_average: this.rating_average,
                    rating_count: this.rating_count
                })
                .eq('id', this.id);

            if (updateError) throw updateError;
            return { rating_average: this.rating_average, rating_count: this.rating_count };
        } catch (error) {
            throw new Error(`Failed to update rating: ${error.message}`);
        }
    }

    // Update comments count
    async updateCommentsCount() {
        try {
            const { data: comments, error } = await supabaseAdmin
                .from('comments')
                .select('id')
                .eq('guide_id', this.id)
                .eq('is_deleted', false)
                .eq('is_approved', true);

            if (error) throw error;

            this.comments_count = comments.length;

            const { error: updateError } = await supabaseAdmin
                .from('guides')
                .update({ comments_count: this.comments_count })
                .eq('id', this.id);

            if (updateError) throw updateError;
            return this.comments_count;
        } catch (error) {
            throw new Error(`Failed to update comments count: ${error.message}`);
        }
    }

    // Get guide statistics
    static async getStats() {
        try {
            const { data, error } = await supabaseAdmin
                .from('guides')
                .select('id, status, views_count, rating_average, created_at');

            if (error) throw error;

            const stats = {
                total: data.length,
                published: data.filter(g => g.status === 'published').length,
                draft: data.filter(g => g.status === 'draft').length,
                deleted: data.filter(g => g.status === 'deleted').length,
                total_views: data.reduce((sum, g) => sum + (g.views_count || 0), 0),
                average_rating: data.length > 0 
                    ? Math.round((data.reduce((sum, g) => sum + (g.rating_average || 0), 0) / data.length) * 10) / 10
                    : 0,
                today: data.filter(g => {
                    const today = new Date();
                    const guideDate = new Date(g.created_at);
                    return guideDate.toDateString() === today.toDateString();
                }).length
            };

            return stats;
        } catch (error) {
            throw new Error(`Failed to get guide stats: ${error.message}`);
        }
    }

    // Search guides
    static async search(query, options = {}) {
        try {
            let searchQuery = supabaseAdmin
                .from('guides')
                .select(`
                    *,
                    author:users(id, username, display_name, avatar_url, role)
                `)
                .eq('status', 'published');

            // Full-text search
            if (query) {
                searchQuery = searchQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`);
            }

            // Apply additional filters
            if (options.category) {
                searchQuery = searchQuery.eq('category', options.category);
            }

            if (options.tags && options.tags.length > 0) {
                searchQuery = searchQuery.overlaps('tags', options.tags);
            }

            // Sorting
            const sortBy = options.sortBy || 'rating_average';
            const sortOrder = options.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
            searchQuery = searchQuery.order(sortBy, sortOrder);

            // Pagination
            if (options.limit) {
                searchQuery = searchQuery.limit(options.limit);
            }

            if (options.offset) {
                searchQuery = searchQuery.range(options.offset, options.offset + (options.limit || 10) - 1);
            }

            const { data, error } = await searchQuery;

            if (error) throw error;
            return data.map(guide => new Guide(guide));
        } catch (error) {
            throw new Error(`Failed to search guides: ${error.message}`);
        }
    }

    // Get related guides
    async getRelated(limit = 5) {
        try {
            const { data, error } = await supabaseAdmin
                .from('guides')
                .select(`
                    *,
                    author:users(id, username, display_name, avatar_url, role)
                `)
                .eq('status', 'published')
                .neq('id', this.id)
                .or(`category.eq.${this.category},tags.ov.{${this.tags.join(',')}}`)
                .order('rating_average', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data.map(guide => new Guide(guide));
        } catch (error) {
            throw new Error(`Failed to get related guides: ${error.message}`);
        }
    }

    // Convert to JSON
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            slug: this.slug,
            content: this.content,
            excerpt: this.excerpt,
            category: this.category,
            tags: this.tags,
            author_id: this.author_id,
            status: this.status,
            featured_image: this.featured_image,
            meta_description: this.meta_description,
            views_count: this.views_count,
            rating_average: this.rating_average,
            rating_count: this.rating_count,
            comments_count: this.comments_count,
            is_featured: this.is_featured,
            published_at: this.published_at,
            created_at: this.created_at,
            updated_at: this.updated_at,
            author: this.author
        };
    }
}

module.exports = Guide; 