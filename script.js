// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentUser = null;
let authToken = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeAuth();
    initializeSearch();
    initializeRating();
    initializeFileUpload();
    initializeVideoForm();
    initializePremiumButtons();
    initializeNavigation();
    initializeTableOfContents();
    initializeSmoothScrolling();
    initializeInteractiveElements();
    initializeProfessionCalculator();
    initializeDelveTracker();
    initializeProgressBars();
    initializeThemeSelector();
    initializeComments();
});

// Authentication Management
async function initializeAuth() {
    try {
        // Check if user is already logged in
        const response = await apiCall('/auth/me', 'GET');
        if (response.success) {
            currentUser = response.user;
            updateUIForLoggedInUser();
        }
    } catch (error) {
        console.log('User not logged in');
    }

    // Add event listeners for auth buttons
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', showRegisterModal);
    }
}

// API Call Helper
async function apiCall(endpoint, method = 'GET', data = null, isFormData = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options = {
        method,
        credentials: 'include', // Include cookies
        headers: {}
    };

    // Add authorization header if we have a token
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Add data for POST/PUT requests
    if (data) {
        if (isFormData) {
            options.body = data;
        } else {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Show Login Modal
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Log In to Wowhead</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="login-form">
                    <div class="form-group">
                        <label for="login-email">Email:</label>
                        <input type="email" id="login-email" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password:</label>
                        <input type="password" id="login-password" required>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="remember-me"> Remember me
                        </label>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">Log In</button>
                        <button type="button" class="btn-secondary" onclick="showRegisterModal(); this.closest('.auth-modal').remove();">Register Instead</button>
                    </div>
                </form>
                <div class="auth-links">
                    <a href="#" onclick="showForgotPasswordModal(); this.closest('.auth-modal').remove();">Forgot Password?</a>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#login-form').addEventListener('submit', handleLogin);

    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Show Register Modal
function showRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create Wowhead Account</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="register-form">
                    <div class="form-group">
                        <label for="register-username">Username:</label>
                        <input type="text" id="register-username" required minlength="3" maxlength="20">
                    </div>
                    <div class="form-group">
                        <label for="register-email">Email:</label>
                        <input type="email" id="register-email" required>
                    </div>
                    <div class="form-group">
                        <label for="register-password">Password:</label>
                        <input type="password" id="register-password" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="register-confirm-password">Confirm Password:</label>
                        <input type="password" id="register-confirm-password" required>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn-primary">Create Account</button>
                        <button type="button" class="btn-secondary" onclick="showLoginModal(); this.closest('.auth-modal').remove();">Log In Instead</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#register-form').addEventListener('submit', handleRegister);

    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    try {
        showNotification('Logging in...', 'info');
        
        const response = await apiCall('/auth/login', 'POST', {
            email,
            password,
            rememberMe
        });

        if (response.success) {
            currentUser = response.user;
            authToken = response.token;
            updateUIForLoggedInUser();
            showNotification('Login successful!', 'success');
            document.querySelector('.auth-modal').remove();
        }
    } catch (error) {
        showNotification(error.message || 'Login failed', 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    try {
        showNotification('Creating account...', 'info');
        
        const response = await apiCall('/auth/register', 'POST', {
            username,
            email,
            password,
            confirmPassword
        });

        if (response.success) {
            currentUser = response.user;
            authToken = response.token;
            updateUIForLoggedInUser();
            showNotification('Account created successfully! Please check your email to verify your account.', 'success');
            document.querySelector('.auth-modal').remove();
        }
    } catch (error) {
        showNotification(error.message || 'Registration failed', 'error');
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    const userActions = document.querySelector('.user-actions');

    if (loginBtn && registerBtn && userActions) {
        userActions.innerHTML = `
            <div class="user-menu">
                <span class="username">Welcome, ${currentUser.username}!</span>
                <button class="logout-btn">Logout</button>
            </div>
        `;

        // Add logout functionality
        userActions.querySelector('.logout-btn').addEventListener('click', handleLogout);
    }

    // Enable comment functionality
    enableCommentFeatures();
}

// Handle Logout
async function handleLogout() {
    try {
        await apiCall('/auth/logout', 'POST');
        currentUser = null;
        authToken = null;
        
        // Reset UI
        const userActions = document.querySelector('.user-actions');
        if (userActions) {
            userActions.innerHTML = `
                <button class="login-btn">Log In</button>
                <button class="register-btn">Register</button>
            `;
            
            // Re-add event listeners
            userActions.querySelector('.login-btn').addEventListener('click', showLoginModal);
            userActions.querySelector('.register-btn').addEventListener('click', showRegisterModal);
        }

        showNotification('Logged out successfully', 'success');
        disableCommentFeatures();
    } catch (error) {
        showNotification('Logout failed', 'error');
    }
}

// Comments System
function initializeComments() {
    loadComments();
    setupCommentForm();
}

async function loadComments() {
    try {
        // For demo purposes, we'll use a fake guide ID
        const guideId = '507f1f77bcf86cd799439011'; // This would be dynamic in a real app
        
        const response = await apiCall(`/comments?guide=${guideId}&sort=newest&limit=10`);
        
        if (response.success) {
            displayComments(response.data.comments);
        }
    } catch (error) {
        console.error('Failed to load comments:', error);
        // Show placeholder comments for demo
        displayPlaceholderComments();
    }
}

function displayComments(comments) {
    const commentsContainer = document.querySelector('.comments-section');
    if (!commentsContainer) return;

    let commentsHTML = `
        <h2>Comments (${comments.length})</h2>
        <div class="comment-form-container">
            ${currentUser ? createCommentForm() : '<p class="login-prompt">Please <a href="#" class="login-link">log in</a> to post a comment.</p>'}
        </div>
        <div class="comments-list">
    `;

    comments.forEach(comment => {
        commentsHTML += createCommentHTML(comment);
    });

    commentsHTML += '</div>';
    
    // Replace the existing comments section content
    const existingContent = commentsContainer.innerHTML;
    commentsContainer.innerHTML = commentsHTML;

    // Add event listeners
    if (currentUser) {
        setupCommentInteractions();
    } else {
        // Add login link functionality
        const loginLinks = commentsContainer.querySelectorAll('.login-link');
        loginLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showLoginModal();
            });
        });
    }
}

function createCommentHTML(comment) {
    const timeAgo = getTimeAgo(new Date(comment.createdAt));
    const userVote = comment.userVote || null;
    
    return `
        <div class="comment" data-comment-id="${comment._id}">
            <div class="comment-header">
                <div class="comment-author">
                    <img src="${comment.author.profile?.avatar || '/default-avatar.png'}" alt="${comment.author.username}" class="avatar">
                    <span class="username">${comment.author.username}</span>
                    ${comment.author.role === 'premium' ? '<span class="premium-badge">Premium</span>' : ''}
                    ${comment.author.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}
                </div>
                <div class="comment-meta">
                    <span class="comment-time">${timeAgo}</span>
                    ${comment.metadata?.edited ? '<span class="edited-indicator">(edited)</span>' : ''}
                </div>
            </div>
            <div class="comment-content">
                <p>${comment.content}</p>
            </div>
            <div class="comment-actions">
                <div class="vote-buttons">
                    <button class="vote-btn upvote ${userVote === 'upvote' ? 'active' : ''}" data-type="upvote">
                        ▲ ${comment.votes?.upvotes?.length || 0}
                    </button>
                    <button class="vote-btn downvote ${userVote === 'downvote' ? 'active' : ''}" data-type="downvote">
                        ▼ ${comment.votes?.downvotes?.length || 0}
                    </button>
                </div>
                <button class="reply-btn">Reply</button>
                ${currentUser && currentUser.id === comment.author._id ? '<button class="edit-btn">Edit</button>' : ''}
                <button class="flag-btn">Flag</button>
            </div>
            <div class="replies">
                ${comment.replies ? comment.replies.map(reply => createReplyHTML(reply)).join('') : ''}
            </div>
        </div>
    `;
}

function createReplyHTML(reply) {
    const timeAgo = getTimeAgo(new Date(reply.createdAt));
    
    return `
        <div class="reply" data-comment-id="${reply._id}">
            <div class="comment-header">
                <div class="comment-author">
                    <img src="${reply.author.profile?.avatar || '/default-avatar.png'}" alt="${reply.author.username}" class="avatar">
                    <span class="username">${reply.author.username}</span>
                </div>
                <div class="comment-meta">
                    <span class="comment-time">${timeAgo}</span>
                </div>
            </div>
            <div class="comment-content">
                <p>${reply.content}</p>
            </div>
        </div>
    `;
}

function createCommentForm() {
    return `
        <form class="comment-form" id="comment-form">
            <div class="form-group">
                <textarea id="comment-content" placeholder="Share your thoughts..." rows="4" maxlength="2000" required></textarea>
                <div class="character-count">0/2000</div>
            </div>
            <div class="form-actions">
                <button type="submit" class="submit-comment-btn">Post Comment</button>
            </div>
        </form>
    `;
}

function setupCommentForm() {
    document.addEventListener('submit', async function(e) {
        if (e.target.id === 'comment-form') {
            e.preventDefault();
            await handleCommentSubmit(e.target);
        }
    });

    // Character counter
    document.addEventListener('input', function(e) {
        if (e.target.id === 'comment-content') {
            const counter = e.target.parentNode.querySelector('.character-count');
            if (counter) {
                counter.textContent = `${e.target.value.length}/2000`;
            }
        }
    });
}

async function handleCommentSubmit(form) {
    if (!currentUser) {
        showNotification('Please log in to post a comment', 'error');
        return;
    }

    const content = form.querySelector('#comment-content').value.trim();
    if (!content) {
        showNotification('Please enter a comment', 'error');
        return;
    }

    try {
        showNotification('Posting comment...', 'info');
        
        const response = await apiCall('/comments', 'POST', {
            content,
            guide: '507f1f77bcf86cd799439011' // Demo guide ID
        });

        if (response.success) {
            showNotification('Comment posted successfully!', 'success');
            form.reset();
            loadComments(); // Reload comments
        }
    } catch (error) {
        showNotification(error.message || 'Failed to post comment', 'error');
    }
}

function setupCommentInteractions() {
    // Vote buttons
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('vote-btn')) {
            await handleCommentVote(e.target);
        }
    });

    // Reply buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('reply-btn')) {
            showReplyForm(e.target);
        }
    });

    // Flag buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('flag-btn')) {
            showFlagModal(e.target);
        }
    });
}

