// Quarteto Joker SM - Main Script

let gameState = {
    active: false,
    deck: null,
    playerHand: null,
    opponentHand: null,
    playerScore: 0,
    opponentScore: 0,
    playerQuartets: [],
    opponentQuartets: [],
    turn: 'player',
    message: 'Bem-vindo ao Quarteto Joker SM!'
};

const suitSymbols = { Hearts: '♥', Diamonds: '♦', Clubs: '♣', Spades: '♠' };
const suitColors = { Hearts: '#e74c3c', Diamonds: '#e67e22', Clubs: '#2c3e50', Spades: '#2c3e50' };

// AUTHENTICATION
function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    const result = accountManager.login(email, password);
    if (result.success) {
        showApp();
        updateUserDisplay();
    } else {
        alert(result.message);
    }
}

function handleLogout() {
    if (confirm('Deseja sair da conta?')) {
        storageManager.logout();
        location.reload();
    }
}

function showApp() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';
    navigateTo('menu');
}

function updateUserDisplay() {
    const user = accountManager.getCurrentLoggedUser();
    if (user) {
        document.getElementById('userDisplayName').textContent = user.profile.username;
        const stats = `Nível ${user.profile.level} | Vitórias: ${user.profile.gamesWon} | Pontos: ${user.profile.score}`;
        document.getElementById('userStats').textContent = stats;
    }
}

// NAVIGATION
function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Mark active tab
    event.target?.classList.add('active');
    
    // Render section content
    if (sectionId === 'game') {
        renderGameScreen();
    } else if (sectionId === 'championships') {
        renderChampionships();
    } else if (sectionId === 'statistics') {
        renderStatistics();
    }
}

// PROFILE MODAL
function openProfile() {
    const user = accountManager.getCurrentLoggedUser();
    if (!user) return;
    
    const content = `
        <div class="profile-header">
            <div class="profile-avatar">${user.profile.avatar}</div>
            <div class="profile-name">${user.profile.username}</div>
            <div style="color: var(--text-secondary); font-size: 0.9em;">${user.email}</div>
        </div>
        <div class="profile-info">
            <div class="profile-field">
                <div class="profile-label">Nível</div>
                <div class="profile-value">${user.profile.level}</div>
            </div>
            <div class="profile-field">
                <div class="profile-label">Pontos Totais</div>
                <div class="profile-value">${user.profile.score}</div>
            </div>
            <div class="profile-field">
                <div class="profile-label">Partidas Jogadas</div>
                <div class="profile-value">${user.profile.gamesPlayed}</div>
            </div>
            <div class="profile-field">
                <div class="profile-label">Vitórias</div>
                <div class="profile-value">${user.profile.gamesWon}</div>
            </div>
            <div class="profile-field">
                <div class="profile-label">Taxa de Vitória</div>
                <div class="profile-value">${user.profile.gamesPlayed > 0 ? Math.round((user.profile.gamesWon / user.profile.gamesPlayed) * 100) : 0}%</div>
            </div>
        </div>
        <button class="edit-btn" onclick="editProfile()">✏️ Editar Perfil</button>
    `;
    
    document.getElementById('profileContent').innerHTML = content;
    document.getElementById('profileModal').style.display = 'block';
}

function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

function editProfile() {
    const user = accountManager.getCurrentLoggedUser();
    const newUsername = prompt('Novo nome de usuário:', user.profile.username);
    if (newUsername && newUsername.trim()) {
        accountManager.updateProfile(user.email, { username: newUsername });
        alert('Perfil atualizado com sucesso!');
        openProfile();
        updateUserDisplay();
    }
}

// SETTINGS MODAL
function openSettings() {
    const content = `
        <div class="settings-section">
            <h4>🎨 Temas</h4>
            <div class="theme-options">
                <button class="theme-btn" onclick="applyTheme('theme-default')">Padrão</button>
                <button class="theme-btn" onclick="applyTheme('dark-theme')">Escuro</button>
                <button class="theme-btn" onclick="applyTheme('light-theme')">Claro</button>
                <button class="theme-btn" onclick="applyTheme('blue-theme')">Azul</button>
            </div>
        </div>
        
        <div class="settings-section">
            <h4>🔧 Opções Gerais</h4>
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <input type="checkbox" id="soundToggle" checked onchange="toggleSound()" />
                <span>Habilitar Sons</span>
            </label>
        </div>
        
        <div class="settings-section">
            <h4>⚠️ Zona de Perigo</h4>
            <button class="btn btn-secondary" onclick="clearAllData()">🗑️ Apagar Todas as Contas</button>
            <p style="color: var(--text-secondary); font-size: 0.85em; margin-top: 10px;">Esta ação não pode ser desfeita.</p>
        </div>
    `;
    
    document.getElementById('settingsModalContent').innerHTML = content;
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function applyTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('appTheme', themeName);
}

