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

      // Populate predictions from JSON
      if (card.fights) {
        for (const [matchup, fightEntry] of Object.entries(card.fights)) {
          const prediction = fightEntry.prediction;
          if (!prediction || !prediction.winner) continue;

          // Convert matchup key to fight div ID
          const fightId = matchup.toLowerCase()
            .replace(/\s+vs\.?\s+/g, '-vs-')
            .replace(/\s+/g, '-');

          const fightDiv = document.getElementById(fightId);
          if (!fightDiv) continue;

          const pickH4 = fightDiv.querySelector('.pick h4');
          if (pickH4) pickH4.textContent = `Pick: ${prediction.winner}`;

          const methodDiv = fightDiv.querySelector('.pick .method');
          if (methodDiv) methodDiv.innerHTML = `<strong>Method:</strong> ${prediction.method}`;
        }

        renderOddsTable(card);
      }
    } else {
      console.warn('Card not found for ID:', cardId);
    }
  } catch (error) {
    console.error('Error loading preview header:', error);
  }
}

function americanToProfit(american) {
  return american > 0 ? american / 100 : 100 / Math.abs(american);
}

function bestOddsForPick(oddsData, pick) {
  // oddsData: {platform: {fighter: american_int}}
  const pickLower = pick.toLowerCase();
  let bestPlatform = null;
  let bestAmerican = null;
  for (const [platform, lines] of Object.entries(oddsData)) {
    for (const [fighter, american] of Object.entries(lines)) {
      if (fighter.toLowerCase() === pickLower && american !== null) {
        if (bestAmerican === null || american > bestAmerican) {
          bestAmerican = american;
          bestPlatform = platform;
        }
      }
    }
  }
  return bestPlatform ? { platform: bestPlatform, american: bestAmerican } : null;
}

function renderOddsTable(card) {
  const fights = card.fights;
  if (!fights) return;

  const rows = [];
  let totalProfit = 0;

  for (const [matchup, entry] of Object.entries(fights)) {
    if (!entry.odds || Object.keys(entry.odds).length === 0) continue;
    const pick = (entry.prediction || {}).winner;
    if (!pick) continue;
    const best = bestOddsForPick(entry.odds, pick);
    if (!best) continue;
    const profit = americanToProfit(best.american);
    const returnPct = parseFloat((profit * 100).toFixed(1));
    const sign = best.american > 0 ? '+' : '';
    rows.push({ matchup, winner: pick, platform: best.platform, american: `${sign}${best.american}`, profit, returnPct });
    totalProfit += profit;
  }

  if (rows.length === 0) return;

  const wagered = rows.length;
  const netSign = totalProfit >= 0 ? '+' : '';
  const avgReturn = ((totalProfit / wagered) * 100).toFixed(1);

  const html = `
    <table class="odds-table">
      <thead>
        <tr>
          <th>Fight</th>
          <th>Pick</th>
          <th>Platform</th>
          <th>Odds</th>
          <th>Profit</th>
          <th>Return</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
        <tr>
          <td class="odds-fight">${r.matchup}</td>
          <td>${r.winner}</td>
          <td class="odds-platform">${r.platform}</td>
          <td class="odds-value">${r.american}</td>
          <td class="pnl-positive">+$${r.profit.toFixed(2)}</td>
          <td class="pnl-positive">+${r.returnPct}%</td>
        </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr class="odds-total">
          <td colspan="4"><strong>Total (${wagered} pick${wagered !== 1 ? 's' : ''} · $${wagered} wagered)</strong></td>
          <td class="${totalProfit >= 0 ? 'pnl-positive' : 'pnl-negative'}"><strong>${netSign}$${totalProfit.toFixed(2)}</strong></td>
          <td class="${totalProfit >= 0 ? 'pnl-positive' : 'pnl-negative'}"><strong>${netSign}${avgReturn}%</strong></td>
        </tr>
      </tfoot>
    </table>`;

  const container = document.querySelector('.projected-betting-returns');
  if (container) {
    container.innerHTML = html;
  }
}

// Load header when page loads
document.addEventListener('DOMContentLoaded', loadPreviewHeader);