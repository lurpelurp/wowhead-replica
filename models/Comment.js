const { supabaseAdmin } = require('../config/supabase');

class Comment {
    constructor(data) {
        this.id = data.id;
        this.content = data.content;
        this.user_id = data.user_id;
        this.guide_id = data.guide_id;
        this.parent_id = data.parent_id;
        this.is_approved = data.is_approved !== false;
        this.is_deleted = data.is_deleted || false;
        this.likes_count = data.likes_count || 0;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        
        // Joined data
        this.user = data.user;
        this.replies = data.replies || [];
    }

    // Create a new comment
    static async create(commentData) {
        try {
            const { data, error } = await supabaseAdmin
                .from('comments')
                .insert([{
                    content: commentData.content,
                    user_id: commentData.user_id,
                    guide_id: commentData.guide_id,
                    parent_id: commentData.parent_id || null,
                    is_approved: true // Auto-approve for now
                }])
                .select(`
                    *,
                    user:users(id, username, display_name, avatar_url, role)
                `)
                .single();

            if (error) throw error;
            return new Comment(data);
        } catch (error) {
            throw new Error(`Failed to create comment: ${error.message}`);
        }
    }

    // Find comment by ID
    static async findById(id) {
        try {
            const { data, error } = await supabaseAdmin
                .from('comments')
                .select(`
                    *,
                    user:users(id, username, display_name, avatar_url, role)
                `)
                .eq('id', id)
                .eq('is_deleted', false)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            return new Comment(data);
        } catch (error) {
            throw new Error(`Failed to find comment: ${error.message}`);
        }
    }

    // Get comments for a guide
    static async findByGuideId(guideId, options = {}) {
        try {
            let query = supabaseAdmin
                .from('comments')
                .select(`
                    *,
                    user:users(id, username, display_name, avatar_url, role)
                `)
                .eq('guide_id', guideId)
                .eq('is_deleted', false)
                .eq('is_approved', true);

            // Only get top-level comments if not specified
            if (options.includeReplies !== true) {
                query = query.is('parent_id', null);
            }

            if (options.limit) {
                query = query.limit(options.limit);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            const comments = data.map(comment => new Comment(comment));

            // If including replies, organize them hierarchically
            if (options.includeReplies) {
                return this.organizeCommentHierarchy(comments);
            }

            return comments;
        } catch (error) {
            throw new Error(`Failed to find comments: ${error.message}`);
        }
    }

    // Get replies for a comment
    static async getReplies(parentId) {
        try {
            const { data, error } = await supabaseAdmin
                .from('comments')
                .select(`
                    *,
                    user:users(id, username, display_name, avatar_url, role)
                `)
                .eq('parent_id', parentId)
                .eq('is_deleted', false)
                .eq('is_approved', true)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data.map(comment => new Comment(comment));
        } catch (error) {
            throw new Error(`Failed to get replies: ${error.message}`);
        }
    }

    // Organize comments into hierarchy
    static organizeCommentHierarchy(comments) {
        const commentMap = new Map();
        const topLevelComments = [];

        // First pass: create map and identify top-level comments
        comments.forEach(comment => {
            commentMap.set(comment.id, comment);
            if (!comment.parent_id) {
                topLevelComments.push(comment);
            }
        });

        // Second pass: attach replies to their parents
        comments.forEach(comment => {
            if (comment.parent_id) {
                const parent = commentMap.get(comment.parent_id);
                if (parent) {
                    if (!parent.replies) parent.replies = [];
                    parent.replies.push(comment);
                }
            }
        });

        return topLevelComments;
    }

    // Update comment
    async update(updateData) {
        try {
            const allowedFields = ['content', 'is_approved'];
            const filteredData = {};
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }

            filteredData.updated_at = new Date().toISOString();

            const { data, error } = await supabaseAdmin
                .from('comments')
                .update(filteredData)
                .eq('id', this.id)
                .select(`
                    *,
                    user:users(id, username, display_name, avatar_url, role)
                `)
                .single();

            if (error) throw error;
            
            Object.assign(this, data);
            return this;
        } catch (error) {
            throw new Error(`Failed to update comment: ${error.message}`);
        }
    }

    // Soft delete comment
    async delete() {
        try {
            const { error } = await supabaseAdmin
                .from('comments')
                .update({ 
                    is_deleted: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.id);

            if (error) throw error;
            this.is_deleted = true;
            return true;
        } catch (error) {
            throw new Error(`Failed to delete comment: ${error.message}`);
        }
    }

    // Like/unlike comment
    async toggleLike(userId) {
        try {
            // Check if user already liked this comment
            const { data: existingLike, error: checkError } = await supabaseAdmin
                .from('comment_likes')
                .select('id')
                .eq('comment_id', this.id)
                .eq('user_id', userId)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingLike) {
                // Unlike - remove the like
                const { error: deleteError } = await supabaseAdmin
                    .from('comment_likes')
                    .delete()
                    .eq('id', existingLike.id);

                if (deleteError) throw deleteError;

                // Decrement likes count
                const { error: updateError } = await supabaseAdmin
                    .from('comments')
                    .update({ likes_count: Math.max(0, this.likes_count - 1) })
                    .eq('id', this.id);

                if (updateError) throw updateError;
                
                this.likes_count = Math.max(0, this.likes_count - 1);
                return { liked: false, likes_count: this.likes_count };
            } else {
                // Like - add the like
                const { error: insertError } = await supabaseAdmin
                    .from('comment_likes')
                    .insert([{
                        comment_id: this.id,
                        user_id: userId
                    }]);

                if (insertError) throw insertError;

                // Increment likes count
                const { error: updateError } = await supabaseAdmin
                    .from('comments')
                    .update({ likes_count: this.likes_count + 1 })
                    .eq('id', this.id);

                if (updateError) throw updateError;
                
                this.likes_count += 1;
                return { liked: true, likes_count: this.likes_count };
            }
        } catch (error) {
            throw new Error(`Failed to toggle like: ${error.message}`);
        }
    }

    // Get user's comments
    static async findByUserId(userId, options = {}) {
        try {
            let query = supabaseAdmin
                .from('comments')
                .select(`
                    *,
                    user:users(id, username, display_name, avatar_url, role)
                `)
                .eq('user_id', userId)
                .eq('is_deleted', false);

            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            return data.map(comment => new Comment(comment));
        } catch (error) {
            throw new Error(`Failed to find user comments: ${error.message}`);
        }
    }

    // Get comment statistics
    static async getStats() {
        try {
            const { data, error } = await supabaseAdmin
                .from('comments')
                .select('id, is_approved, is_deleted, created_at');

            if (error) throw error;

            const stats = {
                total: data.length,
                approved: data.filter(c => c.is_approved && !c.is_deleted).length,
                pending: data.filter(c => !c.is_approved && !c.is_deleted).length,
                deleted: data.filter(c => c.is_deleted).length,
                today: data.filter(c => {
                    const today = new Date();
                    const commentDate = new Date(c.created_at);
                    return commentDate.toDateString() === today.toDateString();
                }).length
            };

            return stats;
        } catch (error) {
            throw new Error(`Failed to get comment stats: ${error.message}`);
        }
    }

    // Convert to JSON
    toJSON() {
        return {
            id: this.id,
            content: this.content,
            user_id: this.user_id,
            guide_id: this.guide_id,
            parent_id: this.parent_id,
            is_approved: this.is_approved,
            is_deleted: this.is_deleted,
            likes_count: this.likes_count,
            created_at: this.created_at,
            updated_at: this.updated_at,
            user: this.user,
            replies: this.replies
        };
    }
}

module.exports = Comment; 