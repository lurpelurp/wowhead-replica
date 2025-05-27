// Database page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Category button functionality
    const categoryButtons = document.querySelectorAll('.category-btn');
    const searchInput = document.querySelector('.advanced-search-input');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update search placeholder
            const category = this.dataset.category;
            updateSearchPlaceholder(category);
        });
    });
    
    function updateSearchPlaceholder(category) {
        const placeholders = {
            'items': 'Search for items (e.g., "Ashkandur", "sword", "plate helmet")',
            'spells': 'Search for spells (e.g., "Fireball", "healing", "frost")',
            'npcs': 'Search for NPCs (e.g., "Thrall", "vendor", "quest giver")',
            'quests': 'Search for quests (e.g., "The War Within", "daily", "raid")',
            'zones': 'Search for zones (e.g., "Khaz Algar", "dungeon", "raid")',
            'achievements': 'Search for achievements (e.g., "meta", "exploration", "pvp")'
        };
        
        if (searchInput && placeholders[category]) {
            searchInput.placeholder = placeholders[category];
        }
    }
    
    // Search functionality
    const searchButton = document.querySelector('.advanced-search-btn');
    const databaseSearch = document.querySelector('#database-search');
    
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            performSearch();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (databaseSearch) {
        databaseSearch.addEventListener('input', function() {
            showSearchSuggestions(this.value);
        });
    }
    
    function performSearch() {
        const activeCategory = document.querySelector('.category-btn.active');
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            alert('Please enter a search term');
            return;
        }
        
        const category = activeCategory ? activeCategory.dataset.category : 'items';
        
        // In a real application, this would make an API call
        console.log(`Searching for "${searchTerm}" in category "${category}"`);
        
        // Show loading state
        searchButton.textContent = 'Searching...';
        searchButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            searchButton.textContent = 'Search Database';
            searchButton.disabled = false;
            
            // Show mock results
            showSearchResults(searchTerm, category);
        }, 1000);
    }
    
    function showSearchSuggestions(query) {
        const suggestionsContainer = document.querySelector('#search-suggestions');
        
        if (!query || query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        // Mock suggestions
        const mockSuggestions = [
            'Ashkandur, Fall of the Brotherhood',
            'Void-Touched Plate Helm',
            'Ring of Earthen Might',
            'Nerub-ar Palace',
            'The War Within'
        ].filter(item => item.toLowerCase().includes(query.toLowerCase()));
        
        if (mockSuggestions.length > 0) {
            suggestionsContainer.innerHTML = mockSuggestions
                .map(suggestion => `<div class="suggestion-item">${suggestion}</div>`)
                .join('');
            suggestionsContainer.style.display = 'block';
            
            // Add click handlers to suggestions
            suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', function() {
                    databaseSearch.value = this.textContent;
                    suggestionsContainer.style.display = 'none';
                });
            });
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }
    
    function showSearchResults(searchTerm, category) {
        // In a real application, this would display actual search results
        // For now, we'll just show an alert
        alert(`Search results for "${searchTerm}" in ${category} would appear here.`);
    }
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        const suggestionsContainer = document.querySelector('#search-suggestions');
        const searchContainer = document.querySelector('.search-container');
        
        if (suggestionsContainer && !searchContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Category card hover effects
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px)';
        });
    });
}); 