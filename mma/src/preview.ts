import type { Card, CardsData, FightEntry } from './interfaces.js';

interface PreviewRow {
  matchup: string;
  pick: string;
  pTrue: number;
  platform: string;
  american: string;
  ev: number;
  profit: number;
  returnPct: number;
}

async function loadPreviewHeader(): Promise<void> {
  try {
    const pageUrl = window.location.pathname;
    const filename = pageUrl.split('/').pop() ?? '';
    const cardId = filename.replace('.html', '');
    console.log('card id:' + cardId);

    const response = await fetch('../cards.json');
    const data: CardsData = await response.json();

    const card = data.cards.find(c => c.id === cardId);

    if (card) {
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        titleElement.textContent = card.subtitle
          ? `${card.title} Preview: ${card.subtitle}`
          : `${card.title} Preview`;
      }

      document.title = card.subtitle
        ? `${card.title} ${card.subtitle} Preview`
        : `${card.title} Preview`;

      const dateElement = document.querySelector('.event-date');
      if (dateElement) {
        if (card.location && card.eventTime) {
          dateElement.textContent = `${card.eventTime} • ${card.location}`;
        } else {
          const date = new Date(card.date);
          const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
          dateElement.textContent = date.toLocaleDateString('en-US', options);
        }
      }

      const posterElement = document.querySelector<HTMLImageElement>('.event-poster');
      if (posterElement) {
        posterElement.src = card.poster;
        posterElement.alt = `${card.title} Poster`;
      }

      if (card.fights) {
        for (const [matchup, fightEntry] of Object.entries(card.fights)) {
          const prediction = fightEntry.prediction;
          if (!prediction?.winner) continue;

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

function toProfit(american: number): number {
  return american > 0 ? american / 100 : 100 / Math.abs(american);
}

function renderOddsTable(card: Card): void {
  const fights = card.fights;
  if (!fights) return;

  const rows: PreviewRow[] = [];
  let totalProfit = 0;

  for (const [matchup, entry] of Object.entries(fights)) {
    const pick = entry.prediction?.winner;
    if (!pick || !entry.bestOdds) continue;

    const { groundTruthProb, bestOdds: best, bestEv } = entry.bestOdds;
    if (!best || best.odds === null) continue;

    const profit = toProfit(best.odds);
    const returnPct = parseFloat((profit * 100).toFixed(1));
    const sign = best.odds > 0 ? '+' : '';
    rows.push({ matchup, pick, pTrue: groundTruthProb, platform: best.platform, american: `${sign}${best.odds}`, ev: bestEv, profit, returnPct });
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
          <th>Win Prob</th>
          <th>Best Book</th>
          <th>Odds</th>
          <th>EV</th>
          <th>Profit</th>
          <th>Return</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
        <tr>
          <td class="odds-fight">${r.matchup}</td>
          <td>${r.pick}</td>
          <td class="odds-value">${(r.pTrue * 100).toFixed(1)}%</td>
          <td class="odds-platform">${r.platform}</td>
          <td class="odds-value">${r.american}</td>
          <td class="${r.ev >= 0 ? 'pnl-positive' : 'pnl-negative'}">${r.ev >= 0 ? '+' : ''}$${r.ev.toFixed(2)}</td>
          <td class="pnl-positive">+$${r.profit.toFixed(2)}</td>
          <td class="pnl-positive">+${r.returnPct}%</td>
        </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr class="odds-total">
          <td colspan="5"><strong>Total (${wagered} pick${wagered !== 1 ? 's' : ''} · $${wagered} wagered)</strong></td>
          <td></td>
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

document.addEventListener('DOMContentLoaded', loadPreviewHeader);