async function handleCommentVote(button) {
    if (!currentUser) {
        showNotification('Please log in to vote', 'error');
        return;
    }

    const comment = button.closest('.comment');
    const commentId = comment.dataset.commentId;
    const voteType = button.dataset.type;
    const isActive = button.classList.contains('active');

    try {
        const response = await apiCall(`/comments/${commentId}/vote`, 'POST', {
            type: isActive ? 'remove' : voteType
        });

        if (response.success) {
            // Update UI
            const upvoteBtn = comment.querySelector('.vote-btn.upvote');
            const downvoteBtn = comment.querySelector('.vote-btn.downvote');
            
            upvoteBtn.classList.remove('active');
            downvoteBtn.classList.remove('active');
            
            if (!isActive) {
                button.classList.add('active');
            }

            // Update vote counts (you'd get these from the response)
            updateVoteCounts(comment, response.data);
        }
    } catch (error) {
        showNotification(error.message || 'Failed to vote', 'error');
    }
}

function updateVoteCounts(comment, voteData) {
    const upvoteBtn = comment.querySelector('.vote-btn.upvote');
    const downvoteBtn = comment.querySelector('.vote-btn.downvote');
    
    if (upvoteBtn && downvoteBtn) {
        upvoteBtn.innerHTML = `▲ ${voteData.upvotes || 0}`;
        downvoteBtn.innerHTML = `▼ ${voteData.downvotes || 0}`;
    }
}

