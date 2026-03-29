async function loadRecapHeader() {
    try {
        const pageUrl = window.location.pathname;
        const filename = pageUrl.split('/').pop() ?? '';
        const cardId = filename.replace('.html', '').toLowerCase().replace(/_/g, '-');
        const response = await fetch('../cards.json');
        const data = await response.json();
        const card = data.cards.find(c => c.id === cardId);
        if (card) {
            const titleElement = document.querySelector('h1');
            if (titleElement) {
                titleElement.textContent = card.subtitle
                    ? `${card.title}: ${card.subtitle} Recap`
                    : `${card.title} Recap`;
            }
            const dateElement = document.querySelector('.event-date');
            if (dateElement && card.location && card.eventTime) {
                dateElement.textContent = `${card.eventTime} • ${card.location}`;
            }
            const posterElement = document.querySelector('.event-poster');
            if (posterElement) {
                posterElement.src = card.poster;
                posterElement.alt = `${card.title} Poster`;
            }
            const ratingFill = document.querySelector('.event-rating .rating-fill');
            const ratingScore = document.querySelector('.event-rating .rating-score');
            if (ratingFill && ratingScore && card.rating !== undefined) {
                ratingFill.style.width = `${card.rating * 10}%`;
                ratingFill.className = `rating-fill ${getRatingClass(card.rating)}`;
                ratingScore.textContent = `${card.rating}/10`;
            }
            if (card.fights) {
                const fightDivs = document.querySelectorAll('.fight');
                let correctCount = 0;
                let totalPredictions = 0;
                for (const fightDiv of fightDivs) {
                    const h3 = fightDiv.querySelector('h3');
                    if (!h3)
                        continue;
                    const fighters = (h3.textContent ?? '').split(' vs. ');
                    if (fighters.length < 2)
                        continue;
                    const fighter1 = fighters[0].trim();
                    const fighter2 = fighters[1].trim();
                    let prediction;
                    let resultWinner;
                    for (const [matchup, fightEntry] of Object.entries(card.fights)) {
                        if (matchup.toLowerCase().includes(fighter1.toLowerCase()) &&
                            matchup.toLowerCase().includes(fighter2.toLowerCase())) {
                            prediction = fightEntry.prediction;
                            resultWinner = fightEntry.result?.winner;
                            break;
                        }
                    }
                    if (!prediction?.winner)
                        continue;
                    totalPredictions++;
                    const isNonFinish = resultWinner === 'draw' || resultWinner === 'no contest';
                    const isCorrect = !isNonFinish && resultWinner !== undefined &&
                        prediction.winner.toLowerCase().trim() === resultWinner.toLowerCase().trim();
                    if (isCorrect)
                        correctCount++;
                    const predEl = fightDiv.querySelector('.fight-prediction');
                    if (predEl) {
                        const symbol = isCorrect ? '\u2713' : '\u2717';
                        const methodStr = prediction.method ? ` via ${prediction.method}` : '';
                        predEl.className = `fight-prediction ${isCorrect ? 'prediction-correct' : 'prediction-incorrect'}`;
                        predEl.innerHTML = `<strong>Prediction: </strong>${prediction.winner}${methodStr} ${symbol}`;
                    }
                }
                if (totalPredictions > 0) {
                    const scoreEl = document.querySelector('.predictions-score');
                    if (scoreEl) {
                        scoreEl.innerHTML = `Predictions: <strong>${correctCount}/${totalPredictions}</strong>`;
                    }
                }
                renderBettingResults(card, fightDivs);
            }
        }
        else {
            console.warn('Card not found for ID:', cardId);
        }
    }
    catch (error) {
        console.error('Error loading recap header:', error);
    }
}
function toProfit(american) {
    return american > 0 ? american / 100 : 100 / Math.abs(american);
}
function renderBettingResults(card, fightDivs) {
    const fights = card.fights;
    if (!fights)
        return;
    const rows = [];
    let totalPnl = 0;
    for (const fightDiv of fightDivs) {
        const h3 = fightDiv.querySelector('h3');
        if (!h3)
            continue;
        const fighters = (h3.textContent ?? '').split(' vs. ');
        if (fighters.length < 2)
            continue;
        const fighter1 = fighters[0].trim();
        const fighter2 = fighters[1].trim();
        let matchup = null;
        let fightEntry = null;
        for (const [key, entry] of Object.entries(fights)) {
            if (key.toLowerCase().includes(fighter1.toLowerCase()) &&
                key.toLowerCase().includes(fighter2.toLowerCase())) {
                matchup = key;
                fightEntry = entry;
                break;
            }
        }
        if (!matchup || !fightEntry?.prediction || !fightEntry.result)
            continue;
        if (!fightEntry.bestOdds)
            continue;
        const pick = fightEntry.prediction.winner;
        const { bestOdds: best } = fightEntry.bestOdds;
        if (!best || best.odds === null)
            continue;
        const profit = toProfit(best.odds);
        const actualWinner = fightEntry.result?.winner;
        const isNonFinish = actualWinner === 'draw' || actualWinner === 'no contest';
        const isCorrect = !isNonFinish && actualWinner !== undefined &&
            pick.toLowerCase().trim() === actualWinner.toLowerCase().trim();
        const pnl = isCorrect ? profit : -1;
        totalPnl += pnl;
        const resultLabel = isNonFinish ? (actualWinner === 'draw' ? 'Draw' : 'No Contest') : `${actualWinner} wins`;
        const sign = best.odds > 0 ? '+' : '';
        rows.push({
            matchup, pick,
            result: resultLabel,
            platform: best.platform,
            american: `${sign}${best.odds}`,
            isCorrect, pnl,
            returnPct: pnl * 100,
        });
    }
    if (rows.length === 0)
        return;
    const wagered = rows.length;
    const netSign = totalPnl >= 0 ? '+' : '';
    const totalReturnPct = (totalPnl / wagered) * 100;
    const totalReturnSign = totalReturnPct >= 0 ? '+' : '';
    const html = `
    <table class="odds-table">
      <thead>
        <tr>
          <th>Fight</th>
          <th>Pick</th>
          <th>Result</th>
          <th>Best Book</th>
          <th>Odds</th>
          <th>P&amp;L</th>
          <th>Return</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
        <tr>
          <td class="odds-fight">${r.matchup}</td>
          <td>${r.pick}</td>
          <td class="${r.isCorrect ? 'prediction-correct' : 'prediction-incorrect'}">${r.result} ${r.isCorrect ? '✓' : '✗'}</td>
          <td class="odds-platform">${r.platform}</td>
          <td class="odds-value">${r.american}</td>
          <td class="${r.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">${r.pnl >= 0 ? '+' : ''}$${r.pnl.toFixed(2)}</td>
          <td class="${r.returnPct >= 0 ? 'pnl-positive' : 'pnl-negative'}">${r.returnPct >= 0 ? '+' : ''}${r.returnPct.toFixed(0)}%</td>
        </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr class="odds-total">
          <td colspan="5"><strong>Total (${wagered} bet${wagered !== 1 ? 's' : ''} · $${wagered} wagered)</strong></td>
          <td class="${totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative'}"><strong>${netSign}$${totalPnl.toFixed(2)}</strong></td>
          <td class="${totalReturnPct >= 0 ? 'pnl-positive' : 'pnl-negative'}"><strong>${totalReturnSign}${totalReturnPct.toFixed(1)}%</strong></td>
        </tr>
      </tfoot>
    </table>`;
    const bettingDiv = document.querySelector('.betting-results');
    if (bettingDiv) {
        bettingDiv.innerHTML = html;
    }
}
function getRatingClass(rating) {
    if (rating >= 8.0)
        return 'excellent';
    if (rating >= 7.0)
        return 'good';
    if (rating >= 5.0)
        return 'average';
    if (rating >= 3.0)
        return 'below-average';
    return 'poor';
}
document.addEventListener('DOMContentLoaded', loadRecapHeader);
export {};
