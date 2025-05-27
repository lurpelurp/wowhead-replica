const { supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.username = data.username;
        this.display_name = data.display_name;
        this.avatar_url = data.avatar_url;
        this.is_premium = data.is_premium || false;
        this.role = data.role || 'user';
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.last_login = data.last_login;
        this.is_active = data.is_active !== false;
        this.email_verified = data.email_verified || false;
    }

    // Create a new user
    static async create(userData) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            
            const { data, error } = await supabaseAdmin
                .from('users')
                .insert([{
                    email: userData.email,
                    username: userData.username,
                    display_name: userData.display_name || userData.username,
                    password_hash: hashedPassword,
                    role: userData.role || 'user',
                    is_active: true,
                    email_verified: false
                }])
                .select()
                .single();

            if (error) throw error;
            return new User(data);
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }
            return new User(data);
        } catch (error) {
            throw new Error(`Failed to find user: ${error.message}`);
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }
            return new User(data);
        } catch (error) {
            throw new Error(`Failed to find user by email: ${error.message}`);
        }
    }

    // Find user by username
    static async findByUsername(username) {
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }
            return new User(data);
        } catch (error) {
            throw new Error(`Failed to find user by username: ${error.message}`);
        }
    }

    // Verify password
    async verifyPassword(password) {
        try {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('password_hash')
                .eq('id', this.id)
                .single();

            if (error) throw error;
            return await bcrypt.compare(password, data.password_hash);
        } catch (error) {
            throw new Error(`Failed to verify password: ${error.message}`);
        }
    }

    // Update user
    async update(updateData) {
        try {
            const allowedFields = ['display_name', 'avatar_url', 'is_premium', 'role', 'is_active', 'email_verified', 'last_login'];
            const filteredData = {};
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }

            filteredData.updated_at = new Date().toISOString();

            const { data, error } = await supabaseAdmin
                .from('users')
                .update(filteredData)
                .eq('id', this.id)
                .select()
                .single();

            if (error) throw error;
            
            // Update current instance
            Object.assign(this, data);
            return this;
        } catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    // Update password
    async updatePassword(newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            
            const { error } = await supabaseAdmin
                .from('users')
                .update({ 
                    password_hash: hashedPassword,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.id);

            if (error) throw error;
            return true;
        } catch (error) {
            throw new Error(`Failed to update password: ${error.message}`);
        }
    }

    // Delete user (soft delete)
    async delete() {
        try {
            const { error } = await supabaseAdmin
                .from('users')
                .update({ 
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.id);

            if (error) throw error;
            this.is_active = false;
            return true;
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    // Get user stats
    async getStats() {
        try {
            const { data: comments, error: commentsError } = await supabaseAdmin
                .from('comments')
                .select('id')
                .eq('user_id', this.id);

            const { data: ratings, error: ratingsError } = await supabaseAdmin
                .from('ratings')
                .select('id')
                .eq('user_id', this.id);

            if (commentsError || ratingsError) {
                throw new Error('Failed to fetch user stats');
            }

            return {
                comments_count: comments?.length || 0,
                ratings_count: ratings?.length || 0,
                member_since: this.created_at
            };
        } catch (error) {
            throw new Error(`Failed to get user stats: ${error.message}`);
        }
    }

    // Get all users (admin only)
    static async findAll(options = {}) {
        try {
            let query = supabaseAdmin
                .from('users')
                .select('*');

            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }

            if (options.role) {
                query = query.eq('role', options.role);
            }

            if (options.is_active !== undefined) {
                query = query.eq('is_active', options.is_active);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data.map(user => new User(user));
        } catch (error) {
            throw new Error(`Failed to find users: ${error.message}`);
        }
    }

    // Convert to JSON (exclude sensitive data)
    toJSON() {
        return {
            id: this.id,
            email: this.email,
            username: this.username,
            display_name: this.display_name,
            avatar_url: this.avatar_url,
            is_premium: this.is_premium,
            role: this.role,
            created_at: this.created_at,
            updated_at: this.updated_at,
            last_login: this.last_login,
            is_active: this.is_active,
            email_verified: this.email_verified
        };
    }
}

module.exports = User; 