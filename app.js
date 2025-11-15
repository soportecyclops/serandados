// app.js - Versión mejorada

class DiceMasterPro {
    constructor() {
        this.participants = [];
        this.history = [];
        this.sessionsHistory = [];
        this.currentRound = 1;
        this.totalSessions = 1;
        this.currentParticipantIndex = 0;
        this.isRolling = false;
        this.roundInProgress = false;
        
        this.settings = {
            language: 'es',
            theme: 'classic-casino',
            soundEnabled: true,
            targetScore: 100,
            maxParticipants: 4,
            diceType: 'd6',
            diceCount: 2,
            counterType: 'numbers',
            rotateTurns: false
        };
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.setupAvatars();
        this.setupThemes();
        this.renderParticipants();
        this.updateLeaderboard();
        this.updateUI();
        this.updateCurrentPlayerDisplay();
        this.updateScoreVisualization();
        this.renderHistory();
        this.renderSessionsHistory();
    }

    // Sistema de almacenamiento mejorado
    saveToStorage() {
        const gameState = {
            participants: this.participants,
            history: this.history,
            sessionsHistory: this.sessionsHistory,
            currentRound: this.currentRound,
            totalSessions: this.totalSessions,
            settings: this.settings,
            currentParticipantIndex: this.currentParticipantIndex,
            roundInProgress: this.roundInProgress
        };
        localStorage.setItem('diceMasterPro', JSON.stringify(gameState));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('diceMasterPro');
        if (saved) {
            try {
                const gameState = JSON.parse(saved);
                this.participants = gameState.participants || [];
                this.history = gameState.history || [];
                this.sessionsHistory = gameState.sessionsHistory || [];
                this.currentRound = gameState.currentRound || 1;
                this.totalSessions = gameState.totalSessions || 1;
                this.settings = { ...this.settings, ...gameState.settings };
                this.currentParticipantIndex = gameState.currentParticipantIndex || 0;
                this.roundInProgress = gameState.roundInProgress || false;
            } catch (e) {
                console.error('Error loading saved game:', e);
                this.resetToDefault();
            }
        }
    }

    // Configuración de event listeners mejorada
    setupEventListeners() {
        // Botones principales
        document.getElementById('roll-btn').addEventListener('click', () => this.rollDice());
        document.getElementById('new-session-btn').addEventListener('click', () => this.newSession());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());

        // Configuración de dados
        document.getElementById('dice-config-btn').addEventListener('click', () => this.showDiceConfigModal());
        document.getElementById('close-dice-config').addEventListener('click', () => this.hideDiceConfigModal());
        document.getElementById('save-dice-config').addEventListener('click', () => this.saveDiceConfig());
        document.getElementById('cancel-dice-config').addEventListener('click', () => this.hideDiceConfigModal());

