// DiceMaster Pro - Aplicación Web de Dados
// Archivo principal de JavaScript - Versión Mejorada y Responsive

class DiceMasterPro {
    constructor() {
        this.participants = [];
        this.selectedParticipants = [];
        this.history = [];
        this.sessionsHistory = [];
        this.currentRound = 1;
        this.totalSessions = 1;
        this.currentParticipantIndex = 0;
        this.currentRollsInRound = 0; // Contador de lanzamientos en la ronda actual
        this.isRolling = false;
        this.roundInProgress = false;
        this.sessionStarted = false; // Controla si la sesión ha comenzado
        
        // Sistema de idiomas
        this.translations = {
            es: {
                appTitle: "DiceMaster Pro",
                session: "Sesión #",
                round: "Ronda",
                turn: "Turno",
                rollDice: "Lanzar Dados",
                waitingPlayers: "Esperando jugadores...",
                nextPlayer: "Se prepara:",
                participants: "Participantes",
                addParticipant: "Agregar Participante",
                editParticipant: "Editar Participante",
                scores: "Puntuaciones",
                leaderboard: "Tabla de Posiciones",
                visualScore: "Tanteador Visual",
                newSession: "Nueva Sesión",
                resetAll: "Reiniciar Todo",
                history: "Historial",
                currentResult: "Resultado Actual",
                noParticipants: "No hay participantes. Agrega el primero.",
                noHistory: "No hay historial de tiradas aún.",
                noSessions: "No hay partidas anteriores.",
                startRolling: "Lanza los dados para comenzar",
                // Y más traducciones...
            },
            en: {
                appTitle: "DiceMaster Pro",
                session: "Session #",
                round: "Round",
                turn: "Turn",
                rollDice: "Roll Dice",
                waitingPlayers: "Waiting for players...",
                nextPlayer: "Next:",
                participants: "Participants",
                addParticipant: "Add Participant",
                editParticipant: "Edit Participant",
                scores: "Scores",
                leaderboard: "Leaderboard",
                visualScore: "Visual Score",
                newSession: "New Session",
                resetAll: "Reset All",
                history: "History",
                currentResult: "Current Result",
                noParticipants: "No participants. Add the first one.",
                noHistory: "No roll history yet.",
                noSessions: "No previous games.",
                startRolling: "Roll dice to start",
                // Y más traducciones...
            }
        };
        
        this.settings = {
            language: 'es',
            theme: 'classic-casino',
            soundEnabled: true,
            targetScore: 100,
            maxParticipants: 4,
            diceType: 'd6',
            diceCount: 2,
            rollsPerPlayer: 1, // NUEVO: Lanzamientos por jugador por ronda
            counterType: 'numbers',
            rotateTurns: false,
            gameMode: 'classic',
            maxRounds: 0
        };
        
        this.gameModes = {
            'classic': {
                name: { es: 'Clásico', en: 'Classic' },
                description: { 
                    es: 'Juego básico de acumulación de puntos', 
                    en: 'Basic point accumulation game' 
                },
                minPlayers: 2,
                maxPlayers: 10,
                defaultTarget: 100,
                specialRules: { 
                    es: ['Sin reglas especiales'], 
                    en: ['No special rules'] 
                }
            },
            'poker': {
                name: { es: 'Poker de Dados', en: 'Dice Poker' },
                description: { 
                    es: 'Busca las mejores combinaciones de poker', 
                    en: 'Find the best poker combinations' 
                },
                minPlayers: 2,
                maxPlayers: 8,
                defaultTarget: 1000,
                specialRules: { 
                    es: ['Combinaciones especiales', '3 rondas por jugador'], 
                    en: ['Special combinations', '3 rounds per player'] 
                }
            },
            'generala': {
                name: { es: 'Generala', en: 'Generala' },
                description: { 
                    es: 'Juego tradicional argentino', 
                    en: 'Traditional Argentinian game' 
                },
                minPlayers: 2,
                maxPlayers: 6,
                defaultTarget: 10000,
                specialRules: { 
                    es: ['Generala servida', 'Generala doble', 'Escalera'], 
                    en: ['Straight generala', 'Double generala', 'Straight'] 
                }
            },
            'blackjack': {
                name: { es: 'Blackjack 21', en: 'Blackjack 21' },
                description: { 
                    es: 'Acércate a 21 sin pasarte', 
                    en: 'Get close to 21 without going over' 
                },
                minPlayers: 2,
                maxPlayers: 7,
                defaultTarget: 500,
                specialRules: { 
                    es: ['Blackjack natural', 'Dividir pares', 'Doblar apuesta'], 
                    en: ['Natural blackjack', 'Split pairs', 'Double down'] 
                }
            },
            'truco': {
                name: { es: 'Truco Argentino', en: 'Argentinian Truco' },
                description: { 
                    es: 'Juego de cartas adaptado a dados', 
                    en: 'Card game adapted to dice' 
                },
                minPlayers: 2,
                maxPlayers: 4,
                defaultTarget: 30,
                specialRules: { 
                    es: ['Envido', 'Truco', 'Flor'], 
                    en: ['Envido', 'Truco', 'Flor'] 
                }
            }
        };
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.setupAvatars();
        this.setupThemes();
        this.setupGameModes();
        this.setupParticipantSelection();
        this.renderParticipants();
        this.updateLeaderboard();
        this.updateUI();
        this.updateCurrentPlayerDisplay();
        this.updateScoreVisualization();
        this.renderHistory();
        this.renderSessionsHistory();
        this.applyLanguage(); // Aplicar idioma al inicializar
    }

