// PROMPT MAESTRO - Aplicación Web de Dados
// Archivo principal de JavaScript - Versión Casino

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
            theme: 'dark',
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
        this.renderParticipants();
        this.updateLeaderboard();
        this.updateUI();
        this.setupAvatars();
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
            currentParticipantIndex: this.currentParticipantIndex
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
            } catch (e) {
                console.error('Error loading saved game:', e);
            }
        }
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
    }

    // Sistema de dados
    rollDice() {
        if (this.isRolling || this.participants.length === 0) return;

        // Iniciar ronda si es el primer lanzamiento
        if (!this.roundInProgress) {
            this.roundInProgress = true;
            this.currentParticipantIndex = 0;
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
            
            // Agregar puntos placeholder durante la animación
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
        
        // Configurar puntos según el valor
        const dotPositions = {
            1: [5], // Centro
            2: [1, 9], // Esquinas opuestas
            3: [1, 5, 9], // Diagonal
            4: [1, 3, 7, 9], // Esquinas
            5: [1, 3, 5, 7, 9], // Esquinas + centro
            6: [1, 3, 4, 6, 7, 9], // Dos columnas
            7: [1, 3, 4, 5, 6, 7, 9], // d6 + centro
            8: [1, 2, 3, 4, 6, 7, 8, 9], // Todas menos centro
            9: [1, 2, 3, 4, 5, 6, 7, 8, 9], // Todas
            10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 5] // Todas + centro duplicado (placeholder)
        };

        const positions = dotPositions[value] || dotPositions[6];
        
        for (let i = 1; i <= 9; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (positions.includes(i)) {
                diceFace.appendChild(dot);
            }
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
            color: var(--text-gold);
            padding: var(--spacing-xl);
            border-radius: var(--border-radius-lg);
            border: 3px solid var(--border-gold);
            font-size: var(--font-size-2xl);
            font-weight: bold;
            z-index: 1001;
            box-shadow: var(--shadow-lg);
        `;
        notification.textContent = `¡Ronda ${this.currentRound}!`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
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
        }
        
        modal.classList.add('active');
    }

    hideParticipantModal() {
        document.getElementById('participant-modal').classList.remove('active');
        this.editingParticipant = null;
    }

    saveParticipant() {
        const name = document.getElementById('participant-name').value.trim();
        const color = document.getElementById('participant-color').value;
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        
        if (!name) {
            alert('Por favor ingresa un nombre para el participante');
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
                const index = parseInt(e.target.dataset.index);
                this.showParticipantModal(this.participants[index]);
            });
        });

        document.querySelectorAll('.remove-participant').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeParticipant(index);
            });
        });
    }

    removeParticipant(index) {
        if (confirm('¿Estás seguro de que quieres eliminar este participante? Se perderán sus puntajes.')) {
            this.participants.splice(index, 1);
            if (this.currentParticipantIndex >= this.participants.length) {
                this.currentParticipantIndex = 0;
            }
            this.roundInProgress = false;
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
                <td style="font-weight: 700; color: var(--text-gold);">${participant.score}</td>
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
            const displayItems = this.getCounterDisplay(score);
            
            counter.innerHTML = `
                <div class="counter-player">
                    <div class="participant-avatar" style="background-color: ${participant.color}; width: 30px; height: 30px; font-size: 14px;">
                        ${participant.avatarEmoji}
                    </div>
                    <span>${participant.name}</span>
                </div>
                <div class="counter-display">
                    <div class="counter-items">${displayItems}</div>
                    <div class="counter-total">${score}</div>
                </div>
            `;
            scoreDisplay.appendChild(counter);
        });
    }

    getCounterDisplay(score) {
        let displayHTML = '';
        
        switch (this.settings.counterType) {
            case 'matches':
                displayHTML = this.groupItems('🔥', score, 5);
                break;
            case 'sticks':
                displayHTML = this.groupItems('│', score, 5);
                break;
            case 'stones':
                displayHTML = this.groupItems('●', score, 5);
                break;
            case 'beans':
                displayHTML = this.groupItems('🌰', score, 5);
                break;
            default:
                displayHTML = `<span>${score}</span>`;
        }
        
        return displayHTML;
    }

    groupItems(item, count, groupSize) {
        if (count === 0) return '';
        
        let html = '';
        const fullGroups = Math.floor(count / groupSize);
        const remainder = count % groupSize;
        
        // Agrupar de 5 en 5
        for (let i = 0; i < fullGroups; i++) {
            html += `<div class="counter-group">`;
            for (let j = 0; j < groupSize; j++) {
                html += `<span class="counter-item">${item}</span>`;
            }
            html += `</div>`;
        }
        
        // Resto
        if (remainder > 0) {
            html += `<div class="counter-group">`;
            for (let j = 0; j < remainder; j++) {
                html += `<span class="counter-item">${item}</span>`;
            }
            html += `</div>`;
        }
        
        return html;
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
        }
    }

    checkWinner() {
        const winner = this.participants.find(p => p.score >= this.settings.targetScore);
        if (winner) {
            setTimeout(() => {
                alert(`🎉 ¡${winner.name} ha ganado el juego con ${winner.score} puntos!`);
            }, 500);
        }
    }

    // Sistema de configuración de dados
    showDiceConfigModal() {
        const modal = document.getElementById('dice-config-modal');
        
        // Cargar configuración actual en el modal
        document.querySelector(`input[name="dice-type"][value="${this.settings.diceType}"]`).checked = true;
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
        
        // Configurar tema
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === this.settings.theme) {
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
            this.settings.theme = activeTheme.dataset.theme;
            document.documentElement.setAttribute('data-theme', this.settings.theme);
        }
        
        // Ajustar participantes si es necesario
        if (this.participants.length > this.settings.maxParticipants) {
            if (confirm(`El máximo de participantes se redujo a ${this.settings.maxParticipants}. ¿Eliminar los participantes excedentes?`)) {
                this.participants = this.participants.slice(0, this.settings.maxParticipants);
                this.renderParticipants();
            }
        }
        
        this.hideSettingsModal();
        this.saveToStorage();
        this.updateUI();
    }

    // Utilidades
    updateUI() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.getElementById('session-number').textContent = this.totalSessions;
        document.getElementById('round-number').textContent = this.currentRound;
        document.getElementById('dice-count-display').textContent = this.settings.diceCount;
        document.getElementById('dice-count').value = this.settings.diceCount;
        document.getElementById('counter-type').value = this.settings.counterType;
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
        // Placeholder para sonido - se implementará con archivos de sonido reales
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
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.promptMaestro = new PromptMaestro();
});

// Event listeners para los selectores de tema
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', (e) => {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
});
