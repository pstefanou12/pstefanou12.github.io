// Load card data and populate preview page header
async function loadPreviewHeader() {
  try {
    // Get the card ID from the filename (now just the card ID + .html)
    const pageUrl = window.location.pathname;
    const filename = pageUrl.split('/').pop();
    
    // Remove .html extension to get card ID
    const cardId = filename.replace('.html', '');
    console.log('card id:' + cardId);
    
    // Load the cards JSON
    const response = await fetch('../js/ufc_cards.json');
    const data = await response.json();
    
    // Find the matching card
    const card = data.cards.find(c => c.id === cardId);
    
    if (card) {
      // Update page title
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        const displayTitle = card.subtitle 
          ? `${card.title} Preview: ${card.subtitle}`
          : `${card.title} Preview`;
        titleElement.textContent = displayTitle;
      }
      
      // Update document title
      document.title = card.subtitle 
        ? `${card.title} ${card.subtitle} Preview`
        : `${card.title} Preview`;
      
      // Update event date
      const dateElement = document.querySelector('.event-date');
      if (dateElement) {
        if (card.location && card.eventTime) {
          // Use full event details if available
          dateElement.textContent = `${card.eventTime} • ${card.location}`;
        } else {
          // Fallback to just formatting the date
          const date = new Date(card.date);
          const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
          const formattedDate = date.toLocaleDateString('en-US', options);
          dateElement.textContent = formattedDate;
        }
      }
      
      // Update poster
      const posterElement = document.querySelector('.event-poster');
      if (posterElement) {
        posterElement.src = card.poster;
        posterElement.alt = `${card.title} Poster`;
      }
    } else {
      console.warn('Card not found for ID:', cardId);
    }
  } catch (error) {
    console.error('Error loading preview header:', error);
  }
}

// Load header when page loads
document.addEventListener('DOMContentLoaded', loadPreviewHeader);