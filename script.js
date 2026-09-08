// Quarteto Joker SM - Main Game Script

// Ensure game data exists in storage
function getGameData() {
    let data = storageManager.loadData();
    if (!data || typeof data !== 'object') {
        data = {
            level: 1,
            score: 0,
            xp: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            quartetsFormed: 0,
            cardsDrawn: 0,
            theme: 'theme-default',
            soundEnabled: true
        };
        storageManager.saveData(data);
    }
    return data;
}

function updateStats(updates) {
    const current = getGameData();
    const updated = { ...current, ...updates };
    storageManager.saveData(updated);
    return updated;
}

// Navigation
function hideAllSections() {
    const sections = ['menu', 'game', 'career', 'statistics', 'settings'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function navigateTo(sectionId) {
    hideAllSections();
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
    }

    if (sectionId === 'game') {
        if (!gameState.active) {
            initNewGame();
        } else {
            renderGame();
        }
    } else if (sectionId === 'career') {
        renderCareer();
    } else if (sectionId === 'statistics') {
        renderStatistics();
    } else if (sectionId === 'settings') {
        renderSettings();
    }
}

function goBackToMenu() {
    navigateTo('menu');
}

function startGame() {
    navigateTo('game');
}

function openCareerMode() {
    navigateTo('career');
}

function openStatistics() {
    navigateTo('statistics');
}

function openSettings() {
    navigateTo('settings');
}

// Game State
let gameState = {
    active: false,
    deck: null,
    playerHand: null,
    opponentHand: null,
    playerScore: 0,
    opponentScore: 0,
    playerQuartets: [],
    opponentQuartets: [],
    turn: 'player', // 'player' or 'opponent'
    message: 'Welcome to Quarteto Joker SM! Draw cards to complete sets of 4 (Quarteto).'
};

const suitSymbols = {
    Hearts: '♥',
    Diamonds: '♦',
    Clubs: '♣',
    Spades: '♠'
};

const suitColors = {
    Hearts: '#e74c3c',
    Diamonds: '#e67e22',
    Clubs: '#2c3e50',
    Spades: '#2c3e50'
};

function initNewGame() {
    gameState.deck = new Deck();
    gameState.playerHand = new Hand();
    gameState.opponentHand = new Hand();
    gameState.playerScore = 0;
    gameState.opponentScore = 0;
    gameState.playerQuartets = [];
    gameState.opponentQuartets = [];
    gameState.turn = 'player';
    gameState.active = true;
    gameState.message = 'Round started! You were dealt 5 cards. Draw from the deck or form a Quarteto.';

    // Deal 5 cards each
    for (let i = 0; i < 5; i++) {
        if (!gameState.deck.isEmpty()) gameState.playerHand.addCard(gameState.deck.drawCard());
        if (!gameState.deck.isEmpty()) gameState.opponentHand.addCard(gameState.deck.drawCard());
    }

    const data = getGameData();
    updateStats({ gamesPlayed: (data.gamesPlayed || 0) + 1 });

    renderGame();
}

function renderCardHTML(card, isClickable = false, actionType = 'inspect') {
    const symbol = suitSymbols[card.suit] || card.suit;
    const color = suitColors[card.suit] || '#333';
    return `
        <div class="card" style="background:#fff; cursor:${isClickable ? 'pointer' : 'default'}; border: 2px solid ${color}; display:inline-flex; flex-direction:column; justify-content:space-between; padding:8px; box-sizing:border-box; vertical-align:top;" onclick="${isClickable ? `handleCardClick('${card.rank}', '${card.suit}', '${actionType}')` : ''}">
            <div style="font-weight:bold; font-size:18px; color:${color}; text-align:left;">${card.rank} <span style="font-size:16px;">${symbol}</span></div>
            <div class="card-title" style="font-size:32px; color:${color}; text-align:center; margin:10px 0;">${symbol}</div>
            <div style="font-weight:bold; font-size:14px; color:${color}; text-align:right;">${card.rank}</div>
        </div>
    `;
}

function getRankCounts(hand) {
    const counts = {};
    hand.cards.forEach(card => {
        counts[card.rank] = (counts[card.rank] || 0) + 1;
    });
    return counts;
}

function checkForQuartetos(hand, quartetsList) {
    const counts = getRankCounts(hand);
    let found = null;
    for (const rank in counts) {
        if (counts[rank] === 4) {
            found = rank;
            break;
        }
    }
    if (found) {
        // remove from hand
        const cardsToRemove = hand.cards.filter(c => c.rank === found);
        cardsToRemove.forEach(c => hand.removeCard(c));
        quartetsList.push(found);
        return found;
    }
    return null;
}

function handlePlayerDraw() {
    if (!gameState.active || gameState.turn !== 'player') return;

    if (gameState.deck.isEmpty()) {
        gameState.message = 'The deck is empty! Play remaining cards or end round.';
        renderGame();
        return;
    }

    const card = gameState.deck.drawCard();
    gameState.playerHand.addCard(card);

    const data = getGameData();
    updateStats({ cardsDrawn: (data.cardsDrawn || 0) + 1 });

    gameState.message = `You drew ${card.toString()}!`;
    
    // Check if player completed a Quarteto
    const claimedRank = checkForQuartetos(gameState.playerHand, gameState.playerQuartets);
    if (claimedRank) {
        gameState.playerScore += 100;
        gameState.message += ` QUARTETO! You completed a set of 4 ${claimedRank}s (+100 pts)!`;
        updateStats({
            score: (data.score || 0) + 100,
            xp: (data.xp || 0) + 50,
            quartetsFormed: (data.quartetsFormed || 0) + 1
        });
    }

    // Opponent turn
    gameState.turn = 'opponent';
    renderGame();
    setTimeout(opponentTurn, 1000);
}

function claimPlayerQuarteto() {
    if (!gameState.active) return;
    const claimedRank = checkForQuartetos(gameState.playerHand, gameState.playerQuartets);
    if (claimedRank) {
        gameState.playerScore += 100;
        const data = getGameData();
        updateStats({
            score: (data.score || 0) + 100,
            xp: (data.xp || 0) + 50,
            quartetsFormed: (data.quartetsFormed || 0) + 1
        });
        gameState.message = `QUARTETO! You formed a set of 4 ${claimedRank}s! (+100 pts)`;
    } else {
        gameState.message = 'No 4-of-a-kind set in hand yet. Keep drawing!';
    }
    renderGame();
}

function opponentTurn() {
    if (!gameState.active) return;

    if (!gameState.deck.isEmpty()) {
        const drawn = gameState.deck.drawCard();
        gameState.opponentHand.addCard(drawn);
        const claimed = checkForQuartetos(gameState.opponentHand, gameState.opponentQuartets);
        if (claimed) {
            gameState.opponentScore += 100;
            gameState.message = `Opponent drew a card and formed a QUARTETO of ${claimed}s!`;
        } else {
            gameState.message = `Opponent drew a card from the deck. Your turn!`;
        }
    } else {
        gameState.message = `Opponent has no cards to draw. Your turn!`;
    }

    // Check game over conditions
    if (gameState.deck.isEmpty() && (gameState.playerHand.cards.length === 0 || gameState.opponentHand.cards.length === 0)) {
        endRound();
        return;
    }

    gameState.turn = 'player';
    renderGame();
}

function endRound() {
    gameState.active = false;
    let resultMsg = '';
    const won = gameState.playerScore >= gameState.opponentScore;
    const data = getGameData();

    if (won) {
        resultMsg = `🎉 Round Won! Final Score: You ${gameState.playerScore} - ${gameState.opponentScore} Opponent.`;
        updateStats({
            gamesWon: (data.gamesWon || 0) + 1,
            xp: (data.xp || 0) + 100,
            level: Math.floor(((data.xp || 0) + 100) / 200) + 1
        });
    } else {
        resultMsg = `Round Ended. Final Score: You ${gameState.playerScore} - ${gameState.opponentScore} Opponent.`;
    }

    gameState.message = resultMsg;
    renderGame();
}

function renderGame() {
    const area = document.getElementById('gameArea');
    if (!area) return;

    const cardsLeft = gameState.deck ? gameState.deck.cards.length : 0;
    const playerQuartetsStr = gameState.playerQuartets.length > 0 ? gameState.playerQuartets.join(', ') : 'None';
    const oppQuartetsStr = gameState.opponentQuartets.length > 0 ? gameState.opponentQuartets.join(', ') : 'None';

    let handCardsHTML = '';
    if (gameState.playerHand && gameState.playerHand.cards.length > 0) {
        handCardsHTML = gameState.playerHand.cards.map(c => renderCardHTML(c, false)).join('');
    } else {
        handCardsHTML = '<p>No cards in hand.</p>';
    }

    area.innerHTML = `
        <div class="quarteto" style="padding:15px; border-radius:8px; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; margin-bottom:10px;">
                <div><strong>Deck Cards Remaining:</strong> ${cardsLeft}</div>
                <div><strong>Your Score:</strong> ${gameState.playerScore} pts</div>
                <div><strong>Opponent Score:</strong> ${gameState.opponentScore} pts</div>
                <div><strong>Turn:</strong> <span style="text-transform:capitalize; font-weight:bold;">${gameState.turn}</span></div>
            </div>

            <div style="background:#e8f4f8; border-left:4px solid #3498db; padding:10px; margin:10px 0; font-weight:500;">
                ${gameState.message}
            </div>

            <div style="margin:15px 0;">
                <h4>Opponent's Status</h4>
                <p>Cards in Hand: ${gameState.opponentHand ? gameState.opponentHand.cards.length : 0} | Quartetos: ${oppQuartetsStr}</p>
            </div>

            <div style="margin:20px 0;">
                <h4>Your Hand (${gameState.playerHand ? gameState.playerHand.cards.length : 0} cards)</h4>
                <p style="font-size:13px; color:#666;">Quartetos Completed: <strong>${playerQuartetsStr}</strong></p>
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">
                    ${handCardsHTML}
                </div>
            </div>

            <div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap;">
                <button class="button" onclick="handlePlayerDraw()" ${!gameState.active || gameState.turn !== 'player' || cardsLeft === 0 ? 'disabled' : ''}>Draw Card</button>
                <button class="button" onclick="claimPlayerQuarteto()" ${!gameState.active ? 'disabled' : ''}>Claim Quarteto</button>
                <button class="button" onclick="initNewGame()">New Round</button>
                <button class="button" onclick="endRound()" ${!gameState.active ? 'disabled' : ''}>End Round</button>
            </div>
        </div>
    `;
}

// Career Mode Render
function renderCareer() {
    const container = document.getElementById('careerContent');
    if (!container) return;

    const data = getGameData();
    const level = data.level || 1;
    const xp = data.xp || 0;
    const nextLevelXP = level * 200;
    const progressPct = Math.min(100, Math.floor((xp % 200) / 200 * 100));

    const ranks = ['Novice Joker', 'Deck Shuffler', 'Card Strategist', 'Quarteto Master', 'Grand Joker Champion'];
    const rankTitle = ranks[Math.min(ranks.length - 1, Math.floor((level - 1) / 2))];

    container.innerHTML = `
        <div style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1); margin-bottom:15px;">
            <h3>Rank: ${rankTitle} (Level ${level})</h3>
            <p><strong>Total Career XP:</strong> ${xp} XP</p>
            <div style="background:#e0e0e0; border-radius:6px; height:18px; width:100%; overflow:hidden; margin:10px 0;">
                <div style="background:#2ecc71; height:100%; width:${progressPct}%;"></div>
            </div>
            <p style="font-size:13px; color:#666;">Level Progress: ${xp % 200} / 200 XP to Level ${level + 1}</p>
        </div>

        <div style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 4px rgba(0,0,0,0.1);">
            <h4>Career Milestones</h4>
            <ul style="line-height:1.8;">
                <li>${data.gamesPlayed >= 1 ? '✅' : '⚪'} <strong>First Game:</strong> Played your first match</li>
                <li>${(data.quartetsFormed || 0) >= 1 ? '✅' : '⚪'} <strong>First Quarteto:</strong> Formed a 4-of-a-kind set</li>
                <li>${(data.gamesWon || 0) >= 3 ? '✅' : '⚪'} <strong>Winning Streak:</strong> Win 3 games (${data.gamesWon || 0}/3)</li>
                <li>${(data.cardsDrawn || 0) >= 20 ? '✅' : '⚪'} <strong>Deck Explorer:</strong> Draw 20 cards (${data.cardsDrawn || 0}/20)</li>
                <li>${level >= 5 ? '✅' : '⚪'} <strong>Quarteto Veteran:</strong> Reach Career Level 5</li>
            </ul>
        </div>
    `;
}

// Statistics Render
function renderStatistics() {
    const container = document.getElementById('statsContent');
    if (!container) return;

    const data = getGameData();
    const played = data.gamesPlayed || 0;
    const won = data.gamesWon || 0;
    const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

    container.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:15px; margin-bottom:15px;">
            <div style="background:#fff; padding:15px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); text-align:center;">
                <div style="font-size:28px; font-weight:bold; color:#3498db;">${played}</div>
                <div style="color:#666;">Games Played</div>
            </div>
            <div style="background:#fff; padding:15px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); text-align:center;">
                <div style="font-size:28px; font-weight:bold; color:#2ecc71;">${won}</div>
                <div style="color:#666;">Games Won</div>
            </div>
            <div style="background:#fff; padding:15px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); text-align:center;">
                <div style="font-size:28px; font-weight:bold; color:#e67e22;">${winRate}%</div>
                <div style="color:#666;">Win Rate</div>
            </div>
            <div style="background:#fff; padding:15px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); text-align:center;">
                <div style="font-size:28px; font-weight:bold; color:#9b59b6;">${data.quartetsFormed || 0}</div>
                <div style="color:#666;">Quartetos Formed</div>
            </div>
            <div style="background:#fff; padding:15px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); text-align:center;">
                <div style="font-size:28px; font-weight:bold; color:#34495e;">${data.cardsDrawn || 0}</div>
                <div style="color:#666;">Cards Drawn</div>
            </div>
            <div style="background:#fff; padding:15px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); text-align:center;">
                <div style="font-size:28px; font-weight:bold; color:#e74c3c;">${data.score || 0}</div>
                <div style="color:#666;">Total Score</div>
            </div>
        </div>
    `;
}

// Settings Render
function renderSettings() {
    const container = document.getElementById('settingsContent');
    if (!container) return;

    const data = getGameData();
    const currentTheme = data.theme || 'theme-default';

    container.innerHTML = `
        <div style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); margin-bottom:15px;">
            <h4>Theme Selection</h4>
            <p>Select visual color theme:</p>
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin:15px 0;">
                <button class="button" onclick="applyTheme('theme-default')">Default</button>
                <button class="button" onclick="applyTheme('theme-dark')">Dark Theme</button>
                <button class="button" onclick="applyTheme('theme-light')">Light Theme</button>
                <button class="button" onclick="applyTheme('theme-solarized')">Solarized</button>
            </div>
            <p style="font-size:13px; color:#666;">Current active theme: <strong>${currentTheme}</strong></p>
        </div>

        <div style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4>Game Data Management</h4>
            <p>Reset statistics, career progress, and score.</p>
            <button class="button" style="background-color:#e74c3c;" onclick="resetAllData()">Reset All Game Data</button>
        </div>
    `;
}

function applyTheme(themeName) {
    document.body.className = themeName;
    updateStats({ theme: themeName });
    renderSettings();
}

function resetAllData() {
    storageManager.clearData();
    getGameData(); // reinit with defaults
    applyTheme('theme-default');
    alert('All game data and statistics have been reset.');
    renderSettings();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    const data = getGameData();
    if (data.theme) {
        document.body.className = data.theme;
    }

    // Handle initial hash navigation or default to menu
    const hash = window.location.hash.replace('#', '');
    if (hash && ['menu', 'game', 'career', 'statistics', 'settings'].includes(hash)) {
        navigateTo(hash);
    } else {
        navigateTo('menu');
    }
});

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['menu', 'game', 'career', 'statistics', 'settings'].includes(hash)) {
        navigateTo(hash);
    }
});
