// Load card data and populate recap page header
async function loadRecapHeader() {
  try {
    // Get the card ID from the URL or page
    // For example, if URL is "UFC_320_Ankalaev_vs._Pereira_2_recap.html"
    const pageUrl = window.location.pathname;
    const filename = pageUrl.split('/').pop();
    
    // Extract card ID from filename (remove _recap.html)
    const cardId = filename.replace('.html', '').toLowerCase().replace(/_/g, '-');
    
    // Load the cards JSON
    const ufcJSonPath = '../js/ufc_cards.json'; 
    const response = await fetch(ufcJSonPath);
    const data = await response.json();
    
    // Find the matching card
    const card = data.cards.find(c => c.id === cardId);
    
    if (card) {
      // Update page title
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        const displayTitle = card.subtitle 
          ? `${card.title}: ${card.subtitle} Recap`
          : `${card.title} Recap`;
        titleElement.textContent = displayTitle;
      }
      
      // Update event date
      const dateElement = document.querySelector('.event-date');
      if (dateElement && card.location && card.eventTime) {
        dateElement.textContent = `${card.eventTime} • ${card.location}`;
      }
      
      // Update poster
      const posterElement = document.querySelector('.event-poster');
      if (posterElement) {
        posterElement.src = card.poster;
        posterElement.alt = `${card.title} Poster`;
      }
      
      // Update rating
      const ratingFill = document.querySelector('.event-rating .rating-fill');
      const ratingScore = document.querySelector('.event-rating .rating-score');
      
      if (ratingFill && ratingScore) {
        ratingFill.style.width = `${card.rating * 10}%`;
        ratingFill.className = `rating-fill ${getRatingClass(card.rating)}`;
        ratingScore.textContent = `${card.rating}/10`;
      }

      // Populate predictions from JSON
      if (card.predictions) {
        let correctCount = 0;
        let totalPredictions = 0;

        const fightDivs = document.querySelectorAll('.fight');
        for (const fightDiv of fightDivs) {
          const h3 = fightDiv.querySelector('h3');
          if (!h3) continue;

          // fighter1 (listed first) is the winner in recap pages
          const fighters = h3.textContent.split(' vs. ');
          if (fighters.length < 2) continue;
          const fighter1 = fighters[0].trim();
          const fighter2 = fighters[1].trim();

          // Find matching prediction
          let prediction = null;
          for (const [matchup, pred] of Object.entries(card.predictions)) {
            if (matchup.toLowerCase().includes(fighter1.toLowerCase()) &&
                matchup.toLowerCase().includes(fighter2.toLowerCase())) {
              prediction = pred;
              break;
            }
          }

          if (!prediction || !prediction.winner) continue;

          totalPredictions++;
          const isCorrect = prediction.winner.toLowerCase().trim() === fighter1.toLowerCase().trim();
          if (isCorrect) correctCount++;

          const predEl = fightDiv.querySelector('.fight-prediction');
          if (predEl) {
            const symbol = isCorrect ? '\u2713' : '\u2717';
            const methodStr = prediction.method ? ` via ${prediction.method}` : '';
            predEl.className = `fight-prediction ${isCorrect ? 'prediction-correct' : 'prediction-incorrect'}`;
            predEl.innerHTML = `<strong>Prediction: </strong>${prediction.winner}${methodStr} ${symbol}`;
          }
        }

        // Update predictions score
        if (totalPredictions > 0) {
          const scoreEl = document.querySelector('.predictions-score');
          if (scoreEl) {
            scoreEl.innerHTML = `Predictions: <strong>${correctCount}/${totalPredictions}</strong>`;
          }
        }
      }
    } else {
      console.warn('Card not found for ID:', cardId);
    }
  } catch (error) {
    console.error('Error loading recap header:', error);
  }
}

function getRatingClass(rating) {
  if (rating >= 8.0) return 'excellent';
  if (rating >= 7.0) return 'good';
  if (rating >= 5.0) return 'average';
  if (rating >= 3.0) return 'below-average';
  return 'poor';
}

// Load header when page loads
document.addEventListener('DOMContentLoaded', loadRecapHeader);