function toggleSound() {
    const enabled = document.getElementById('soundToggle').checked;
    localStorage.setItem('soundEnabled', enabled);
}

function toggleMusic() {
    alert('🎵 Sistema de música será implementado em breve!');
}

function clearAllData() {
    if (confirm('Tem certeza? Isso apagará TODAS as contas e não pode ser desfeito!')) {
        if (confirm('Confirmar: Apagar todas as contas?')) {
            accountManager.clearAllAccounts();
            alert('Todas as contas foram apagadas. A conta ADM foi recriada.');
            handleLogout();
        }
    }
}

// CHAMPIONSHIPS
const championships = [
    {
        id: 1,
        name: 'Torneio Relâmpago',
        status: 'active',
        prize: '500 Pontos',
        participants: 12,
        maxParticipants: 16,
        startDate: '2026-09-08',
        endDate: '2026-09-15',
        rounds: 3,
        leaderboard: [
            { rank: 1, name: 'SuperJoker', points: 450 },
            { rank: 2, name: 'CardMaster', points: 380 },
            { rank: 3, name: 'QuartetoKing', points: 320 }
        ]
    },
    {
        id: 2,
        name: 'Campeonato Nacional',
        status: 'upcoming',
        prize: '2000 Pontos',
        participants: 8,
        maxParticipants: 32,
        startDate: '2026-09-20',
        endDate: '2026-10-10',
        rounds: 5,
        leaderboard: []
    },
    {
        id: 3,
        name: 'Desafio dos Mestres',
        status: 'active',
        prize: '1000 Pontos',
        participants: 24,
        maxParticipants: 24,
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        rounds: 7,
        leaderboard: [
            { rank: 1, name: 'ProPlayer', points: 890 },
            { rank: 2, name: 'CardNinja', points: 820 },
            { rank: 3, name: 'JokerAce', points: 750 }
        ]
    },
    {
        id: 4,
        name: 'Campeonato Verão 2026',
        status: 'completed',
        prize: '3000 Pontos',
        participants: 32,
        maxParticipants: 32,
        startDate: '2026-08-01',
        endDate: '2026-08-30',
        rounds: 8,
        leaderboard: [
            { rank: 1, name: 'LegendJoker', points: 1200 },
            { rank: 2, name: 'CardGod', points: 1050 },
            { rank: 3, name: 'StrategyMaster', points: 950 }
        ]
    }
];

function renderChampionships() {
    filterChampionships('active');
}

