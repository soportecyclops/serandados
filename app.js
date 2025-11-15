// PROMPT MAESTRO - Aplicación Web de Dados
// Archivo principal de JavaScript - Versión Corregida

class PromptMaestro {
    constructor() {
        this.participants = [];
        this.history = [];
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
    }

    // Sistema de almacenamiento
    saveToStorage() {
        const gameState = {
            participants: this.participants,
            history: this.history,
            currentRound: this.currentRound,
            totalSessions: this.totalSessions,
            settings: this.settings,
            currentParticipantIndex: this.currentParticipantIndex,
            roundInProgress: this.roundInProgress
        };
        localStorage.setItem('promptMaestro', JSON.stringify(gameState));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('promptMaestro');
        if (saved) {
            try {
                const gameState = JSON.parse(saved);
                this.participants = gameState.participants || [];
                this.history = gameState.history || [];
                this.currentRound = gameState.currentRound || 1;
                this.totalSessions = gameState.totalSessions || 1;
                this.settings = { ...this.settings, ...gameState.settings };
                this.currentParticipantIndex = gameState.currentParticipantIndex || 0;
                this.roundInProgress = gameState.roundInProgress || false;
            } catch (e) {
                console.error('Error loading saved game:', e);
                // Si hay error, empezar nuevo juego
                this.resetToDefault();
            }
        }
    }

    resetToDefault() {
        this.participants = [];
        this.history = [];
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

        // Configuración del contador visual
        document.getElementById('counter-type').addEventListener('change', (e) => {
            this.settings.counterType = e.target.value;
            this.updateScoreVisualization();
            this.saveToStorage();
        });

        // Modales
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettingsModal());
        document.getElementById('close-settings').addEventListener('click', () => this.hideSettingsModal());
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        document.getElementById('cancel-settings').addEventListener('click', () => this.hideSettingsModal());

        document.getElementById('close-participant-modal').addEventListener('click', () => this.hideParticipantModal());
        document.getElementById('save-participant').addEventListener('click', () => this.saveParticipant());
        document.getElementById('cancel-participant').addEventListener('click', () => this.hideParticipantModal());

