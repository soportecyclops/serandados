// PROMPT MAESTRO - Aplicación Web de Dados
// Archivo principal de JavaScript

class PromptMaestro {
    constructor() {
        this.participants = [];
        this.history = [];
        this.currentRound = 0;
        this.totalSessions = 0;
        this.settings = {
            language: 'es',
            theme: 'light',
            soundEnabled: true,
            targetScore: 100,
            maxParticipants: 4,
            diceType: 'd6',
            diceCount: 2,
            counterType: 'numbers'
        };
        
        this.currentParticipantIndex = 0;
        this.isRolling = false;
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.renderParticipants();
        this.updateLeaderboard();
        this.updateUI();
        this.setupAvatars();
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
                this.currentRound = gameState.currentRound || 0;
                this.totalSessions = gameState.totalSessions || 0;
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
        document.getElementById('next-round-btn').addEventListener('click', () => this.nextRound());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());

        // Configuración de dados
        document.getElementById('dice-type').addEventListener('change', (e) => {
            this.settings.diceType = e.target.value;
            this.saveToStorage();
        });

        document.getElementById('dice-count').addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            document.getElementById('dice-count-display').textContent = count;
            this.settings.diceCount = count;
            this.saveToStorage();
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

            this.displayResults(results, total);
            this.addToHistory(participant, results, total);
            
            // Actualizar puntaje del participante
            participant.score += total;
            participant.rounds++;

            this.currentParticipantIndex = (this.currentParticipantIndex + 1) % this.participants.length;
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
        }, 600);
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
            dice.textContent = '?';
            diceDisplay.appendChild(dice);
        }
    }

    displayResults(results, total) {
        const diceDisplay = document.getElementById('dice-display');
        const currentResult = document.getElementById('current-result');
        const individualDice = document.getElementById('individual-dice');

        diceDisplay.innerHTML = '';
        individualDice.innerHTML = '';

        results.forEach((result, index) => {
            const dice = document.createElement('div');
            dice.className = 'dice';
            dice.textContent = result;
            diceDisplay.appendChild(dice);

            const diceResult = document.createElement('span');
            diceResult.className = 'dice-result';
            diceResult.textContent = result;
            individualDice.appendChild(diceResult);
        });

        currentResult.querySelector('.total-score').textContent = total;
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
            document.getElementById('participant-color').value = '#4f46e5';
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
            const participantElement = document.createElement('div');
            participantElement.className = 'participant-item';
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
        if (confirm('¿Estás seguro de que quieres eliminar este participante?')) {
            this.participants.splice(index, 1);
            if (this.currentParticipantIndex >= this.participants.length) {
                this.currentParticipantIndex = 0;
            }
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.saveToStorage();
        }
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
                <td>${participant.score}</td>
                <td>${participant.rounds}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    updateScoreVisualization() {
        const scoreDisplay = document.getElementById('score-display');
        scoreDisplay.innerHTML = '';

        this.participants.forEach(participant => {
            const counter = document.createElement('div');
            counter.className = 'visual-counter';
            
            let displayValue = '';
            const score = participant.score;
            
            switch (this.settings.counterType) {
                case 'matches':
                    displayValue = '🔥'.repeat(Math.min(score, 10)) + (score > 10 ? `+${score}` : '');
                    break;
                case 'sticks':
                    displayValue = '│'.repeat(Math.min(score, 10)) + (score > 10 ? `+${score}` : '');
                    break;
                case 'stones':
                    displayValue = '●'.repeat(Math.min(score, 10)) + (score > 10 ? `+${score}` : '');
                    break;
                case 'beans':
                    displayValue = '🌰'.repeat(Math.min(score, 10)) + (score > 10 ? `+${score}` : '');
                    break;
                default:
                    displayValue = score.toString();
            }
            
            counter.innerHTML = `
                <div class="counter-value">${displayValue}</div>
                <div class="counter-label">${participant.name}</div>
            `;
            scoreDisplay.appendChild(counter);
        });
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
            timestamp: new Date().toLocaleString()
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
        if (confirm('¿Estás seguro de que quieres limpiar el historial?')) {
            this.history = [];
            this.renderHistory();
            this.saveToStorage();
        }
    }

    // Sistema de rondas y sesiones
    nextRound() {
        this.currentRound++;
        this.currentParticipantIndex = 0;
        this.updateUI();
        this.saveToStorage();
    }

    newSession() {
        if (confirm('¿Iniciar una nueva sesión? Se reiniciarán los puntajes pero se mantendrán los participantes.')) {
            this.participants.forEach(participant => {
                participant.score = 0;
                participant.rounds = 0;
            });
            this.currentRound = 0;
            this.currentParticipantIndex = 0;
            this.history = [];
            this.totalSessions++;
            this.updateUI();
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.renderHistory();
            this.saveToStorage();
        }
    }

    resetGame() {
        if (confirm('¿Reiniciar completamente el juego? Se perderán todos los datos.')) {
            this.participants = [];
            this.history = [];
            this.currentRound = 0;
            this.currentParticipantIndex = 0;
            this.updateUI();
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.renderHistory();
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

    // Sistema de configuración
    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        
        // Cargar configuración actual en el modal
        document.getElementById('language-select').value = this.settings.language;
        document.getElementById('sound-toggle').checked = this.settings.soundEnabled;
        document.getElementById('target-score').value = this.settings.targetScore;
        document.getElementById('max-participants').value = this.settings.maxParticipants;
        
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
        
        // Aplicar tema
        const activeTheme = document.querySelector('.theme-option.active');
        if (activeTheme) {
            this.settings.theme = activeTheme.dataset.theme;
            document.documentElement.setAttribute('data-theme', this.settings.theme);
        }
        
        // Ajustar participantes si es necesario
        if (this.participants.length > this.settings.maxParticipants) {
            this.participants = this.participants.slice(0, this.settings.maxParticipants);
            this.renderParticipants();
        }
        
        this.hideSettingsModal();
        this.saveToStorage();
        this.updateUI();
    }

    // Utilidades
    updateUI() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.getElementById('dice-count-display').textContent = this.settings.diceCount;
        document.getElementById('dice-count').value = this.settings.diceCount;
        document.getElementById('dice-type').value = this.settings.diceType;
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