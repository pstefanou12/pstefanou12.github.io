// Fetch and load UFC cards data
async function loadCards() {
    try {
        const ufcJSonPath = './js/ufc_cards.json'; 
        const response = await fetch(ufcJSonPath);
        const data = await response.json();
          
        // // Display top 5 rated cards
        displayTopRated(data.cards);
          
        // Display all recap cards (sorted by date, newest first)
        displayRecapCards(data.cards);
          
        // Display preview cards
        displayPreviewCards(data.cards);
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getRatingClass(rating) {
    if (rating >= 7.0) return 'good';
    if (rating >= 6.0) return 'average';
    return 'average';
}

function createCardHTML(card, isPreview = false, ranking = null) {
    const displayTitle = card.subtitle ? `${card.title}: ${card.subtitle}` : card.title;
        
    if (isPreview) {
        return `
        <a href="${card.previewUrl}" class="blog-post preview">
            <img src="${card.poster}" alt="${card.title} Poster">
            <div class="blog-info">
            <h3>${card.title} Preview</h3>
            </div>
        </a>
        `;
    }
    
    // Add ranking badge if provided
    const rankingBadge = ranking ? `<div class="ranking-badge">#${ranking}</div>` : '';
        
    return `
        <a href="${card.recapUrl}" class="blog-post">
        ${rankingBadge}
        <img src="${card.poster}" alt="${card.title} Poster">
        <div class="blog-info">
            <h3>${card.title}</h3>
            <p>${formatDate(card.date)}</p>
            <div class="rating-container">
            <div class="rating-bar">
                <div class="rating-fill ${getRatingClass(card.rating)}" style="width: ${card.rating * 10}%;"></div>
            </div>
            <span class="rating-score">${card.rating}</span>
            </div>
        </div>
        </a>
    `;
}

function displayTopRated(cards) {
    const topRated = [...cards]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
        
    const container = document.getElementById('top-rated-cards');
    container.innerHTML = topRated.map((card, index) => createCardHTML(card, false, index + 1)).join('');
}

function displayRecapCards(cards) {
    const sortedCards = [...cards].filter(card => card.recapUrl !== null).sort((a, b) => new Date(b.date) - new Date(a.date));
        
    const container = document.getElementById('recap-cards');
    container.innerHTML = sortedCards.map(card => createCardHTML(card)).join('');
}

function displayPreviewCards(cards) {
    const cardsWithPreviews = cards.filter(card => card.previewUrl);
    const sortedCards = [...cardsWithPreviews].sort((a, b) => new Date(b.date) - new Date(a.date));
        
    const container = document.getElementById('preview-cards');
    container.innerHTML = sortedCards.map(card => createCardHTML(card, true)).join('');
}

document.addEventListener('DOMContentLoaded', loadCards);