function enableCommentFeatures() {
    // Enable comment form and interactions
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(form => {
        form.style.display = 'block';
    });
}

function disableCommentFeatures() {
    // Disable comment features for non-logged-in users
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(form => {
        form.style.display = 'none';
    });
}

function displayPlaceholderComments() {
    // Show some placeholder comments for demo purposes
    const placeholderComments = [
        {
            _id: 'demo1',
            content: 'Great guide! The War Within expansion looks amazing. Can\'t wait to explore Khaz Algar!',
            author: {
                _id: 'user1',
                username: 'WoWPlayer123',
                profile: { avatar: null },
                role: 'user'
            },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            votes: { upvotes: [1, 2, 3], downvotes: [] },
            replies: []
        },
        {
            _id: 'demo2',
            content: 'The Hero Talents system sounds really interesting. I love how they\'re adding more customization options.',
            author: {
                _id: 'user2',
                username: 'TalentMaster',
                profile: { avatar: null },
                role: 'premium'
            },
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            votes: { upvotes: [1, 2], downvotes: [] },
            replies: []
        }
    ];

    displayComments(placeholderComments);
}

// Utility function to get time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

// Initialize theme selector
function initializeThemeSelector() {
    const themeSelect = document.getElementById('theme-select');
    
    if (themeSelect) {
        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        themeSelect.value = savedTheme;
        applyTheme(savedTheme);
        
        // Handle theme changes
        themeSelect.addEventListener('change', function() {
            const selectedTheme = this.value;
            applyTheme(selectedTheme);
            localStorage.setItem('theme', selectedTheme);
            
            showNotification(`Theme changed to ${selectedTheme}`, 'success');
        });
    }
    
    // Initialize floating theme toggle after a delay
    setTimeout(initializeThemeToggle, 1000);
}

function applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
    } else if (theme === 'light') {
        body.classList.remove('dark-theme');
    } else if (theme === 'auto') {
        // Auto theme based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem('theme') === 'auto') {
                if (e.matches) {
                    body.classList.add('dark-theme');
                } else {
                    body.classList.remove('dark-theme');
                }
            }
        });
    }
}

// Initialize floating theme toggle
function initializeThemeToggle() {
    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle';
    themeBtn.innerHTML = '🎨';
    themeBtn.title = 'Quick Theme Toggle';
    themeBtn.style.position = 'fixed';
    themeBtn.style.bottom = '20px';
    themeBtn.style.right = '20px';
    themeBtn.style.width = '50px';
    themeBtn.style.height = '50px';
    themeBtn.style.borderRadius = '50%';
    themeBtn.style.border = 'none';
    themeBtn.style.background = '#333';
    themeBtn.style.color = 'white';
    themeBtn.style.fontSize = '20px';
    themeBtn.style.cursor = 'pointer';
    themeBtn.style.zIndex = '1000';
    themeBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    
    document.body.appendChild(themeBtn);
    
    themeBtn.addEventListener('click', function() {
        const themeSelect = document.getElementById('theme-select');
        const currentTheme = themeSelect.value;
        
        // Cycle through themes: light -> dark -> auto -> light
        let nextTheme;
        if (currentTheme === 'light') {
            nextTheme = 'dark';
        } else if (currentTheme === 'dark') {
            nextTheme = 'auto';
        } else {
            nextTheme = 'light';
        }
        
        themeSelect.value = nextTheme;
        applyTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        
        // Update button icon based on theme
        updateThemeToggleIcon(nextTheme);
        
        showNotification(`Theme: ${nextTheme}`, 'info');
    });
    
    // Set initial icon
    updateThemeToggleIcon(localStorage.getItem('theme') || 'light');
}

function updateThemeToggleIcon(theme) {
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        const icons = {
            light: '☀️',
            dark: '🌙',
            auto: '🔄'
        };
        themeBtn.innerHTML = icons[theme] || '🎨';
    }
}

// Enhanced Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        // Handle search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Handle search button click
        searchBtn.addEventListener('click', performSearch);
        
        // Real-time search suggestions
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            if (query.length > 2) {
                showSearchSuggestions(query);
            } else {
                hideSearchSuggestions();
            }
        });
    }
}

async function performSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.trim();
    
    if (query) {
        try {
            showNotification('Searching...', 'info');
            
            const response = await apiCall(`/search?q=${encodeURIComponent(query)}&type=all&limit=10`);
            
            if (response.success) {
                // Highlight matching content on page
                highlightSearchResults(query);
                showNotification(`Found ${response.data.results.length} results for "${query}"`, 'success');
            }
        } catch (error) {
            console.error('Search failed:', error);
            // Fallback to client-side search
            highlightSearchResults(query);
            showNotification(`Searching for "${query}" (offline mode)`, 'info');
        }
    }
}

function highlightSearchResults(query) {
    const content = document.querySelector('.article-content');
    const text = content.innerHTML;
    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = text.replace(regex, '<mark class="search-highlight">$1</mark>');
    content.innerHTML = highlighted;
    
    // Remove highlights after 5 seconds
    setTimeout(() => {
        const highlights = document.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            highlight.outerHTML = highlight.innerHTML;
        });
    }, 5000);
}

