// DiceMaster Pro - Aplicación Web de Dados
// Archivo principal de JavaScript - Versión Completa y Corregida

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

    // Sistema de almacenamiento
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

    resetToDefault() {
        this.participants = [];
        this.history = [];
        this.sessionsHistory = [];
        this.currentRound = 1;
        this.totalSessions = 1;
        this.currentParticipantIndex = 0;
        this.roundInProgress = false;
    }

    // Configuración de event listeners
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

        // Configuración de participantes
        document.getElementById('add-participant-btn').addEventListener('click', () => this.showParticipantModal());
        document.getElementById('remove-participant-btn').addEventListener('click', () => this.removeLastParticipant());

        // Tema e idioma
        document.getElementById('theme-language-btn').addEventListener('click', () => this.showThemeLanguageModal());
        document.getElementById('close-theme-language').addEventListener('click', () => this.hideThemeLanguageModal());
        document.getElementById('save-theme-language').addEventListener('click', () => this.saveThemeLanguage());
        document.getElementById('cancel-theme-language').addEventListener('click', () => this.hideThemeLanguageModal());

        // Configuración del contador visual
        document.getElementById('counter-type').addEventListener('change', (e) => {
            this.settings.counterType = e.target.value;
            this.updateScoreVisualization();
            this.saveToStorage();
        });

        // Modales de participante
        document.getElementById('close-participant-modal').addEventListener('click', () => this.hideParticipantModal());
        document.getElementById('save-participant').addEventListener('click', () => this.saveParticipant());
        document.getElementById('cancel-participant').addEventListener('click', () => this.hideParticipantModal());

        // Historial
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());

        // Pantalla completa
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());

        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Enter key en modales
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

    // Sistema de dados
    rollDice() {
        if (this.isRolling || this.participants.length === 0) {
            if (this.participants.length === 0) {
                this.showNotification('Agrega participantes antes de lanzar los dados.');
            }
            return;
        }

        // Iniciar ronda si es el primer lanzamiento
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

        // Simular el lanzamiento después de la animación
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
            
            // Actualizar puntaje del participante
            participant.score += total;
            participant.rounds++;

            // Avanzar al siguiente participante
            this.currentParticipantIndex++;
            
            // Verificar si la ronda ha terminado
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

            // Reproducir sonido si está habilitado
            if (this.settings.soundEnabled) {
                this.playDiceSound();
            }
        }, 1200);
    }

    getDiceMaxValue(diceType) {
        const diceValues = {
            'd4': 4,
            'd6': 6,
            'd8': 8,
            'd10': 10,
            'd20': 20
        };
        return diceValues[diceType] || 6;
    }

    animateDiceRoll(count) {
        const diceDisplay = document.getElementById('dice-display');
        diceDisplay.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const dice = document.createElement('div');
            dice.className = 'dice rolling';
            
            // Crear la cara del dado con puntos
            const diceFace = document.createElement('div');
            diceFace.className = 'dice-face';
            
            // Agregar puntos temporales para la animación
            for (let j = 0; j < 6; j++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                diceFace.appendChild(dot);
            }
            
            dice.appendChild(diceFace);
            diceDisplay.appendChild(dice);
        }
    }

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
            
            // Crear los puntos según el valor del dado
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
        // Limpiar puntos existentes
        diceFace.innerHTML = '';
        
        // Crear puntos según el valor (máximo 6 para dados estándar)
        const dotsNeeded = Math.min(value, 6);
        
        for (let i = 0; i < dotsNeeded; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            diceFace.appendChild(dot);
        }

        // La distribución CSS se maneja automáticamente con los atributos data-value
    }

    endRound() {
        this.currentRound++;
        this.roundInProgress = false;
        
        // Rotar turnos si está habilitado
        if (this.settings.rotateTurns && this.participants.length > 1) {
            const first = this.participants.shift();
            this.participants.push(first);
        }
        
        this.currentParticipantIndex = 0;
        this.updateCurrentPlayerDisplay();
        this.updateUI();
        this.saveToStorage();
        
        // Mostrar notificación de nueva ronda
        this.showRoundNotification();
    }

    showRoundNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-card);
            color: var(--text-accent);
            padding: var(--spacing-xl);
            border-radius: var(--border-radius-lg);
            border: 3px solid var(--accent-gold);
            font-size: var(--font-size-2xl);
            font-weight: bold;
            z-index: 1001;
            box-shadow: var(--shadow-lg);
            text-align: center;
        `;
        notification.textContent = `¡Ronda ${this.currentRound}!`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 2000);
    }

    // Sistema de participantes
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
        if (!avatarGrid) return;

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

    setupThemes() {
        const themes = [
            { id: 'classic-casino', name: 'Clásico Casino', primary: '#dc2626', secondary: '#059669', accent: '#d97706' },
            { id: 'casino-royale', name: 'Casino Royale', primary: '#b91c1c', secondary: '#1e40af', accent: '#ca8a04' },
            { id: 'green-professional', name: 'Verde Profesional', primary: '#065f46', secondary: '#7c3aed', accent: '#d97706' },
            { id: 'purple-elegant', name: 'Púrpura Elegante', primary: '#7c3aed', secondary: '#dc2626', accent: '#f59e0b' },
            { id: 'gold-luxe', name: 'Dorado Luxe', primary: '#d97706', secondary: '#dc2626', accent: '#fbbf24' },
            { id: 'navy-blue', name: 'Azul Marino', primary: '#1e40af', secondary: '#dc2626', accent: '#d97706' }
        ];

        const themeGrid = document.getElementById('theme-grid');
        if (!themeGrid) return;

        themeGrid.innerHTML = '';

        themes.forEach(theme => {
            const themeOption = document.createElement('div');
            themeOption.className = `theme-option ${theme.id === this.settings.theme ? 'active' : ''}`;
            themeOption.dataset.themeId = theme.id;
            
            themeOption.innerHTML = `
                <div class="theme-preview">
                    <div class="theme-color primary" style="background-color: ${theme.primary}"></div>
                    <div class="theme-color secondary" style="background-color: ${theme.secondary}"></div>
                    <div class="theme-color accent" style="background-color: ${theme.accent}"></div>
                </div>
                <div class="theme-name">${theme.name}</div>
            `;
            
            themeOption.addEventListener('click', () => {
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                themeOption.classList.add('active');
            });

            themeGrid.appendChild(themeOption);
        });
    }

    showParticipantModal(participant = null) {
        this.editingParticipant = participant;
        const modal = document.getElementById('participant-modal');
        const title = document.getElementById('participant-modal-title');
        
        if (!modal || !title) return;
        
        if (participant) {
            title.textContent = 'Editar Participante';
            document.getElementById('participant-name').value = participant.name;
            
            // Seleccionar avatar
            const avatarOption = document.querySelector(`[data-avatar-id="${participant.avatar}"]`);
            if (avatarOption) {
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                avatarOption.classList.add('selected');
            }
        } else {
            title.textContent = 'Agregar Participante';
            document.getElementById('participant-name').value = '';
            document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
            
            // Seleccionar primer avatar por defecto
            const firstAvatar = document.querySelector('.avatar-option');
            if (firstAvatar) {
                firstAvatar.classList.add('selected');
            }
        }
        
        modal.classList.add('active');
        
        // Focus en el campo de nombre
        setTimeout(() => {
            const nameInput = document.getElementById('participant-name');
            if (nameInput) nameInput.focus();
        }, 100);
    }

    hideParticipantModal() {
        const modal = document.getElementById('participant-modal');
        if (modal) modal.classList.remove('active');
        this.editingParticipant = null;
    }

    saveParticipant() {
        const nameInput = document.getElementById('participant-name');
        if (!nameInput) return;
        
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
            // Editar participante existente
            this.editingParticipant.name = name;
            this.editingParticipant.avatar = selectedAvatar.dataset.avatarId;
            this.editingParticipant.avatarEmoji = selectedAvatar.dataset.avatarEmoji;
            this.editingParticipant.color = selectedAvatar.dataset.avatarColor;
        } else {
            // Agregar nuevo participante
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

    renderParticipants() {
        const participantsList = document.getElementById('participants-list');
        if (!participantsList) return;
        
        if (this.participants.length === 0) {
            participantsList.innerHTML = '<div class="empty-state"><p>No hay participantes. Agrega el primero.</p></div>';
            return;
        }

        participantsList.innerHTML = '';
        this.participants.forEach((participant, index) => {
            const isCurrentTurn = this.roundInProgress && index === this.currentParticipantIndex;
            const participantElement = document.createElement('div');
            participantElement.className = `participant-item ${isCurrentTurn ? 'current-turn' : ''}`;
            participantElement.innerHTML = `
                <div class="participant-avatar" style="background-color: ${participant.color}">
                    ${participant.avatarEmoji}
                </div>
                <div class="participant-info">
                    <div class="participant-name">${participant.name}</div>
                    <div class="participant-score">Puntaje: ${participant.score} | Rondas: ${participant.rounds}</div>
                </div>
                <div class="participant-actions">
                    <button class="btn-icon-small edit-participant" data-index="${index}">✏️</button>
                    <button class="btn-icon-small remove-participant" data-index="${index}">🗑️</button>
                </div>
            `;
            participantsList.appendChild(participantElement);
        });

        // Agregar event listeners para los botones de edición y eliminación
        document.querySelectorAll('.edit-participant').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                this.showParticipantModal(this.participants[index]);
            });
        });

        document.querySelectorAll('.remove-participant').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('button').dataset.index);
                this.removeParticipant(index);
            });
        });
    }

    removeParticipant(index) {
        if (confirm('¿Estás seguro de que quieres eliminar este participante? Se perderán sus puntajes.')) {
            this.participants.splice(index, 1);
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

    updateCurrentPlayerDisplay() {
        const currentDisplay = document.getElementById('current-player-display');
        const nextDisplay = document.getElementById('next-player-display');
        
        if (!currentDisplay || !nextDisplay) return;
        
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

    // Sistema de puntuación y líderboard
    updateLeaderboard() {
        const leaderboardBody = document.getElementById('leaderboard-body');
        if (!leaderboardBody) return;
        
        const sortedParticipants = [...this.participants].sort((a, b) => b.score - a.score);
        
        leaderboardBody.innerHTML = '';
        
        if (sortedParticipants.length === 0) {
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
                        No hay participantes
                    </td>
                </tr>
            `;
            return;
        }
        
        sortedParticipants.forEach((participant, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="participant-avatar" style="background-color: ${participant.color}; width: 24px; height: 24px; font-size: 12px;">
                            ${participant.avatarEmoji}
                        </div>
                        ${participant.name}
                    </div>
                </td>
                <td style="font-weight: 700; color: var(--text-accent); font-size: var(--font-size-lg);">${participant.score}</td>
                <td>${participant.rounds}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    updateScoreVisualization() {
        const scoreDisplay = document.getElementById('score-display');
        if (!scoreDisplay) return;

        scoreDisplay.innerHTML = '';

        if (this.participants.length === 0) {
            scoreDisplay.innerHTML = '<div class="empty-state"><p>Agrega participantes para ver el tanteador</p></div>';
            return;
        }

        this.participants.forEach(participant => {
            const counter = document.createElement('div');
            counter.className = 'visual-counter';
            
            const score = participant.score;
            
            counter.innerHTML = `
                <div class="counter-player">
                    <div class="participant-avatar" style="background-color: ${participant.color}; width: 30px; height: 30px; font-size: 14px;">
                        ${participant.avatarEmoji}
                    </div>
                    <span>${participant.name}</span>
                </div>
                <div class="counter-display">
                    <div class="counter-items">${this.getCounterDisplay(score)}</div>
                    <div class="counter-total">${score}</div>
                </div>
            `;
            scoreDisplay.appendChild(counter);
        });
    }

    getCounterDisplay(score) {
        if (this.settings.counterType === 'numbers') {
            return `<span>${score}</span>`;
        }

        let itemChar = '';
        switch(this.settings.counterType) {
            case 'matches': itemChar = '🔥'; break;
            case 'sticks': itemChar = '│'; break;
            case 'stones': itemChar = '●'; break;
            case 'beans': itemChar = '🌰'; break;
            default: itemChar = '●';
        }

        let displayHTML = '';
        const fullGroups = Math.floor(score / 5);
        const remainder = score % 5;

        // Agrupar de 5 en 5
        for (let i = 0; i < fullGroups; i++) {
            displayHTML += `<div class="counter-group">`;
            for (let j = 0; j < 5; j++) {
                displayHTML += `<span class="counter-item">${itemChar}</span>`;
            }
            displayHTML += `</div>`;
        }

        // Resto
        if (remainder > 0) {
            displayHTML += `<div class="counter-group">`;
            for (let j = 0; j < remainder; j++) {
                displayHTML += `<span class="counter-item">${itemChar}</span>`;
            }
            displayHTML += `</div>`;
        }

        return displayHTML;
    }

    // Sistema de historial
    addToHistory(participant, results, total) {
        const historyItem = {
            id: Date.now().toString(),
            participant: participant.name,
            participantId: participant.id,
            avatarEmoji: participant.avatarEmoji,
            color: participant.color,
            diceType: this.settings.diceType,
            diceCount: this.settings.diceCount,
            results: results,
            total: total,
            round: this.currentRound,
            timestamp: new Date().toLocaleString('es-ES')
        };
        
        this.history.unshift(historyItem);
        this.renderHistory();
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="empty-state"><p>No hay historial de tiradas aún.</p></div>';
            return;
        }

        historyList.innerHTML = '';
        this.history.slice(0, 10).forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-participant">
                    <div class="participant-avatar" style="background-color: ${item.color}; width: 24px; height: 24px; font-size: 12px;">
                        ${item.avatarEmoji}
                    </div>
                    <strong>${item.participant}</strong>
                    <small>(Ronda ${item.round})</small>
                </div>
                <div class="history-dice">
                    ${item.results.map(result => `<span class="dice-result">${result}</span>`).join(' + ')}
                    = <span class="history-total">${item.total}</span>
                </div>
                <div class="history-time">${item.timestamp}</div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    clearHistory() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el historial? Esta acción no se puede deshacer.')) {
            this.history = [];
            this.renderHistory();
            this.saveToStorage();
        }
    }

    // Sistema de historial de partidas
    renderSessionsHistory() {
        const sessionsList = document.getElementById('sessions-list');
        if (!sessionsList) return;
        
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

    // Sistema de rondas y sesiones
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

    resetGame() {
        if (confirm('¿Reiniciar completamente el juego? Se perderán todos los datos incluyendo participantes e historial.')) {
            this.participants = [];
            this.history = [];
            this.sessionsHistory = [];
            this.currentRound = 1;
            this.currentParticipantIndex = 0;
            this.roundInProgress = false;
            this.totalSessions = 1;
            this.updateUI();
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.renderHistory();
            this.renderSessionsHistory();
            this.updateCurrentPlayerDisplay();
            this.saveToStorage();
            
            this.showNotification('Juego reiniciado');
        }
    }

    checkWinner() {
        const winner = this.participants.find(p => p.score >= this.settings.targetScore);
        if (winner) {
            setTimeout(() => {
                alert(`🎉 ¡${winner.name} ha ganado el juego con ${winner.score} puntos!`);
                // Guardar sesión en historial
                this.saveSessionToHistory();
                // Opcional: reiniciar después de ganar
                if (confirm('¿Quieres iniciar una nueva sesión?')) {
                    this.newSession();
                }
            }, 1000);
        }
    }

    // Sistema de configuración de dados
    showDiceConfigModal() {
        const modal = document.getElementById('dice-config-modal');
        if (!modal) return;
        
        // Cargar configuración actual en el modal
        const currentTypeRadio = document.querySelector(`input[name="dice-type"][value="${this.settings.diceType}"]`);
        if (currentTypeRadio) {
            currentTypeRadio.checked = true;
        } else {
            // Si no existe, seleccionar d6 por defecto
            const d6Radio = document.querySelector('input[name="dice-type"][value="d6"]');
            if (d6Radio) d6Radio.checked = true;
        }
        
        const diceCountInput = document.getElementById('dice-count');
        const diceCountDisplay = document.getElementById('dice-count-display');
        
        if (diceCountInput) diceCountInput.value = this.settings.diceCount;
        if (diceCountDisplay) diceCountDisplay.textContent = this.settings.diceCount;
        
        modal.classList.add('active');
    }

    hideDiceConfigModal() {
        const modal = document.getElementById('dice-config-modal');
        if (modal) modal.classList.remove('active');
    }

    saveDiceConfig() {
        const selectedDiceType = document.querySelector('input[name="dice-type"]:checked');
        const diceCountInput = document.getElementById('dice-count');
        
        if (selectedDiceType) {
            this.settings.diceType = selectedDiceType.value;
        }
        if (diceCountInput) {
            this.settings.diceCount = parseInt(diceCountInput.value);
        }
        
        this.hideDiceConfigModal();
        
        // Reiniciar partida al cambiar configuración
        if (this.participants.length > 0 && this.participants.some(p => p.score > 0)) {
            if (confirm('La configuración de dados ha cambiado. ¿Reiniciar la partida actual?')) {
                this.newSession();
            }
        }
        
        this.updateUI();
        this.saveToStorage();
        this.showNotification('Configuración de dados actualizada');
    }

    // Sistema de tema e idioma
    showThemeLanguageModal() {
        const modal = document.getElementById('theme-language-modal');
        if (!modal) return;
        
        // Cargar configuración actual en el modal
        const languageSelect = document.getElementById('language-select');
        const soundToggle = document.getElementById('sound-toggle');
        const targetScore = document.getElementById('target-score');
        const rotateTurns = document.getElementById('rotate-turns');
        
        if (languageSelect) languageSelect.value = this.settings.language;
        if (soundToggle) soundToggle.checked = this.settings.soundEnabled;
        if (targetScore) targetScore.value = this.settings.targetScore;
        if (rotateTurns) rotateTurns.checked = this.settings.rotateTurns;
        
        // Configurar tema actual
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.themeId === this.settings.theme) {
                option.classList.add('active');
            }
        });
        
        modal.classList.add('active');
    }

    hideThemeLanguageModal() {
        const modal = document.getElementById('theme-language-modal');
        if (modal) modal.classList.remove('active');
    }

    saveThemeLanguage() {
        const languageSelect = document.getElementById('language-select');
        const soundToggle = document.getElementById('sound-toggle');
        const targetScore = document.getElementById('target-score');
        const rotateTurns = document.getElementById('rotate-turns');
        
        if (languageSelect) this.settings.language = languageSelect.value;
        if (soundToggle) this.settings.soundEnabled = soundToggle.checked;
        if (targetScore) this.settings.targetScore = parseInt(targetScore.value);
        if (rotateTurns) this.settings.rotateTurns = rotateTurns.checked;
        
        // Aplicar tema
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

    // Utilidades
    updateUI() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        const sessionNumber = document.getElementById('session-number');
        const roundNumber = document.getElementById('round-number');
        const diceCountDisplay = document.getElementById('dice-count-display');
        const diceCountInput = document.getElementById('dice-count');
        const counterType = document.getElementById('counter-type');
        
        if (sessionNumber) sessionNumber.textContent = this.totalSessions;
        if (roundNumber) roundNumber.textContent = this.currentRound;
        if (diceCountDisplay) diceCountDisplay.textContent = this.settings.diceCount;
        if (diceCountInput) diceCountInput.value = this.settings.diceCount;
        if (counterType) counterType.value = this.settings.counterType;
        
        // Actualizar estado del botón de lanzar
        const rollBtn = document.getElementById('roll-btn');
        if (rollBtn) {
            if (this.participants.length === 0 || this.isRolling) {
                rollBtn.disabled = true;
            } else {
                rollBtn.disabled = false;
            }
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

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    playDiceSound() {
        // Implementación básica de sonido
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Audio no disponible');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.diceMasterPro = new DiceMasterPro();
});
