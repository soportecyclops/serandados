// DiceMaster Pro - Aplicación Web de Dados
// Archivo principal de JavaScript - Versión Completa Corregida

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
            rotateTurns: false,
            gameMode: 'classic' // Nuevo: modos de juego
        };
        
        this.gameModes = {
            'classic': {
                name: 'Clásico',
                description: 'Juego básico de acumulación de puntos',
                minPlayers: 2,
                maxPlayers: 10,
                defaultTarget: 100,
                specialRules: []
            },
            'poker': {
                name: 'Poker de Dados',
                description: 'Busca las mejores combinaciones de poker',
                minPlayers: 2,
                maxPlayers: 8,
                defaultTarget: 1000,
                specialRules: ['Combinaciones especiales', '3 rondas por jugador']
            },
            'generala': {
                name: 'Generala',
                description: 'Juego tradicional argentino',
                minPlayers: 2,
                maxPlayers: 6,
                defaultTarget: 10000,
                specialRules: ['Generala servida', 'Generala doble', 'Escalera']
            },
            'blackjack': {
                name: 'Blackjack 21',
                description: 'Acércate a 21 sin pasarte',
                minPlayers: 2,
                maxPlayers: 7,
                defaultTarget: 500,
                specialRules: ['Blackjack natural', 'Dividir pares', 'Doblar apuesta']
            },
            'truco': {
                name: 'Truco Argentino',
                description: 'Juego de cartas adaptado a dados',
                minPlayers: 2,
                maxPlayers: 4,
                defaultTarget: 30,
                specialRules: ['Envido', 'Truco', 'Flor']
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

    // Configuración de event listeners CORREGIDA
    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Botones principales - con verificación de existencia
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
        this.setupButton('remove-participant-btn', () => this.removeLastParticipant());

        // Tema e idioma - CORREGIDO
        this.setupButton('theme-language-btn', () => this.showThemeLanguageModal());
        this.setupButton('close-theme-language', () => this.hideThemeLanguageModal());
        this.setupButton('save-theme-language', () => this.saveThemeLanguage());
        this.setupButton('cancel-theme-language', () => this.hideThemeLanguageModal());

        // Modales de participante
        this.setupButton('close-participant-modal', () => this.hideParticipantModal());
        this.setupButton('save-participant', () => this.saveParticipant());
        this.setupButton('cancel-participant', () => this.hideParticipantModal());

        // Historial
        this.setupButton('clear-history-btn', () => this.clearHistory());

        // Pantalla completa
        this.setupButton('fullscreen-btn', () => this.toggleFullscreen());

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
            diceCount.addEventListener('input', (e) => {
                const count = parseInt(e.target.value);
                const display = document.getElementById('dice-count-display');
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

    // Sistema de dados
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
            
            // Aplicar reglas del modo de juego
            total = this.applyGameModeRules(results, total, participant);
            
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

    // Nuevo: Aplicar reglas de modos de juego
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
        // Implementación básica de poker de dados
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
        if (threeOfKind && pairs >= 2) return 40; // Full house
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

        // Generala servida (todos iguales)
        if (Object.values(counts).some(count => count === 5)) {
            return 1000;
        }

        // Escalera
        const sorted = [...results].sort((a, b) => a - b);
        const isStraight = sorted.every((num, index) => 
            index === 0 || num === sorted[index - 1] + 1
        );
        if (isStraight) return 500;

        return results.reduce((a, b) => a + b, 0);
    }

    calculateBlackjackScore(results, participant) {
        let total = results.reduce((a, b) => a + b, 0);
        
        // Blackjack natural (21 en primera tirada)
        if (participant.rounds === 0 && total === 21) {
            this.showNotification('¡Blackjack Natural! +50 puntos');
            return total + 50;
        }

        // Bust (se pasó de 21)
        if (total > 21) {
            this.showNotification('¡Te pasaste de 21! -20 puntos');
            return -20;
        }

        return total;
    }

    calculateTrucoScore(results) {
        // Simulación de valores de cartas del truco
        const trucoValues = {
            1: 11,  // Ancho
            2: 10,  // Dos
            3: 9,   // Tres
            4: 8,   // Cuatro
            5: 7,   // Cinco
            6: 6    // Seis
        };

        const total = results.reduce((sum, num) => sum + (trucoValues[num] || num), 0);
        
        // Bonificación por envido (pares del mismo número)
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

    // Sistema de temas CORREGIDO
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
                // Aplicar tema inmediatamente
                this.settings.theme = theme.id;
                document.documentElement.setAttribute('data-theme', theme.id);
                this.saveToStorage();
            });

            themeGrid.appendChild(themeOption);
        });
    }

    // Nuevo: Configuración de modos de juego
    setupGameModes() {
        const gameModeSelect = document.getElementById('game-mode');
        if (!gameModeSelect) return;

        gameModeSelect.innerHTML = '';

        Object.entries(this.gameModes).forEach(([id, mode]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = mode.name;
            if (id === this.settings.gameMode) {
                option.selected = true;
            }
            gameModeSelect.appendChild(option);
        });

        // Actualizar descripción cuando cambie el modo
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
            descriptionElement.textContent = mode.description;
            
            // Actualizar puntaje objetivo por defecto según el modo
            if (this.settings.targetScore === 100) {
                this.settings.targetScore = mode.defaultTarget;
                const targetScoreInput = document.getElementById('target-score');
                if (targetScoreInput) targetScoreInput.value = mode.defaultTarget;
            }

            // Mostrar reglas especiales
            rulesElement.innerHTML = mode.specialRules.length > 0 
                ? `<strong>Reglas especiales:</strong><br>${mode.specialRules.join(', ')}`
                : 'Sin reglas especiales';
        }
    }

    // Modales CORREGIDOS
    showParticipantModal(participant = null) {
        this.editingParticipant = participant;
        const modal = document.getElementById('participant-modal');
        const title = document.getElementById('participant-modal-title');
        
        if (!modal || !title) return;
        
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
        this.showNotification('Participante guardado correctamente');
    }

    // Modal de tema e idioma CORREGIDO
    showThemeLanguageModal() {
        const modal = document.getElementById('theme-language-modal');
        if (!modal) {
            console.error('Modal de tema e idioma no encontrado');
            return;
        }
        
        // Cargar configuración actual
        this.setFormValue('language-select', this.settings.language);
        this.setFormValue('sound-toggle', this.settings.soundEnabled);
        this.setFormValue('target-score', this.settings.targetScore);
        this.setFormValue('rotate-turns', this.settings.rotateTurns);
        this.setFormValue('game-mode', this.settings.gameMode);

        // Configurar tema actual
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.themeId === this.settings.theme) {
                option.classList.add('active');
            }
        });

        // Actualizar descripción del modo de juego
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
        
        this.settings.language = this.getFormValue('language-select');
        this.settings.soundEnabled = this.getFormValue('sound-toggle');
        this.settings.targetScore = parseInt(this.getFormValue('target-score')) || 100;
        this.settings.rotateTurns = this.getFormValue('rotate-turns');
        this.settings.gameMode = this.getFormValue('game-mode');

        // Validar puntaje objetivo (máximo 1000)
        if (this.settings.targetScore > 1000) {
            this.settings.targetScore = 1000;
            this.setFormValue('target-score', 1000);
            this.showNotification('Puntaje objetivo ajustado al máximo de 1000');
        }

        // Aplicar tema
        const activeTheme = document.querySelector('.theme-option.active');
        if (activeTheme) {
            this.settings.theme = activeTheme.dataset.themeId;
            document.documentElement.setAttribute('data-theme', this.settings.theme);
        }
        
        this.hideThemeLanguageModal();
        this.saveToStorage();
        this.updateUI();
        this.showNotification('Configuración guardada correctamente');
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

    // Resto de métodos (renderParticipants, updateLeaderboard, etc.) se mantienen igual
    // pero con verificaciones de existencia de elementos

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

        // Reconectar event listeners
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

    // ... (resto de métodos como addToHistory, renderHistory, etc.)

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
        if (diceCountInput) diceCountInput.value = this.settings.diceCount;
        
        const counterType = document.getElementById('counter-type');
        if (counterType) counterType.value = this.settings.counterType;
        
        const rollBtn = document.getElementById('roll-btn');
        if (rollBtn) {
            rollBtn.disabled = this.participants.length === 0 || this.isRolling;
        }
    }

    setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }

    // ... (otros métodos como removeParticipant, removeLastParticipant, etc.)

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

    endRound() {
        this.currentRound++;
        this.roundInProgress = false;
        
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

    newSession() {
        if (this.participants.length === 0) {
            this.showNotification('Agrega participantes antes de iniciar una nueva sesión.');
            return;
        }

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
                this.saveSessionToHistory();
                if (confirm('¿Quieres iniciar una nueva sesión?')) {
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
        
        if (this.participants.length > 0 && this.participants.some(p => p.score > 0)) {
            if (confirm('La configuración de dados ha cambiado. ¿Reiniciar la partida actual?')) {
                this.newSession();
            }
        }
        
        this.updateUI();
        this.saveToStorage();
        this.showNotification('Configuración de dados actualizada');
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
        this.history = [];
        this.sessionsHistory = [];
        this.currentRound = 1;
        this.totalSessions = 1;
        this.currentParticipantIndex = 0;
        this.roundInProgress = false;
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    window.diceMasterPro = new DiceMasterPro();
});