        // Pantalla completa
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());

        // Historial
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());

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
                if (document.getElementById('settings-modal').classList.contains('active')) {
                    this.saveSettings();
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
                alert('Agrega participantes antes de lanzar los dados.');
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
        }, 1000);
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
            
            // Agregar 9 puntos (para representar todas las posiciones)
            for (let j = 0; j < 9; j++) {
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
        
        // Crear 9 puntos (para la cuadrícula 3x3)
        for (let i = 0; i < 9; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            diceFace.appendChild(dot);
        }

        // Ocultar/mostrar puntos según el valor
        const dots = diceFace.querySelectorAll('.dot');
        dots.forEach(dot => dot.style.display = 'none');

        // Mostrar los puntos correspondientes al valor
        switch(value) {
            case 1:
                dots[4].style.display = 'block'; // Centro
                break;
            case 2:
                dots[0].style.display = 'block'; // Esquina superior izquierda
                dots[8].style.display = 'block'; // Esquina inferior derecha
                break;
            case 3:
                dots[0].style.display = 'block'; // Esquina superior izquierda
                dots[4].style.display = 'block'; // Centro
                dots[8].style.display = 'block'; // Esquina inferior derecha
                break;
            case 4:
                dots[0].style.display = 'block'; // Esquina superior izquierda
                dots[2].style.display = 'block'; // Esquina superior derecha
                dots[6].style.display = 'block'; // Esquina inferior izquierda
                dots[8].style.display = 'block'; // Esquina inferior derecha
                break;
            case 5:
                dots[0].style.display = 'block'; // Esquina superior izquierda
                dots[2].style.display = 'block'; // Esquina superior derecha
                dots[4].style.display = 'block'; // Centro
                dots[6].style.display = 'block'; // Esquina inferior izquierda
                dots[8].style.display = 'block'; // Esquina inferior derecha
                break;
            case 6:
                dots[0].style.display = 'block'; // Esquina superior izquierda
                dots[2].style.display = 'block'; // Esquina superior derecha
                dots[3].style.display = 'block'; // Centro izquierda
                dots[5].style.display = 'block'; // Centro derecha
                dots[6].style.display = 'block'; // Esquina inferior izquierda
                dots[8].style.display = 'block'; // Esquina inferior derecha
                break;
        }
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
        
        if (participant) {
            title.textContent = 'Editar Participante';
            document.getElementById('participant-name').value = participant.name;
            document.getElementById('participant-color').value = participant.color;
            
            // Seleccionar avatar
            const avatarOption = document.querySelector(`[data-avatar-id="${participant.avatar}"]`);
            if (avatarOption) {
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                avatarOption.classList.add('selected');
            }
        } else {
            title.textContent = 'Agregar Participante';
            document.getElementById('participant-name').value = '';
            document.getElementById('participant-color').value = '#dc2626';
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
            document.getElementById('participant-name').focus();
        }, 100);
    }

    hideParticipantModal() {
        document.getElementById('participant-modal').classList.remove('active');
        this.editingParticipant = null;
    }

    saveParticipant() {
        const nameInput = document.getElementById('participant-name');
        const name = nameInput.value.trim();
        const color = document.getElementById('participant-color').value;
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        
        if (!name) {
            alert('Por favor ingresa un nombre para el participante');
            nameInput.focus();
            return;
        }
        
        if (!selectedAvatar) {
            alert('Por favor selecciona un avatar');
            return;
        }

        if (this.editingParticipant) {
            // Editar participante existente
            this.editingParticipant.name = name;
            this.editingParticipant.color = color;
            this.editingParticipant.avatar = selectedAvatar.dataset.avatarId;
            this.editingParticipant.avatarEmoji = selectedAvatar.dataset.avatarEmoji;
        } else {
            // Agregar nuevo participante
            if (this.participants.length >= this.settings.maxParticipants) {
                alert(`Máximo ${this.settings.maxParticipants} participantes permitidos`);
                return;
            }

            this.participants.push({
                id: Date.now().toString(),
                name: name,
                color: color,
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

    updateCurrentPlayerDisplay() {
        const display = document.getElementById('current-player-display');
        
        if (this.participants.length === 0 || !this.roundInProgress) {
            display.innerHTML = `
                <div class="player-avatar" style="background-color: #6b7280;">👤</div>
                <span class="player-name">Esperando jugadores...</span>
            `;
            return;
        }

        const currentPlayer = this.participants[this.currentParticipantIndex];
        display.innerHTML = `
            <div class="player-avatar" style="background-color: ${currentPlayer.color}">
                ${currentPlayer.avatarEmoji}
            </div>
            <span class="player-name">${currentPlayer.name}</span>
        `;
    }

    // Sistema de puntuación y líderboard
    updateLeaderboard() {
        const leaderboardBody = document.getElementById('leaderboard-body');
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

    // Sistema de rondas y sesiones
    newSession() {
        if (this.participants.length === 0) {
            alert('Agrega participantes antes de iniciar una nueva sesión.');
            return;
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
            
            // Mostrar notificación
            this.showNotification('¡Nueva sesión iniciada!');
        }
    }

    resetGame() {
        if (confirm('¿Reiniciar completamente el juego? Se perderán todos los datos incluyendo participantes e historial.')) {
            this.participants = [];
            this.history = [];
            this.currentRound = 1;
            this.currentParticipantIndex = 0;
            this.roundInProgress = false;
            this.totalSessions = 1;
            this.updateUI();
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.renderHistory();
            this.updateCurrentPlayerDisplay();
            this.saveToStorage();
            
            this.showNotification('Juego reiniciado');
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

    checkWinner() {
        const winner = this.participants.find(p => p.score >= this.settings.targetScore);
        if (winner) {
            setTimeout(() => {
                alert(`🎉 ¡${winner.name} ha ganado el juego con ${winner.score} puntos!`);
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
        
        // Cargar configuración actual en el modal
        const currentTypeRadio = document.querySelector(`input[name="dice-type"][value="${this.settings.diceType}"]`);
        if (currentTypeRadio) {
            currentTypeRadio.checked = true;
        } else {
            // Si no existe, seleccionar d6 por defecto
            document.querySelector('input[name="dice-type"][value="d6"]').checked = true;
        }
        
        document.getElementById('dice-count').value = this.settings.diceCount;
        document.getElementById('dice-count-display').textContent = this.settings.diceCount;
        
        modal.classList.add('active');
    }

    hideDiceConfigModal() {
        document.getElementById('dice-config-modal').classList.remove('active');
    }

    saveDiceConfig() {
        const selectedDiceType = document.querySelector('input[name="dice-type"]:checked');
        const diceCount = parseInt(document.getElementById('dice-count').value);
        
        if (selectedDiceType) {
            this.settings.diceType = selectedDiceType.value;
        }
        this.settings.diceCount = diceCount;
        
        this.hideDiceConfigModal();
        this.updateUI();
        this.saveToStorage();
        this.showNotification('Configuración de dados actualizada');
    }

    // Sistema de configuración general
    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        
        // Cargar configuración actual en el modal
        document.getElementById('language-select').value = this.settings.language;
        document.getElementById('sound-toggle').checked = this.settings.soundEnabled;
        document.getElementById('target-score').value = this.settings.targetScore;
        document.getElementById('max-participants').value = this.settings.maxParticipants;
        document.getElementById('rotate-turns').checked = this.settings.rotateTurns;
        
        // Configurar tema actual
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.themeId === this.settings.theme) {
                option.classList.add('active');
            }
        });
        
        modal.classList.add('active');
    }

    hideSettingsModal() {
        document.getElementById('settings-modal').classList.remove('active');
    }

    saveSettings() {
        this.settings.language = document.getElementById('language-select').value;
        this.settings.soundEnabled = document.getElementById('sound-toggle').checked;
        this.settings.targetScore = parseInt(document.getElementById('target-score').value);
        this.settings.maxParticipants = parseInt(document.getElementById('max-participants').value);
        this.settings.rotateTurns = document.getElementById('rotate-turns').checked;
        
        // Aplicar tema
        const activeTheme = document.querySelector('.theme-option.active');
        if (activeTheme) {
            this.settings.theme = activeTheme.dataset.themeId;
            document.documentElement.setAttribute('data-theme', this.settings.theme);
        }
        
        // Ajustar participantes si es necesario
        if (this.participants.length > this.settings.maxParticipants) {
            if (confirm(`El máximo de participantes se redujo a ${this.settings.maxParticipants}. ¿Eliminar los participantes excedentes?`)) {
                this.participants = this.participants.slice(0, this.settings.maxParticipants);
                if (this.currentParticipantIndex >= this.participants.length) {
                    this.currentParticipantIndex = Math.max(0, this.participants.length - 1);
                }
                this.renderParticipants();
            }
        }
        
        this.hideSettingsModal();
        this.saveToStorage();
        this.updateUI();
        this.showNotification('Configuración guardada');
    }

    // Utilidades
    updateUI() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.getElementById('session-number').textContent = this.totalSessions;
        document.getElementById('round-number').textContent = this.currentRound;
        document.getElementById('dice-count-display').textContent = this.settings.diceCount;
        document.getElementById('dice-count').value = this.settings.diceCount;
        document.getElementById('counter-type').value = this.settings.counterType;
        
        // Actualizar estado del botón de lanzar
        const rollBtn = document.getElementById('roll-btn');
        if (this.participants.length === 0 || this.isRolling) {
            rollBtn.disabled = true;
        } else {
            rollBtn.disabled = false;
        }
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
    window.promptMaestro = new PromptMaestro();
});
