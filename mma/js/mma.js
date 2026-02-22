// Fetch and load UFC cards data
async function loadCards() {
    try {
        const ufcJSonPath = './js/ufc_cards.json';
        const response = await fetch(ufcJSonPath);
        const data = await response.json();

        // Display top 10 rated cards
        displayTopRated(data.cards);

        // Display all recap cards (sorted by date, newest first)
        displayRecapCards(data.cards);

        // Display preview cards
        displayPreviewCards(data.cards);

        // Set up search with loaded cards
        setupSearch(data.cards);
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

function setupSearch(cards) {
    const container = document.getElementById('search-container');
    const iconBtn = document.getElementById('search-icon-btn');
    const input = document.getElementById('mma-search');
    const dropdown = document.getElementById('search-dropdown');
    let activeIndex = -1;

    function expand() {
        container.classList.add('expanded');
        input.focus();
    }

    function collapse() {
        container.classList.remove('expanded');
        input.value = '';
        dropdown.style.display = 'none';
        activeIndex = -1;
    }

    function buildSuggestions(query) {
        const q = query.toLowerCase();
        const suggestions = [];
        for (const card of cards) {
            const title = card.subtitle ? `${card.title}: ${card.subtitle}` : card.title;
            if (!title.toLowerCase().includes(q)) continue;
            if (card.recapUrl)   suggestions.push({ title, type: 'Recap',   url: card.recapUrl });
            if (card.previewUrl) suggestions.push({ title, type: 'Preview', url: card.previewUrl });
        }
        return suggestions;
    }

    function renderDropdown(suggestions) {
        activeIndex = -1;
        if (suggestions.length === 0) {
            dropdown.innerHTML = `<div class="search-no-results">No matching results</div>`;
            dropdown.style.display = 'block';
            return;
        }
        dropdown.innerHTML = suggestions.map((s, i) => `
            <a href="${s.url}" class="search-suggestion" data-index="${i}">
                <span class="suggestion-title">${s.title}</span>
                <span class="suggestion-type">${s.type}</span>
            </a>`).join('');
        dropdown.style.display = 'block';
    }

    function setActive(index) {
        const items = dropdown.querySelectorAll('.search-suggestion');
        items.forEach(el => el.classList.remove('active'));
        if (index >= 0 && index < items.length) {
            items[index].classList.add('active');
            items[index].scrollIntoView({ block: 'nearest' });
        }
        activeIndex = index;
    }

    iconBtn.addEventListener('click', expand);

    input.addEventListener('input', () => {
        const query = input.value.trim();
        if (!query) { dropdown.style.display = 'none'; return; }
        renderDropdown(buildSuggestions(query));
    });

    input.addEventListener('keydown', e => {
        const items = dropdown.querySelectorAll('.search-suggestion');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(Math.min(activeIndex + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(Math.max(activeIndex - 1, 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            items[activeIndex].click();
        } else if (e.key === 'Escape') {
            collapse();
        }
    });

    // Global keyboard shortcut: '/' to open search
    document.addEventListener('keydown', e => {
        if (e.key === '/' && document.activeElement !== input) {
            e.preventDefault();
            expand();
        }
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('#search-container')) collapse();
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getRatingClass(rating) {
    if (rating >= 8.0) return 'excellent';
    if (rating >= 7.0) return 'good';
    if (rating >= 5.0) return 'average';
    if (rating >= 3.0) return 'below-average';
    return 'poor';
}

function createCardHTML(card, isPreview = false) {
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

    return `
        <a href="${card.recapUrl}" class="blog-post">
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
        .filter(card => card.rating !== null)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);

    const rows = topRated.map((card, index) => {
        const displayTitle = card.subtitle ? `${card.title}: ${card.subtitle}` : card.title;
        const ratingClass = getRatingClass(card.rating);
        const nameCell = card.recapUrl
            ? `<a href="${card.recapUrl}">${displayTitle}</a>`
            : displayTitle;
        return `
            <tr>
                <td class="rank-cell">${index + 1}</td>
                <td class="score-cell ${ratingClass}">${card.rating}</td>
                <td class="event-cell">${nameCell}</td>
            </tr>`;
    }).join('');

    const container = document.getElementById('top-rated-cards');
    container.innerHTML = `
        <table class="top-rated-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Score</th>
                    <th>Event</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
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