function filterChampionships(status) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target?.classList.add('active');
    
    const filtered = championships.filter(c => c.status === status);
    const html = filtered.map(ch => `
        <div class="championship-card">
            <div class="championship-header">
                <div>
                    <h3 class="championship-title">${ch.name}</h3>
                    <span class="championship-status">${statusLabel(ch.status)}</span>
                </div>
                <div style="font-size: 1.5em;">🏆</div>
            </div>
            <div class="championship-body">
                <div class="championship-info">
                    <div class="info-label">💰 Prêmio</div>
                    <div class="info-value">${ch.prize}</div>
                </div>
                <div class="championship-info">
                    <div class="info-label">📅 Período</div>
                    <div class="info-value">${ch.startDate} até ${ch.endDate}</div>
                </div>
                <div class="championship-info">
                    <div class="info-label">👥 Participantes</div>
                    <div class="info-value">${ch.participants}/${ch.maxParticipants}</div>
                </div>
                <div class="championship-info">
                    <div class="info-label">🎮 Rodadas</div>
                    <div class="info-value">${ch.rounds}</div>
                </div>
                ${ch.leaderboard.length > 0 ? `
                    <div class="participants">
                        <div class="participants-title">🥇 Classificação Atual</div>
                        <ul class="participant-list">
                            ${ch.leaderboard.map(p => `
                                <li class="participant-item">
                                    <span class="participant-rank">#${p.rank}</span>
                                    <span>${p.name}</span>
                                    <span>${p.points}pts</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                <button class="join-btn" onclick="joinChampionship(${ch.id})" ${ch.participants >= ch.maxParticipants ? 'disabled' : ''}>
                    ${ch.participants >= ch.maxParticipants ? '❌ Cheio' : '✅ Participar'}
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('championshipsList').innerHTML = html || '<p style="text-align:center; padding:40px;">Nenhum campeonato nesta categoria</p>';
}

function statusLabel(status) {
    const labels = { active: '🔴 Ativo', upcoming: '⏳ Próximo', completed: '✅ Concluído' };
    return labels[status] || status;
}

function joinChampionship(id) {
    const championship = championships.find(c => c.id === id);
    if (championship.participants < championship.maxParticipants) {
        championship.participants++;
        alert(`✅ Você se inscreveu em "${championship.name}"!`);
        filterChampionships(championship.status);
    }
}

// GAME SCREEN
function renderGameScreen() {
    if (!gameState.active) {
        initNewGame();
    } else {
        renderGame();
    }
}

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
    gameState.message = '🎮 Rodada iniciada! Você tem 5 cartas. Clique em Comprar Carta!';
    
    for (let i = 0; i < 5; i++) {
        if (!gameState.deck.isEmpty()) gameState.playerHand.addCard(gameState.deck.drawCard());
        if (!gameState.deck.isEmpty()) gameState.opponentHand.addCard(gameState.deck.drawCard());
    }
    
    renderGame();
}

function renderGame() {
    const area = document.getElementById('gameArea');
    const cardsLeft = gameState.deck ? gameState.deck.cards.length : 0;
    
    const handHTML = gameState.playerHand?.cards.length > 0
        ? gameState.playerHand.cards.map((c, i) => `
            <div class="card" style="background:#fff; border: 2px solid ${suitColors[c.suit]}; padding: 10px; margin: 5px; text-align:center;">
                <div style="font-weight:bold; color:${suitColors[c.suit]};">${c.rank}</div>
                <div style="font-size:20px;">${suitSymbols[c.suit]}</div>
            </div>
        `).join('')
        : '<p>Sem cartas na mão</p>';
    
    area.innerHTML = `
        <div class="game-container">
            <div style="background: linear-gradient(135deg, #3498db, #2ecc71); color:white; padding:20px; border-radius:10px; margin-bottom:20px;">
                <h3>${gameState.message}</h3>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
                <div>
                    <strong>Suas Cartas (${gameState.playerHand?.cards.length || 0}):</strong>
                    <div style="display:flex; flex-wrap:wrap; gap:5px; margin-top:10px;">${handHTML}</div>
                </div>
                <div>
                    <strong>Status do Oponente</strong>
                    <p>Cartas: ${gameState.opponentHand?.cards.length || 0}</p>
                    <p>Pontos: ${gameState.opponentScore}</p>
                </div>
            </div>
            
            <div style="background:#ecf0f1; padding:15px; border-radius:8px; margin-bottom:20px;">
                <strong>Cartas Restantes no Baralho:</strong> ${cardsLeft}
            </div>
            
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="handlePlayerDraw()" ${!gameState.active || gameState.turn !== 'player' ? 'disabled' : ''}>🎴 Comprar Carta</button>
                <button class="btn btn-secondary" onclick="initNewGame()">🔄 Nova Rodada</button>
                <button class="btn btn-secondary" onclick="navigateTo('menu')">← Menu</button>
            </div>
        </div>
    `;
}

function handlePlayerDraw() {
    if (gameState.deck.isEmpty()) {
        gameState.message = '⚠️ Baralho vazio!';
        renderGame();
        return;
    }
    
    const card = gameState.deck.drawCard();
    gameState.playerHand.addCard(card);
    gameState.playerScore += 10;
    gameState.message = `✅ Você comprou: ${card.toString()}`;
    gameState.turn = 'opponent';
    
    renderGame();
    setTimeout(() => {
        if (gameState.deck.isEmpty() && gameState.opponentHand.isEmpty()) {
            gameState.active = false;
            gameState.message = gameState.playerScore >= gameState.opponentScore ? '🎉 Você ganhou!' : '😔 Você perdeu!';
        } else {
            gameState.message = '🤖 Oponente está jogando...';
            gameState.turn = 'player';
        }
        renderGame();
    }, 1500);
}

// STATISTICS
function renderStatistics() {
    const user = accountManager.getCurrentLoggedUser();
    if (!user) return;
    
    const winRate = user.profile.gamesPlayed > 0
        ? Math.round((user.profile.gamesWon / user.profile.gamesPlayed) * 100)
        : 0;
    
    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Nível</div>
                <div class="stat-value">${user.profile.level}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Pontos Totais</div>
                <div class="stat-value">${user.profile.score}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Partidas Jogadas</div>
                <div class="stat-value">${user.profile.gamesPlayed}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Vitórias</div>
                <div class="stat-value">${user.profile.gamesWon}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Taxa de Vitória</div>
                <div class="stat-value">${winRate}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Membro Desde</div>
                <div class="stat-value" style="font-size:0.8em;">${new Date(user.createdAt).toLocaleDateString('pt-BR')}</div>
            </div>
        </div>
    `;
    
    document.getElementById('statsContent').innerHTML = html;
}

// MODAL CLOSE ON CLICK OUTSIDE
window.onclick = function(event) {
    const profileModal = document.getElementById('profileModal');
    const settingsModal = document.getElementById('settingsModal');
    
    if (event.target === profileModal) profileModal.style.display = 'none';
    if (event.target === settingsModal) settingsModal.style.display = 'none';
};

// INITIALIZE
window.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('appTheme') || 'theme-default';
    document.body.className = theme;
    
    const currentUser = storageManager.getCurrentUser();
    if (currentUser && accountManager.findUser(currentUser)) {
        showApp();
        updateUserDisplay();
    }
});