function showSearchSuggestions(query) {
    const suggestions = [
        'Hero Talents', 'Delves', 'Professions', 'Earthen', 'Warbands',
        'Nerub-ar Palace', 'Khaz Algar', 'Dynamic Flying', 'Season 2',
        'Liberation of Undermine', 'Mythic+', 'Horrific Visions'
    ];
    
    const filtered = suggestions.filter(s => s.toLowerCase().includes(query));
    
    if (filtered.length > 0) {
        let suggestionHTML = '<div class="search-suggestions">';
        filtered.forEach(suggestion => {
            suggestionHTML += `<div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">${suggestion}</div>`;
        });
        suggestionHTML += '</div>';
        
        const searchContainer = document.querySelector('.search-container');
        let existingSuggestions = searchContainer.querySelector('.search-suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }
        searchContainer.insertAdjacentHTML('afterend', suggestionHTML);
    }
}

function selectSuggestion(suggestion) {
    const searchInput = document.querySelector('.search-input');
    searchInput.value = suggestion;
    hideSearchSuggestions();
    performSearch();
}

function hideSearchSuggestions() {
    const suggestions = document.querySelector('.search-suggestions');
    if (suggestions) {
        suggestions.remove();
    }
}

// Table of Contents Generator
function initializeTableOfContents() {
    const headings = document.querySelectorAll('.content-section h2, .content-section h3');
    const tocContainer = document.querySelector('.guide-contents');
    
    if (headings.length > 0 && tocContainer) {
        let tocHTML = '<div class="table-of-contents"><h4>Quick Navigation</h4><ul>';
        
        headings.forEach((heading, index) => {
            const id = `section-${index}`;
            heading.id = id;
            const level = heading.tagName === 'H2' ? 'toc-h2' : 'toc-h3';
            tocHTML += `<li class="${level}"><a href="#${id}" class="toc-link">${heading.textContent}</a></li>`;
        });
        
        tocHTML += '</ul></div>';
        tocContainer.insertAdjacentHTML('beforeend', tocHTML);
    }
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Interactive Elements
function initializeInteractiveElements() {
    // Expandable sections
    const expandableHeaders = document.querySelectorAll('.content-section h3');
    expandableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const nextElement = this.nextElementSibling;
            if (nextElement) {
                nextElement.style.display = nextElement.style.display === 'none' ? 'block' : 'none';
                this.classList.toggle('collapsed');
            }
        });
    });
    
    // Tooltip functionality
    initializeTooltips();
    
    // Progress tracking
    initializeReadingProgress();
}

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('strong');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const text = this.textContent;
            const tooltip = getTooltipContent(text);
            if (tooltip) {
                showTooltip(e, tooltip);
            }
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function getTooltipContent(text) {
    const tooltips = {
        'Hero Talents': 'New talent trees that unlock at level 71, providing 10 talent points from levels 71-80',
        'Delves': 'Solo or small group content for 1-4 players with scalable difficulty',
        'Warbands': 'Account-wide progression system that shares resources between characters',
        'Dynamic Flying': 'Enhanced dragonriding system available across all zones',
        'Earthen': 'New allied race of titan-forged beings made of living stone',
        'Concentration': 'Resource that guarantees higher quality crafts when spent',
        'Blasphemite': 'Rare crafting material created through alchemy transmutation'
    };
    
    return tooltips[text] || null;
}

function showTooltip(event, content) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = content;
    tooltip.style.position = 'absolute';
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY - 30 + 'px';
    tooltip.style.background = '#333';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.zIndex = '1000';
    tooltip.style.maxWidth = '200px';
    tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    
    document.body.appendChild(tooltip);
}

function hideTooltip() {
    const tooltip = document.querySelector('.custom-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Reading Progress
function initializeReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.width = '0%';
    progressBar.style.height = '3px';
    progressBar.style.background = 'linear-gradient(45deg, #ff6b35, #f7931e)';
    progressBar.style.zIndex = '1001';
    progressBar.style.transition = 'width 0.3s ease';
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Profession Calculator
function initializeProfessionCalculator() {
    const professionSection = document.querySelector('.content-section h2[textContent*="Professions"]');
    if (professionSection) {
        const calculator = createProfessionCalculator();
        professionSection.parentNode.insertAdjacentHTML('beforeend', calculator);
        
        // Add calculator functionality
        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('profession-select')) {
                updateProfessionInfo(e.target.value);
            }
        });
    }
}