        document.getElementById('dice-count').addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            document.getElementById('dice-count-display').textContent = count;
        });

        // Configuración de participantes mejorada
        document.getElementById('add-participant-btn').addEventListener('click', () => this.showParticipantModal());
        document.getElementById('remove-participant-btn').addEventListener('click', () => this.removeLastParticipant());

        // Tema e idioma
        document.getElementById('theme-language-btn').addEventListener('click', () => this.showThemeLanguageModal());
        document.getElementById('close-theme-language').addEventListener('click', () => this.hideThemeLanguageModal());
        document.getElementById('save-theme-language').addEventListener('click', () => this.saveThemeLanguage());
        document.getElementById('cancel-theme-language').addEventListener('click', () => this.hideThemeLanguageModal());

        // Contador visual
        document.getElementById('counter-type').addEventListener('change', (e) => {
            this.settings.counterType = e.target.value;
            this.updateScoreVisualization();
            this.saveToStorage();
        });

        // Historial
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());

        // Pantalla completa
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());

        // Cerrar modales
        document.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (document.getElementById('participant-modal').classList.contains('active')) {
                    this.saveParticipant();
                }
                if (document.getElementById('theme-language-modal').classList.contains('active')) {
                    this.saveThemeLanguage();
                }
                if (document.getElementById('dice-config-modal').classList.contains('active')) {
                    this.saveDiceConfig();
                }
            }
        });
    }

    // Sistema de dados mejorado
    rollDice() {
        if (this.isRolling || this.participants.length === 0) {
            if (this.participants.length === 0) {
                this.showNotification('Agrega participantes antes de lanzar los dados.');
            }
            return;
        }

        if (!this.roundInProgress) {
            this.roundInProgress = true;
            this.currentParticipantIndex = 0;
            this.updateCurrentPlayerDisplay();
        }

        const participant = this.participants[this.currentParticipantIndex];
        const diceCount = this.settings.diceCount;
        const diceType = this.getDiceMaxValue(this.settings.diceType);
        
        this.isRolling = true;
        this.animateDiceRoll(diceCount);

        setTimeout(() => {
            const results = [];
            let total = 0;

            for (let i = 0; i < diceCount; i++) {
                const roll = Math.floor(Math.random() * diceType) + 1;
                results.push(roll);
                total += roll;
            }

            this.displayDiceResults(results);
            this.addToHistory(participant, results, total);
            
            participant.score += total;
            participant.rounds++;

            this.currentParticipantIndex++;
            
            if (this.currentParticipantIndex >= this.participants.length) {
                this.endRound();
            } else {
                this.updateCurrentPlayerDisplay();
            }

            this.isRolling = false;
            
            this.saveToStorage();
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.checkWinner();

            if (this.settings.soundEnabled) {
                this.playDiceSound();
            }
        }, 1200);
    }

    // Visualización de dados corregida
    displayDiceResults(results) {
        const diceDisplay = document.getElementById('dice-display');
        const currentResult = document.getElementById('current-result');
        const individualDice = document.getElementById('individual-dice');

        diceDisplay.innerHTML = '';
        individualDice.innerHTML = '';

        let total = 0;

        results.forEach((result, index) => {
            total += result;
            
            const dice = document.createElement('div');
            dice.className = 'dice';
            dice.setAttribute('data-value', result);
            
            const diceFace = document.createElement('div');
            diceFace.className = 'dice-face';
            
            // Crear puntos según el valor
            this.createDiceDots(diceFace, result);
            
            dice.appendChild(diceFace);
            diceDisplay.appendChild(dice);

            const diceResult = document.createElement('span');
            diceResult.className = 'dice-result';
            diceResult.textContent = result;
            individualDice.appendChild(diceResult);
        });

        currentResult.querySelector('.total-score').textContent = total;
    }

    createDiceDots(diceFace, value) {
        diceFace.innerHTML = '';
        
        // Crear exactamente el número de puntos necesarios
        const dotsNeeded = Math.min(value, 6); // Máximo 6 puntos para dados estándar
        
        for (let i = 0; i < dotsNeeded; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            diceFace.appendChild(dot);
        }

        // Aplicar distribución CSS mediante data-value
        diceFace.parentElement.setAttribute('data-value', value);
    }

    // Sistema de participantes mejorado
    setupAvatars() {
        const avatars = [
            { id: 'troll', name: 'Troll', emoji: '👹', color: '#dc2626' },
            { id: 'wizard', name: 'Mago', emoji: '🧙', color: '#7c3aed' },
            { id: 'warrior', name: 'Guerrero', emoji: '⚔️', color: '#d97706' },
            { id: 'fairy', name: 'Hada', emoji: '🧚', color: '#ec4899' },
            { id: 'thief', name: 'Ladrón', emoji: '🦹', color: '#475569' },
            { id: 'barbarian', name: 'Bárbaro', emoji: '🪓', color: '#b91c1c' },
            { id: 'cleric', name: 'Clérigo', emoji: '🙏', color: '#059669' },
            { id: 'archer', name: 'Arquero', emoji: '🏹', color: '#65a30d' },
            { id: 'dwarf', name: 'Enano', emoji: '⛏️', color: '#92400e' },
            { id: 'king', name: 'Rey', emoji: '👑', color: '#f59e0b' }
        ];

        const avatarGrid = document.getElementById('avatar-grid');
        avatarGrid.innerHTML = '';

        avatars.forEach(avatar => {
            const avatarOption = document.createElement('div');
            avatarOption.className = 'avatar-option';
            avatarOption.style.backgroundColor = avatar.color;
            avatarOption.textContent = avatar.emoji;
            avatarOption.dataset.avatarId = avatar.id;
            avatarOption.dataset.avatarEmoji = avatar.emoji;
            avatarOption.dataset.avatarColor = avatar.color;
            
            avatarOption.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                avatarOption.classList.add('selected');
            });

            avatarGrid.appendChild(avatarOption);
        });
    }

    showParticipantModal(participant = null) {
        this.editingParticipant = participant;
        const modal = document.getElementById('participant-modal');
        const title = document.getElementById('participant-modal-title');
        
        if (participant) {
            title.textContent = 'Editar Participante';
            document.getElementById('participant-name').value = participant.name;
            
            const avatarOption = document.querySelector(`[data-avatar-id="${participant.avatar}"]`);
            if (avatarOption) {
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                avatarOption.classList.add('selected');
            }
        } else {
            title.textContent = 'Agregar Participante';
            document.getElementById('participant-name').value = '';
            document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
            
            const firstAvatar = document.querySelector('.avatar-option');
            if (firstAvatar) {
                firstAvatar.classList.add('selected');
            }
        }
        
        modal.classList.add('active');
        
        setTimeout(() => {
            document.getElementById('participant-name').focus();
        }, 100);
    }

    saveParticipant() {
        const nameInput = document.getElementById('participant-name');
        const name = nameInput.value.trim();
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        
        if (!name) {
            this.showNotification('Por favor ingresa un nombre para el participante');
            nameInput.focus();
            return;
        }
        
        if (!selectedAvatar) {
            this.showNotification('Por favor selecciona un avatar');
            return;
        }

        if (this.editingParticipant) {
            this.editingParticipant.name = name;
            this.editingParticipant.avatar = selectedAvatar.dataset.avatarId;
            this.editingParticipant.avatarEmoji = selectedAvatar.dataset.avatarEmoji;
            this.editingParticipant.color = selectedAvatar.dataset.avatarColor;
        } else {
            if (this.participants.length >= this.settings.maxParticipants) {
                this.showNotification(`Máximo ${this.settings.maxParticipants} participantes permitidos`);
                return;
            }

            this.participants.push({
                id: Date.now().toString(),
                name: name,
                color: selectedAvatar.dataset.avatarColor,
                avatar: selectedAvatar.dataset.avatarId,
                avatarEmoji: selectedAvatar.dataset.avatarEmoji,
                score: 0,
                rounds: 0
            });
        }

        this.hideParticipantModal();
        this.renderParticipants();
        this.updateLeaderboard();
        this.updateScoreVisualization();
        this.updateCurrentPlayerDisplay();
        this.saveToStorage();
    }

    removeLastParticipant() {
        if (this.participants.length === 0) {
            this.showNotification('No hay participantes para eliminar');
            return;
        }

        if (confirm('¿Eliminar el último participante? Se perderán todos los puntajes.')) {
            this.participants.pop();
            if (this.currentParticipantIndex >= this.participants.length) {
                this.currentParticipantIndex = Math.max(0, this.participants.length - 1);
            }
            if (this.participants.length === 0) {
                this.roundInProgress = false;
            }
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.updateCurrentPlayerDisplay();
            this.saveToStorage();
        }
    }

    // Sistema de turnos mejorado
    updateCurrentPlayerDisplay() {
        const currentDisplay = document.getElementById('current-player-display');
        const nextDisplay = document.getElementById('next-player-display');
        
        if (this.participants.length === 0 || !this.roundInProgress) {
            currentDisplay.innerHTML = `
                <div class="player-avatar" style="background-color: #6b7280;">👤</div>
                <span class="player-name">Esperando jugadores...</span>
            `;
            nextDisplay.innerHTML = `
                <div class="player-avatar" style="background-color: #6b7280;">⏭️</div>
                <span class="player-name">Se prepara: -</span>
            `;
            return;
        }

        const currentPlayer = this.participants[this.currentParticipantIndex];
        const nextPlayerIndex = (this.currentParticipantIndex + 1) % this.participants.length;
        const nextPlayer = this.participants[nextPlayerIndex];

        currentDisplay.innerHTML = `
            <div class="player-avatar" style="background-color: ${currentPlayer.color}">
                ${currentPlayer.avatarEmoji}
            </div>
            <span class="player-name">${currentPlayer.name}</span>
        `;

        nextDisplay.innerHTML = `
            <div class="player-avatar" style="background-color: ${nextPlayer.color}">
                ${nextPlayer.avatarEmoji}
            </div>
            <span class="player-name">Se prepara: ${nextPlayer.name}</span>
        `;
    }

    // Sistema de configuración mejorado
    showDiceConfigModal() {
        const modal = document.getElementById('dice-config-modal');
        
        const currentTypeRadio = document.querySelector(`input[name="dice-type"][value="${this.settings.diceType}"]`);
        if (currentTypeRadio) {
            currentTypeRadio.checked = true;
        } else {
            document.querySelector('input[name="dice-type"][value="d6"]').checked = true;
        }
        
        document.getElementById('dice-count').value = this.settings.diceCount;
        document.getElementById('dice-count-display').textContent = this.settings.diceCount;
        
        modal.classList.add('active');
    }

    saveDiceConfig() {
        const selectedDiceType = document.querySelector('input[name="dice-type"]:checked');
        const diceCount = parseInt(document.getElementById('dice-count').value);
        
        if (selectedDiceType) {
            this.settings.diceType = selectedDiceType.value;
        }
        this.settings.diceCount = diceCount;
        
        this.hideDiceConfigModal();
        
        // Reiniciar partida al cambiar configuración
        if (this.participants.length > 0) {
            if (confirm('La configuración de dados ha cambiado. ¿Reiniciar la partida actual?')) {
                this.newSession();
            }
        }
        
        this.updateUI();
        this.saveToStorage();
        this.showNotification('Configuración de dados actualizada');
    }

    // Nuevo sistema de tema e idioma
    showThemeLanguageModal() {
        const modal = document.getElementById('theme-language-modal');
        
        document.getElementById('language-select').value = this.settings.language;
        document.getElementById('sound-toggle').checked = this.settings.soundEnabled;
        document.getElementById('target-score').value = this.settings.targetScore;
        document.getElementById('rotate-turns').checked = this.settings.rotateTurns;
        
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.themeId === this.settings.theme) {
                option.classList.add('active');
            }
        });
        
        modal.classList.add('active');
    }

    hideThemeLanguageModal() {
        document.getElementById('theme-language-modal').classList.remove('active');
    }

    saveThemeLanguage() {
        this.settings.language = document.getElementById('language-select').value;
        this.settings.soundEnabled = document.getElementById('sound-toggle').checked;
        this.settings.targetScore = parseInt(document.getElementById('target-score').value);
        this.settings.rotateTurns = document.getElementById('rotate-turns').checked;
        
        const activeTheme = document.querySelector('.theme-option.active');
        if (activeTheme) {
            this.settings.theme = activeTheme.dataset.themeId;
            document.documentElement.setAttribute('data-theme', this.settings.theme);
        }
        
        this.hideThemeLanguageModal();
        this.saveToStorage();
        this.updateUI();
        this.showNotification('Configuración guardada');
    }

    // Sistema de historial de partidas
    renderSessionsHistory() {
        const sessionsList = document.getElementById('sessions-list');
        
        if (this.sessionsHistory.length === 0) {
            sessionsList.innerHTML = '<div class="empty-state"><p>No hay partidas anteriores.</p></div>';
            return;
        }

        sessionsList.innerHTML = '';
        this.sessionsHistory.slice(0, 10).forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            sessionItem.innerHTML = `
                <div class="session-info">
                    <div class="session-winner">${session.winner}</div>
                    <div class="session-details">Puntaje: ${session.score} | Rondas: ${session.rounds}</div>
                </div>
                <div class="session-date">${session.date}</div>
            `;
            sessionsList.appendChild(sessionItem);
        });
    }

    saveSessionToHistory() {
        if (this.participants.length === 0) return;

        const sortedParticipants = [...this.participants].sort((a, b) => b.score - a.score);
        const winner = sortedParticipants[0];

        const sessionData = {
            id: Date.now().toString(),
            winner: winner.name,
            score: winner.score,
            rounds: this.currentRound,
            date: new Date().toLocaleString('es-ES'),
            participants: this.participants.map(p => ({
                name: p.name,
                score: p.score,
                rounds: p.rounds
            }))
        };

        this.sessionsHistory.unshift(sessionData);
        this.renderSessionsHistory();
        this.saveToStorage();
    }

    newSession() {
        if (this.participants.length === 0) {
            this.showNotification('Agrega participantes antes de iniciar una nueva sesión.');
            return;
        }

        // Guardar sesión actual en historial si hay puntajes
        if (this.participants.some(p => p.score > 0)) {
            this.saveSessionToHistory();
        }

        if (confirm('¿Iniciar una nueva sesión? Se reiniciarán todos los puntajes y el historial, pero se mantendrán los participantes.')) {
            this.participants.forEach(participant => {
                participant.score = 0;
                participant.rounds = 0;
            });
            this.currentRound = 1;
            this.currentParticipantIndex = 0;
            this.roundInProgress = false;
            this.history = [];
            this.totalSessions++;
            this.updateUI();
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.renderHistory();
            this.updateCurrentPlayerDisplay();
            this.saveToStorage();
            
            this.showNotification('¡Nueva sesión iniciada!');
        }
    }

    // Utilidades mejoradas
    updateUI() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.getElementById('session-number').textContent = this.totalSessions;
        document.getElementById('round-number').textContent = this.currentRound;
        document.getElementById('dice-count-display').textContent = this.settings.diceCount;
        document.getElementById('dice-count').value = this.settings.diceCount;
        document.getElementById('counter-type').value = this.settings.counterType;
        
        const rollBtn = document.getElementById('roll-btn');
        if (this.participants.length === 0 || this.isRolling) {
            rollBtn.disabled = true;
        } else {
            rollBtn.disabled = false;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            color: var(--text-accent);
            padding: var(--spacing-md);
            border-radius: var(--border-radius);
            border: 2px solid var(--accent-gold);
            font-weight: 600;
            z-index: 1001;
            box-shadow: var(--shadow-lg);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    // ... (mantener el resto de métodos existentes con pequeñas mejoras)
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    window.diceMasterPro = new DiceMasterPro();
});