    // Sistema de idiomas
    applyLanguage() {
        const lang = this.settings.language;
        const t = this.translations[lang];
        
        // Actualizar textos estáticos
        this.setElementText('app-title', t.appTitle);
        this.setElementText('session-label', t.session);
        this.setElementText('round-label', t.round);
        this.setElementText('turn-label', t.turn);
        
        // Botones y controles
        const rollBtn = document.getElementById('roll-btn');
        if (rollBtn) rollBtn.querySelector('span').textContent = t.rollDice;
        
        this.setElementText('participants-title', t.participants);
        this.setElementText('scores-title', t.scores);
        this.setElementText('new-session-btn', t.newSession);
        this.setElementText('reset-btn', t.resetAll);
        this.setElementText('show-history-btn', t.history);
        
        // Actualizar textos dinámicos
        this.updateCurrentPlayerDisplay();
        this.renderParticipants();
        this.updateLeaderboard();
        
        // Actualizar modales
        this.updateGameModeDescription();
    }

    translate(key) {
        const lang = this.settings.language;
        return this.translations[lang][key] || key;
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
            currentRollsInRound: this.currentRollsInRound,
            roundInProgress: this.roundInProgress,
            sessionStarted: this.sessionStarted
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
                this.currentRollsInRound = gameState.currentRollsInRound || 0;
                this.roundInProgress = gameState.roundInProgress || false;
                this.sessionStarted = gameState.sessionStarted || false;
                
                // Asegurar que maxRounds y rollsPerPlayer existen
                if (typeof this.settings.maxRounds === 'undefined') {
                    this.settings.maxRounds = 0;
                }
                if (typeof this.settings.rollsPerPlayer === 'undefined') {
                    this.settings.rollsPerPlayer = 1;
                }
            } catch (e) {
                console.error('Error loading saved game:', e);
                this.resetToDefault();
            }
        }
    }

    // Configuración de event listeners
    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Botones principales
        this.setupButton('roll-btn', () => this.rollDice());
        this.setupButton('new-session-btn', () => this.newSession());
        this.setupButton('reset-btn', () => this.resetGame());

        // Configuración de dados
        this.setupButton('dice-config-btn', () => this.showDiceConfigModal());
        this.setupButton('close-dice-config', () => this.hideDiceConfigModal());
        this.setupButton('save-dice-config', () => this.saveDiceConfig());
        this.setupButton('cancel-dice-config', () => this.hideDiceConfigModal());

        // Configuración de participantes
        this.setupButton('add-participant-btn', () => this.showParticipantModal());
        this.setupButton('remove-participant-btn', () => this.removeSelectedParticipants());

        // Tema e idioma
        this.setupButton('theme-language-btn', () => this.showThemeLanguageModal());
        this.setupButton('close-theme-language', () => this.hideThemeLanguageModal());
        this.setupButton('save-theme-language', () => this.saveThemeLanguage());
        this.setupButton('cancel-theme-language', () => this.hideThemeLanguageModal());

        // Modales de participante
        this.setupButton('close-participant-modal', () => this.hideParticipantModal());
        this.setupButton('save-participant', () => this.saveParticipant());
        this.setupButton('cancel-participant', () => this.hideParticipantModal());

        // Historial
        this.setupButton('show-history-btn', () => this.showHistoryModal());
        this.setupButton('close-history-modal', () => this.hideHistoryModal());
        this.setupButton('close-history', () => this.hideHistoryModal());
        this.setupButton('clear-history-btn', () => this.clearHistory());

        // Pantalla completa
        this.setupButton('fullscreen-btn', () => this.toggleFullscreen());

        // Tabs del historial
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchHistoryTab(tabId);
            });
        });

        // Contador visual
        const counterType = document.getElementById('counter-type');
        if (counterType) {
            counterType.addEventListener('change', (e) => {
                this.settings.counterType = e.target.value;
                this.updateScoreVisualization();
                this.saveToStorage();
            });
        }

        // Slider de cantidad de dados
        const diceCount = document.getElementById('dice-count');
        if (diceCount) {
            diceCount.setAttribute('max', '5');
            diceCount.addEventListener('input', (e) => {
                const count = parseInt(e.target.value);
                const display = document.getElementById('dice-count-display');
                if (display) display.textContent = count;
            });
        }

        // NUEVO: Slider de lanzamientos por jugador
        const rollsPerPlayer = document.getElementById('rolls-per-player');
        if (rollsPerPlayer) {
            rollsPerPlayer.addEventListener('input', (e) => {
                const count = parseInt(e.target.value);
                const display = document.getElementById('rolls-per-player-display');
                if (display) display.textContent = count;
            });
        }

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
                if (document.getElementById('participant-modal')?.classList.contains('active')) {
                    this.saveParticipant();
                }
                if (document.getElementById('theme-language-modal')?.classList.contains('active')) {
                    this.saveThemeLanguage();
                }
                if (document.getElementById('dice-config-modal')?.classList.contains('active')) {
                    this.saveDiceConfig();
                }
            }
        });

        console.log('Event listeners configurados correctamente');
    }

    // Helper para configurar botones de forma segura
    setupButton(id, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        } else {
            console.warn(`Elemento con ID '${id}' no encontrado`);
        }
    }

    // Sistema de selección de participantes
    setupParticipantSelection() {
        // Este método se llama desde renderParticipants para conectar los event listeners
    }

    // Actualizar visibilidad del botón eliminar
    updateDeleteButtonVisibility() {
        const removeBtn = document.getElementById('remove-participant-btn');
        if (removeBtn) {
            if (this.selectedParticipants.length > 0 && !this.sessionStarted) {
                removeBtn.style.display = 'flex';
                removeBtn.textContent = `🗑️ (${this.selectedParticipants.length})`;
            } else {
                removeBtn.style.display = 'none';
            }
        }
    }

    // Verificar si un participante puede ser editado
    canEditParticipant(participant) {
        // Solo se puede editar si la sesión NO ha comenzado o estamos en la ronda 1
        return !this.sessionStarted || (this.currentRound === 1 && this.currentRollsInRound === 0);
    }

    // Verificar si se pueden agregar participantes
    canAddParticipants() {
        // Se pueden agregar participantes solo en la ronda 1 antes de que comience el juego
        return !this.sessionStarted || (this.currentRound === 1 && this.currentRollsInRound === 0);
    }

    // Eliminar participantes seleccionados
    removeSelectedParticipants() {
        if (this.selectedParticipants.length === 0) {
            this.showNotification(this.translate('noParticipantsSelected'));
            return;
        }

        // Verificar si se pueden eliminar participantes
        if (!this.canAddParticipants()) {
            this.showNotification(this.translate('cannotRemoveAfterStart'));
            return;
        }

        const count = this.selectedParticipants.length;
        if (confirm(this.translate('confirmRemoveParticipants').replace('{count}', count))) {
            // Filtrar participantes para mantener solo los no seleccionados
            this.participants = this.participants.filter(p => 
                !this.selectedParticipants.includes(p.id)
            );
            
            // Limpiar selección
            this.selectedParticipants = [];
            
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.updateCurrentPlayerDisplay();
            this.updateDeleteButtonVisibility();
            this.saveToStorage();
            
            this.showNotification(this.translate('participantsRemoved').replace('{count}', count));
        }
    }

    // Reiniciar sesión (mantener participantes)
    resetSession() {
        this.participants.forEach(participant => {
            participant.score = 0;
            participant.rounds = 0;
        });
        this.currentRound = 1;
        this.currentParticipantIndex = 0;
        this.currentRollsInRound = 0;
        this.roundInProgress = false;
        this.sessionStarted = false;
        this.history = [];
        this.renderHistory();
        this.updateUI();
    }

    // Sistema de dados - MODIFICADO para manejar múltiples lanzamientos
    rollDice() {
        if (this.isRolling || this.participants.length === 0) {
            if (this.participants.length === 0) {
                this.showNotification(this.translate('addParticipantsFirst'));
            }
            return;
        }

        // Marcar que la sesión ha comenzado al primer lanzamiento
        if (!this.sessionStarted) {
            this.sessionStarted = true;
            this.showNotification(this.translate('sessionStarted'));
        }

        if (!this.roundInProgress) {
            this.roundInProgress = true;
            this.currentParticipantIndex = 0;
            this.currentRollsInRound = 0;
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
            
            // Aplicar reglas del modo de juego
            total = this.applyGameModeRules(results, total, participant);
            
            participant.score += total;
            participant.rounds++;

            // Incrementar contador de lanzamientos
            this.currentRollsInRound++;

            // Verificar si el jugador actual ha completado sus lanzamientos
            if (this.currentRollsInRound >= this.settings.rollsPerPlayer) {
                this.currentRollsInRound = 0;
                this.currentParticipantIndex++;
                
                // Si es el último participante, terminar la ronda
                if (this.currentParticipantIndex >= this.participants.length) {
                    this.endRound();
                }
            }

            this.updateCurrentPlayerDisplay();
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

    // Aplicar reglas de modos de juego (sin cambios)
    applyGameModeRules(results, total, participant) {
        switch(this.settings.gameMode) {
            case 'poker':
                return this.calculatePokerScore(results);
            case 'generala':
                return this.calculateGeneralaScore(results);
            case 'blackjack':
                return this.calculateBlackjackScore(results, participant);
            case 'truco':
                return this.calculateTrucoScore(results);
            default:
                return total;
        }
    }

    calculatePokerScore(results) {
        const counts = {};
        results.forEach(num => {
            counts[num] = (counts[num] || 0) + 1;
        });

        const pairs = Object.values(counts).filter(count => count >= 2).length;
        const threeOfKind = Object.values(counts).some(count => count >= 3);
        const fourOfKind = Object.values(counts).some(count => count >= 4);
        const fiveOfKind = Object.values(counts).some(count => count >= 5);

        if (fiveOfKind) return 100;
        if (fourOfKind) return 50;
        if (threeOfKind && pairs >= 2) return 40;
        if (threeOfKind) return 30;
        if (pairs >= 2) return 20;
        if (pairs >= 1) return 10;

        return results.reduce((a, b) => a + b, 0);
    }

    calculateGeneralaScore(results) {
        const counts = {};
        results.forEach(num => {
            counts[num] = (counts[num] || 0) + 1;
        });

        if (Object.values(counts).some(count => count === 5)) {
            return 1000;
        }

        const sorted = [...results].sort((a, b) => a - b);
        const isStraight = sorted.every((num, index) => 
            index === 0 || num === sorted[index - 1] + 1
        );
        if (isStraight) return 500;

        return results.reduce((a, b) => a + b, 0);
    }

    calculateBlackjackScore(results, participant) {
        let total = results.reduce((a, b) => a + b, 0);
        
        if (participant.rounds === 0 && total === 21) {
            this.showNotification(this.translate('blackjackNatural'));
            return total + 50;
        }

        if (total > 21) {
            this.showNotification(this.translate('busted'));
            return -20;
        }

        return total;
    }

    calculateTrucoScore(results) {
        const trucoValues = {
            1: 11,
            2: 10,
            3: 9,
            4: 8,
            5: 7,
            6: 6
        };

        const total = results.reduce((sum, num) => sum + (trucoValues[num] || num), 0);
        
        const counts = {};
        results.forEach(num => {
            counts[num] = (counts[num] || 0) + 1;
        });

        const pairs = Object.values(counts).filter(count => count >= 2).length;
        if (pairs > 0) {
            return total + (pairs * 10);
        }

        return total;
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
        if (!diceDisplay) return;

        diceDisplay.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const dice = document.createElement('div');
            dice.className = 'dice rolling';
            
            const diceFace = document.createElement('div');
            diceFace.className = 'dice-face';
            
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

        if (!diceDisplay || !currentResult || !individualDice) return;

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
            
            this.createDiceDots(diceFace, result);
            
            dice.appendChild(diceFace);
            diceDisplay.appendChild(dice);

            const diceResult = document.createElement('span');
            diceResult.className = 'dice-result';
            diceResult.textContent = result;
            individualDice.appendChild(diceResult);
        });

        const totalScore = currentResult.querySelector('.total-score');
        if (totalScore) totalScore.textContent = total;
    }

    createDiceDots(diceFace, value) {
        diceFace.innerHTML = '';
        const dotsNeeded = Math.min(value, 6);
        
        for (let i = 0; i < dotsNeeded; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            diceFace.appendChild(dot);
        }
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

    // Sistema de temas
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
        if (!themeGrid) {
            console.warn('theme-grid no encontrado');
            return;
        }

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
                this.settings.theme = theme.id;
                document.documentElement.setAttribute('data-theme', theme.id);
                this.saveToStorage();
            });

            themeGrid.appendChild(themeOption);
        });
    }

    // Configuración de modos de juego
    setupGameModes() {
        const gameModeSelect = document.getElementById('game-mode');
        if (!gameModeSelect) return;

        gameModeSelect.innerHTML = '';

        Object.entries(this.gameModes).forEach(([id, mode]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = mode.name[this.settings.language];
            if (id === this.settings.gameMode) {
                option.selected = true;
            }
            gameModeSelect.appendChild(option);
        });

        gameModeSelect.addEventListener('change', (e) => {
            this.settings.gameMode = e.target.value;
            this.updateGameModeDescription();
            this.saveToStorage();
        });

        this.updateGameModeDescription();
    }

    updateGameModeDescription() {
        const descriptionElement = document.getElementById('game-mode-description');
        const rulesElement = document.getElementById('game-mode-rules');
        
        if (!descriptionElement || !rulesElement) return;

        const mode = this.gameModes[this.settings.gameMode];
        if (mode) {
            descriptionElement.textContent = mode.description[this.settings.language];
            
            if (this.settings.targetScore === 100) {
                this.settings.targetScore = mode.defaultTarget;
                const targetScoreInput = document.getElementById('target-score');
                if (targetScoreInput) targetScoreInput.value = mode.defaultTarget;
            }

            const rulesHTML = mode.specialRules[this.settings.language].length > 0 
                ? `<strong>${this.translate('specialRules')}:</strong><br>${mode.specialRules[this.settings.language].join(', ')}`
                : this.translate('noSpecialRules');
                
            rulesElement.innerHTML = rulesHTML;
        }
    }

    // Modales
    showParticipantModal(participant = null) {
        // Verificar si se puede editar
        if (participant && !this.canEditParticipant(participant)) {
            this.showNotification(this.translate('cannotEditAfterStart'));
            return;
        }

        this.editingParticipant = participant;
        const modal = document.getElementById('participant-modal');
        const title = document.getElementById('participant-modal-title');
        
        if (!modal || !title) return;
        
        if (participant) {
            title.textContent = this.translate('editParticipant');
            document.getElementById('participant-name').value = participant.name;
            
            const avatarOption = document.querySelector(`[data-avatar-id="${participant.avatar}"]`);
            if (avatarOption) {
                document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
                avatarOption.classList.add('selected');
            }
        } else {
            // Verificar si se puede agregar participantes
            if (!this.canAddParticipants()) {
                this.showNotification(this.translate('cannotAddDuringSession'));
                return;
            }
            
            title.textContent = this.translate('addParticipant');
            document.getElementById('participant-name').value = '';
            document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
            
            const firstAvatar = document.querySelector('.avatar-option');
            if (firstAvatar) firstAvatar.classList.add('selected');
        }
        
        modal.classList.add('active');
        
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
            this.showNotification(this.translate('enterParticipantName'));
            nameInput.focus();
            return;
        }
        
        if (!selectedAvatar) {
            this.showNotification(this.translate('selectAvatar'));
            return;
        }

        if (this.editingParticipant) {
            // Verificar si se puede editar
            if (!this.canEditParticipant(this.editingParticipant)) {
                this.showNotification(this.translate('cannotEditAfterStart'));
                return;
            }
            
            this.editingParticipant.name = name;
            this.editingParticipant.avatar = selectedAvatar.dataset.avatarId;
            this.editingParticipant.avatarEmoji = selectedAvatar.dataset.avatarEmoji;
            this.editingParticipant.color = selectedAvatar.dataset.avatarColor;
        } else {
            // Verificar si se puede agregar participantes
            if (!this.canAddParticipants()) {
                this.showNotification(this.translate('cannotAddDuringSession'));
                return;
            }
            
            if (this.participants.length >= this.settings.maxParticipants) {
                this.showNotification(this.translate('maxParticipantsReached').replace('{max}', this.settings.maxParticipants));
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

            // Activar ronda 1 automáticamente al crear el primer participante
            if (this.participants.length === 1) {
                this.roundInProgress = true;
                this.updateCurrentPlayerDisplay();
                this.showNotification(this.translate('firstParticipantAdded'));
            }
        }

        this.hideParticipantModal();
        this.renderParticipants();
        this.updateLeaderboard();
        this.updateScoreVisualization();
        this.updateCurrentPlayerDisplay();
        this.saveToStorage();
        this.showNotification(this.translate('participantSaved'));
    }

    // Modal de historial
    showHistoryModal() {
        const modal = document.getElementById('history-modal');
        if (!modal) return;
        
        this.renderHistory();
        this.renderSessionsHistory();
        modal.classList.add('active');
    }

    hideHistoryModal() {
        const modal = document.getElementById('history-modal');
        if (modal) modal.classList.remove('active');
    }

    switchHistoryTab(tabId) {
        // Actualizar botones de tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Actualizar contenido de tabs
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    // Modal de tema e idioma
    showThemeLanguageModal() {
        const modal = document.getElementById('theme-language-modal');
        if (!modal) {
            console.error('Modal de tema e idioma no encontrado');
            return;
        }
        
        this.setFormValue('language-select', this.settings.language);
        this.setFormValue('sound-toggle', this.settings.soundEnabled);
        this.setFormValue('target-score', this.settings.targetScore);
        this.setFormValue('max-rounds', this.settings.maxRounds);
        this.setFormValue('rotate-turns', this.settings.rotateTurns);
        this.setFormValue('game-mode', this.settings.gameMode);

        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.themeId === this.settings.theme) {
                option.classList.add('active');
            }
        });

        this.updateGameModeDescription();
        
        modal.classList.add('active');
        console.log('Modal de tema e idioma abierto');
    }

    hideThemeLanguageModal() {
        const modal = document.getElementById('theme-language-modal');
        if (modal) modal.classList.remove('active');
    }

    saveThemeLanguage() {
        console.log('Guardando configuración de tema e idioma...');
        
        const oldLanguage = this.settings.language;
        this.settings.language = this.getFormValue('language-select');
        this.settings.soundEnabled = this.getFormValue('sound-toggle');
        this.settings.targetScore = parseInt(this.getFormValue('target-score')) || 100;
        this.settings.maxRounds = parseInt(this.getFormValue('max-rounds')) || 0;
        this.settings.rotateTurns = this.getFormValue('rotate-turns');
        this.settings.gameMode = this.getFormValue('game-mode');

        if (this.settings.targetScore > 1000) {
            this.settings.targetScore = 1000;
            this.setFormValue('target-score', 1000);
            this.showNotification(this.translate('targetScoreAdjusted'));
        }

        if (this.settings.maxRounds > 50) {
            this.settings.maxRounds = 50;
            this.setFormValue('max-rounds', 50);
            this.showNotification(this.translate('maxRoundsAdjusted'));
        }

        const activeTheme = document.querySelector('.theme-option.active');
        if (activeTheme) {
            this.settings.theme = activeTheme.dataset.themeId;
            document.documentElement.setAttribute('data-theme', this.settings.theme);
        }
        
        this.hideThemeLanguageModal();
        this.saveToStorage();
        
        // Si cambió el idioma, aplicar las traducciones
        if (oldLanguage !== this.settings.language) {
            this.applyLanguage();
        }
        
        this.updateUI();
        this.showNotification(this.translate('settingsSaved'));
    }

    // Helpers para formularios
    setFormValue(id, value) {
        const element = document.getElementById(id);
        if (!element) return;
        
        if (element.type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
    }

    getFormValue(id) {
        const element = document.getElementById(id);
        if (!element) return null;
        
        if (element.type === 'checkbox') {
            return element.checked;
        } else {
            return element.value;
        }
    }

    renderParticipants() {
        const participantsList = document.getElementById('participants-list');
        if (!participantsList) return;
        
        if (this.participants.length === 0) {
            participantsList.innerHTML = `<div class="empty-state"><p>${this.translate('noParticipants')}</p></div>`;
            this.updateDeleteButtonVisibility();
            return;
        }

        participantsList.innerHTML = '';
        this.participants.forEach((participant, index) => {
            const isCurrentTurn = this.roundInProgress && index === this.currentParticipantIndex;
            const isSelected = this.selectedParticipants.includes(participant.id);
            const canEdit = this.canEditParticipant(participant);
            
            const participantElement = document.createElement('div');
            participantElement.className = `participant-item ${isCurrentTurn ? 'current-turn' : ''} ${isSelected ? 'selected' : ''}`;
            participantElement.dataset.participantId = participant.id;
            
            const editButton = canEdit ? 
                `<button class="btn-icon-small edit-participant" data-index="${index}">✏️</button>` : 
                `<button class="btn-icon-small" disabled title="${this.translate('cannotEditDuringSession')}">🔒</button>`;
            
            participantElement.innerHTML = `
                <div class="participant-avatar" style="background-color: ${participant.color}">
                    ${participant.avatarEmoji}
                </div>
                <div class="participant-info">
                    <div class="participant-name">${participant.name}</div>
                    <div class="participant-score">${this.translate('score')}: ${participant.score} | ${this.translate('rounds')}: ${participant.rounds}</div>
                </div>
                <div class="participant-actions">
                    ${editButton}
                </div>
            `;
            participantsList.appendChild(participantElement);
        });

        document.querySelectorAll('.participant-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.edit-participant') || e.target.closest('.btn-icon-small[disabled]')) {
                    return;
                }
                
                const participantId = item.dataset.participantId;
                const participant = this.participants.find(p => p.id === participantId);
                
                if (participant && this.canEditParticipant(participant)) {
                    this.toggleParticipantSelection(participantId);
                }
            });
        });

        document.querySelectorAll('.edit-participant').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(e.target.closest('button').dataset.index);
                this.showParticipantModal(this.participants[index]);
            });
        });

        this.updateDeleteButtonVisibility();
    }

    // Alternar selección de participante
    toggleParticipantSelection(participantId) {
        const index = this.selectedParticipants.indexOf(participantId);
        if (index > -1) {
            this.selectedParticipants.splice(index, 1);
        } else {
            this.selectedParticipants.push(participantId);
        }
        
        this.renderParticipants();
        this.updateDeleteButtonVisibility();
    }

    updateCurrentPlayerDisplay() {
        const currentDisplay = document.getElementById('current-player-display');
        const nextDisplay = document.getElementById('next-player-display');
        const currentTurnDisplay = document.getElementById('current-turn-display');
        
        if (!currentDisplay || !nextDisplay || !currentTurnDisplay) return;
        
        if (this.participants.length === 0 || !this.roundInProgress) {
            currentDisplay.innerHTML = `
                <div class="player-avatar" style="background-color: #6b7280;">👤</div>
                <span class="player-name">${this.translate('waitingPlayers')}</span>
            `;
            nextDisplay.innerHTML = `
                <div class="player-avatar" style="background-color: #6b7280;">⏭️</div>
                <span class="player-name">${this.translate('nextPlayer')} -</span>
            `;
            currentTurnDisplay.textContent = '-';
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
            <span class="player-name">${this.translate('nextPlayer')} ${nextPlayer.name}</span>
        `;
        
        currentTurnDisplay.textContent = currentPlayer.name;
    }

    updateLeaderboard() {
        const leaderboardBody = document.getElementById('leaderboard-body');
        if (!leaderboardBody) return;
        
        const sortedParticipants = [...this.participants].sort((a, b) => b.score - a.score);
        leaderboardBody.innerHTML = '';
        
        if (sortedParticipants.length === 0) {
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
                        ${this.translate('noParticipants')}
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
            scoreDisplay.innerHTML = `<div class="empty-state"><p>${this.translate('addParticipantsForScore')}</p></div>`;
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

        for (let i = 0; i < fullGroups; i++) {
            displayHTML += `<div class="counter-group">`;
            for (let j = 0; j < 5; j++) {
                displayHTML += `<span class="counter-item">${itemChar}</span>`;
            }
            displayHTML += `</div>`;
        }

        if (remainder > 0) {
            displayHTML += `<div class="counter-group">`;
            for (let j = 0; j < remainder; j++) {
                displayHTML += `<span class="counter-item">${itemChar}</span>`;
            }
            displayHTML += `</div>`;
        }

        return displayHTML;
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

    updateUI() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        this.setElementText('session-number', this.totalSessions);
        this.setElementText('round-number', this.currentRound);
        this.setElementText('dice-count-display', this.settings.diceCount);
        
        const diceCountInput = document.getElementById('dice-count');
        if (diceCountInput) {
            diceCountInput.value = this.settings.diceCount;
            diceCountInput.setAttribute('max', '5');
        }
        
        // NUEVO: Actualizar display de lanzamientos por jugador
        const rollsPerPlayerInput = document.getElementById('rolls-per-player');
        const rollsPerPlayerDisplay = document.getElementById('rolls-per-player-display');
        if (rollsPerPlayerInput && rollsPerPlayerDisplay) {
            rollsPerPlayerInput.value = this.settings.rollsPerPlayer;
            rollsPerPlayerDisplay.textContent = this.settings.rollsPerPlayer;
        }
        
        const counterType = document.getElementById('counter-type');
        if (counterType) counterType.value = this.settings.counterType;
        
        const rollBtn = document.getElementById('roll-btn');
        if (rollBtn) {
            rollBtn.disabled = this.participants.length === 0 || this.isRolling;
        }

        const addParticipantBtn = document.getElementById('add-participant-btn');
        if (addParticipantBtn) {
            if (!this.canAddParticipants()) {
                addParticipantBtn.disabled = true;
                addParticipantBtn.title = this.translate('cannotAddDuringSession');
            } else {
                addParticipantBtn.disabled = false;
                addParticipantBtn.title = this.translate('addParticipant');
            }
        }
    }

    setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }

    endRound() {
        this.currentRound++;
        
        if (this.settings.maxRounds > 0 && this.currentRound > this.settings.maxRounds) {
            this.endSession();
            return;
        }
        
        this.roundInProgress = false;
        this.currentRollsInRound = 0;
        
        if (this.settings.rotateTurns && this.participants.length > 1) {
            const first = this.participants.shift();
            this.participants.push(first);
        }
        
        this.currentParticipantIndex = 0;
        this.updateCurrentPlayerDisplay();
        this.updateUI();
        this.saveToStorage();
        
        this.showRoundNotification();
    }

    // Finalizar sesión por límite de rondas
    endSession() {
        const sortedParticipants = [...this.participants].sort((a, b) => b.score - a.score);
        const winner = sortedParticipants[0];
        
        setTimeout(() => {
            alert(`🎉 ${this.translate('sessionEnded')} ${winner.name} ${this.translate('isTheWinner')} ${winner.score} ${this.translate('pointsAfter')} ${this.settings.maxRounds} ${this.translate('rounds')}.`);
            this.saveSessionToHistory();
            if (confirm(this.translate('startNewSession'))) {
                this.newSession();
            }
        }, 1000);
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
        notification.textContent = `${this.translate('round')} ${this.currentRound}!`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 2000);
    }

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
            timestamp: new Date().toLocaleString(this.settings.language === 'es' ? 'es-ES' : 'en-US')
        };
        
        this.history.unshift(historyItem);
        this.renderHistory();
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        if (this.history.length === 0) {
            historyList.innerHTML = `<div class="empty-state"><p>${this.translate('noHistory')}</p></div>`;
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
                    <small>(${this.translate('round')} ${item.round})</small>
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
        if (confirm(this.translate('confirmClearHistory'))) {
            this.history = [];
            this.renderHistory();
            this.saveToStorage();
        }
    }

    renderSessionsHistory() {
        const sessionsList = document.getElementById('sessions-list');
        if (!sessionsList) return;
        
        if (this.sessionsHistory.length === 0) {
            sessionsList.innerHTML = `<div class="empty-state"><p>${this.translate('noSessions')}</p></div>`;
            return;
        }

        sessionsList.innerHTML = '';
        this.sessionsHistory.slice(0, 10).forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            sessionItem.innerHTML = `
                <div class="session-info">
                    <div class="session-winner">${session.winner}</div>
                    <div class="session-details">${this.translate('score')}: ${session.score} | ${this.translate('rounds')}: ${session.rounds}</div>
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
            date: new Date().toLocaleString(this.settings.language === 'es' ? 'es-ES' : 'en-US'),
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
            this.showNotification(this.translate('addParticipantsFirst'));
            return;
        }

        if (this.participants.some(p => p.score > 0)) {
            this.saveSessionToHistory();
        }

        if (confirm(this.translate('confirmNewSession'))) {
            this.participants.forEach(participant => {
                participant.score = 0;
                participant.rounds = 0;
            });
            this.currentRound = 1;
            this.currentParticipantIndex = 0;
            this.currentRollsInRound = 0;
            this.roundInProgress = false;
            this.sessionStarted = false;
            this.history = [];
            this.totalSessions++;
            this.updateUI();
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.renderHistory();
            this.updateCurrentPlayerDisplay();
            this.saveToStorage();
            
            this.showNotification(this.translate('newSessionStarted'));
        }
    }

    resetGame() {
        if (confirm(this.translate('confirmReset'))) {
            this.participants = [];
            this.selectedParticipants = [];
            this.history = [];
            this.sessionsHistory = [];
            this.currentRound = 1;
            this.currentParticipantIndex = 0;
            this.currentRollsInRound = 0;
            this.roundInProgress = false;
            this.sessionStarted = false;
            this.totalSessions = 1;
            this.updateUI();
            this.renderParticipants();
            this.updateLeaderboard();
            this.updateScoreVisualization();
            this.renderHistory();
            this.renderSessionsHistory();
            this.updateCurrentPlayerDisplay();
            this.saveToStorage();
            
            this.showNotification(this.translate('gameReset'));
        }
    }

    checkWinner() {
        const winner = this.participants.find(p => p.score >= this.settings.targetScore);
        if (winner) {
            setTimeout(() => {
                alert(`🎉 ${winner.name} ${this.translate('hasWon')} ${winner.score} ${this.translate('points')}!`);
                this.saveSessionToHistory();
                if (confirm(this.translate('startNewSession'))) {
                    this.newSession();
                }
            }, 1000);
        }
    }

    // Configuración de dados
    showDiceConfigModal() {
        const modal = document.getElementById('dice-config-modal');
        if (!modal) return;
        
        const currentTypeRadio = document.querySelector(`input[name="dice-type"][value="${this.settings.diceType}"]`);
        if (currentTypeRadio) {
            currentTypeRadio.checked = true;
        } else {
            const d6Radio = document.querySelector('input[name="dice-type"][value="d6"]');
            if (d6Radio) d6Radio.checked = true;
        }
        
        const diceCountInput = document.getElementById('dice-count');
        const diceCountDisplay = document.getElementById('dice-count-display');
        
        if (diceCountInput) {
            diceCountInput.value = this.settings.diceCount;
            diceCountInput.setAttribute('max', '5');
        }
        if (diceCountDisplay) diceCountDisplay.textContent = this.settings.diceCount;
        
        // NUEVO: Configurar lanzamientos por jugador
        const rollsPerPlayerInput = document.getElementById('rolls-per-player');
        const rollsPerPlayerDisplay = document.getElementById('rolls-per-player-display');
        
        if (rollsPerPlayerInput && rollsPerPlayerDisplay) {
            rollsPerPlayerInput.value = this.settings.rollsPerPlayer;
            rollsPerPlayerDisplay.textContent = this.settings.rollsPerPlayer;
        }
        
        modal.classList.add('active');
    }

    hideDiceConfigModal() {
        const modal = document.getElementById('dice-config-modal');
        if (modal) modal.classList.remove('active');
    }

    saveDiceConfig() {
        const selectedDiceType = document.querySelector('input[name="dice-type"]:checked');
        const diceCountInput = document.getElementById('dice-count');
        const rollsPerPlayerInput = document.getElementById('rolls-per-player');
        
        if (selectedDiceType) {
            this.settings.diceType = selectedDiceType.value;
        }
        if (diceCountInput) {
            this.settings.diceCount = parseInt(diceCountInput.value);
        }
        if (rollsPerPlayerInput) {
            this.settings.rollsPerPlayer = parseInt(rollsPerPlayerInput.value);
        }
        
        this.hideDiceConfigModal();
        
        if (this.participants.length > 0 && this.participants.some(p => p.score > 0)) {
            if (confirm(this.translate('confirmResetAfterConfig'))) {
                this.newSession();
            }
        }
        
        this.updateUI();
        this.saveToStorage();
        this.showNotification(this.translate('diceConfigUpdated'));
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

    resetToDefault() {
        this.participants = [];
        this.selectedParticipants = [];
        this.history = [];
        this.sessionsHistory = [];
        this.currentRound = 1;
        this.totalSessions = 1;
        this.currentParticipantIndex = 0;
        this.currentRollsInRound = 0;
        this.roundInProgress = false;
        this.sessionStarted = false;
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    window.diceMasterPro = new DiceMasterPro();
});