function createProfessionCalculator() {
    return `
        <div class="profession-calculator">
            <h4>Profession Planner</h4>
            <div class="calculator-content">
                <div class="profession-selector">
                    <label for="profession-select">Choose Profession:</label>
                    <select id="profession-select" class="profession-select">
                        <option value="">Select a profession...</option>
                        <option value="alchemy">Alchemy</option>
                        <option value="blacksmithing">Blacksmithing</option>
                        <option value="enchanting">Enchanting</option>
                        <option value="engineering">Engineering</option>
                        <option value="herbalism">Herbalism</option>
                        <option value="inscription">Inscription</option>
                        <option value="jewelcrafting">Jewelcrafting</option>
                        <option value="leatherworking">Leatherworking</option>
                        <option value="mining">Mining</option>
                        <option value="skinning">Skinning</option>
                        <option value="tailoring">Tailoring</option>
                    </select>
                </div>
                <div id="profession-info" class="profession-info"></div>
            </div>
        </div>
    `;
}

function updateProfessionInfo(profession) {
    const infoDiv = document.getElementById('profession-info');
    const professionData = {
        alchemy: {
            type: 'Crafting',
            specializations: ['Thaumaturgy', 'Potent Potions', 'Fantastic Flasks'],
            keyFeature: 'Blasphemite creation through transmutation',
            difficulty: 'Medium'
        },
        herbalism: {
            type: 'Gathering',
            specializations: ['Bountiful Harvests', 'Botany', 'Overloading the Underground'],
            keyFeature: 'Null Lotus gathering for flask creation',
            difficulty: 'Easy'
        },
        blacksmithing: {
            type: 'Crafting',
            specializations: ['Means of Production', 'Armorsmithing', 'Weaponsmithing'],
            keyFeature: 'Profession equipment and plate armor',
            difficulty: 'Hard'
        }
    };
    
    if (profession && professionData[profession]) {
        const data = professionData[profession];
        infoDiv.innerHTML = `
            <div class="profession-details">
                <h5>${profession.charAt(0).toUpperCase() + profession.slice(1)}</h5>
                <p><strong>Type:</strong> ${data.type}</p>
                <p><strong>Difficulty:</strong> ${data.difficulty}</p>
                <p><strong>Key Feature:</strong> ${data.keyFeature}</p>
                <p><strong>Specializations:</strong></p>
                <ul>
                    ${data.specializations.map(spec => `<li>${spec}</li>`).join('')}
                </ul>
            </div>
        `;
    } else {
        infoDiv.innerHTML = '';
    }
}

// Delve Tracker
function initializeDelveTracker() {
    const delveSection = document.querySelector('.delve-list');
    if (delveSection) {
        const tracker = createDelveTracker();
        delveSection.insertAdjacentHTML('afterend', tracker);
        
        // Add tracking functionality
        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('delve-checkbox')) {
                updateDelveProgress();
            }
        });
    }
}

function createDelveTracker() {
    const delves = [
        'The Dread Pit', 'Earthcrawl Mines', 'Fungal Folly', 'Kriegval\'s Rest',
        'Mycomancer Cavern', 'Nightfall Sanctum', 'The Sinkhole', 'Skittering Breach',
        'The Spiral Weave', 'Tak-Rethan Abyss', 'The Underkeep', 'The Waterworks'
    ];
    
    let trackerHTML = `
        <div class="delve-tracker">
            <h4>Delve Progress Tracker</h4>
            <div class="progress-summary">
                <span id="delve-progress">0/${delves.length} Completed</span>
                <div class="progress-bar-container">
                    <div id="delve-progress-bar" class="progress-bar"></div>
                </div>
            </div>
            <div class="delve-checklist">
    `;
    
    delves.forEach((delve, index) => {
        trackerHTML += `
            <label class="delve-item">
                <input type="checkbox" class="delve-checkbox" data-delve="${index}">
                <span class="checkmark"></span>
                ${delve}
            </label>
        `;
    });
    
    trackerHTML += '</div></div>';
    return trackerHTML;
}

function updateDelveProgress() {
    const checkboxes = document.querySelectorAll('.delve-checkbox');
    const completed = document.querySelectorAll('.delve-checkbox:checked').length;
    const total = checkboxes.length;
    const percentage = (completed / total) * 100;
    
    document.getElementById('delve-progress').textContent = `${completed}/${total} Completed`;
    document.getElementById('delve-progress-bar').style.width = percentage + '%';
    
    // Save progress to localStorage
    const progress = Array.from(checkboxes).map(cb => cb.checked);
    localStorage.setItem('delveProgress', JSON.stringify(progress));
}

// Progress Bars for various sections
function initializeProgressBars() {
    // Load saved delve progress
    const savedProgress = localStorage.getItem('delveProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const checkboxes = document.querySelectorAll('.delve-checkbox');
        checkboxes.forEach((checkbox, index) => {
            if (progress[index]) {
                checkbox.checked = true;
            }
        });
        updateDelveProgress();
    }
}

// Rating functionality
function initializeRating() {
    const stars = document.querySelectorAll('.star');
    const ratingText = document.querySelector('.rating-text');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = index + 1;
            updateRating(rating);
            showNotification(`You rated this guide ${rating}/5 stars!`, 'success');
        });
        
        star.addEventListener('mouseenter', function() {
            highlightStars(index + 1);
        });
    });
    
    const starsContainer = document.querySelector('.stars');
    if (starsContainer) {
        starsContainer.addEventListener('mouseleave', function() {
            resetStars();
        });
    }
}

function updateRating(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.remove('filled', 'half');
        if (index < rating) {
            star.classList.add('filled');
        }
    });
    
    // Update rating text
    const ratingText = document.querySelector('.rating-text');
    if (ratingText) {
        const votes = Math.floor(Math.random() * 50) + 20; // Random vote count
        ratingText.textContent = `${rating}/5 (${votes} Votes)`;
    }
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.style.opacity = index < rating ? '1' : '0.3';
    });
}

function resetStars() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.style.opacity = '1';
    });
}

// File Upload functionality
function initializeFileUpload() {
    const fileInput = document.getElementById('screenshot-upload');
    const uploadBtn = document.querySelector('.upload-btn');
    
    if (fileInput && uploadBtn) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                handleFileUpload(file);
            }
        });
    }
}

async function handleFileUpload(file) {
    if (!currentUser) {
        showNotification('Please log in to upload files', 'error');
        return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Please upload a valid image file (JPEG, PNG, GIF, WebP)', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }
    
    try {
        showNotification('Uploading screenshot...', 'info');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiCall('/uploads/image', 'POST', formData, true);
        
        if (response.success) {
            showNotification('Screenshot uploaded successfully!', 'success');
        }
    } catch (error) {
        showNotification(error.message || 'Upload failed', 'error');
    }
}

// Video Form functionality
function initializeVideoForm() {
    const submitBtn = document.querySelector('.submit-btn');
    const videoUrl = document.getElementById('video-url');
    const videoTitle = document.getElementById('video-title');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleVideoSubmission();
        });
    }
}

function handleVideoSubmission() {
    const videoUrl = document.getElementById('video-url').value;
    const videoTitle = document.getElementById('video-title').value;
    
    if (!videoUrl) {
        showNotification('Please enter a YouTube URL', 'error');
        return;
    }
    
    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(videoUrl)) {
        showNotification('Please enter a valid YouTube URL', 'error');
        return;
    }
    
    // Simulate submission
    showNotification('Submitting video for review...', 'info');
    
    setTimeout(() => {
        showNotification('Video submitted successfully! It will be reviewed before appearing on the site.', 'success');
        document.getElementById('video-url').value = '';
        document.getElementById('video-title').value = '';
    }, 1500);
}

// Premium button functionality
function initializePremiumButtons() {
    const premiumBtns = document.querySelectorAll('.premium-btn, .premium-cta');
    
    premiumBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showPremiumModal();
        });
    });
}

function showPremiumModal() {
    const modal = document.createElement('div');
    modal.className = 'premium-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Wowhead Premium</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <h4>Get Wowhead Premium for just $2/month!</h4>
                <ul>
                    <li>✓ Ad-free browsing experience</li>
                    <li>✓ Premium tooltips and enhanced features</li>
                    <li>✓ Priority customer support</li>
                    <li>✓ Exclusive premium guides and content</li>
                    <li>✓ Advanced character planning tools</li>
                </ul>
                <div class="modal-actions">
                    <button class="btn-premium">Subscribe Now</button>
                    <button class="btn-cancel">Maybe Later</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('.btn-premium').addEventListener('click', () => {
        showNotification('Redirecting to premium subscription...', 'info');
        modal.remove();
    });
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const linkText = this.textContent;
            showNotification(`Navigating to ${linkText}...`, 'info');
        });
    });
    
    // Mobile menu toggle (if needed)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('mobile-open');
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '6px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '10000';
    notification.style.maxWidth = '300px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease';
    
    // Set background color based on type
    const colors = {
        info: '#007bff',
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 