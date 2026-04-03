// ===== Game State =====
let gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameMode: 'ai',
    humanPlayer: 'X',
    aiPlayer: 'O',
    difficulty: 'medium',
    isGameOver: false,
    moveCount: 0,
    scores: { X: 0, O: 0, draws: 0 },
    soundEnabled: true
};

// ===== Winning Combinations =====
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// ===== Audio Context for Sound Effects =====
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
}

// ===== Sound Effects =====
function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'click':
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'win':
            // Victory fanfare
            [523, 659, 784, 1047].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
                osc.start(audioContext.currentTime + i * 0.15);
                osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
            });
            break;
        case 'draw':
            oscillator.frequency.value = 400;
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'reset':
            oscillator.frequency.value = 600;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
    }
}

// ===== Theme Toggle =====
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    playSound('click');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// Load saved theme
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme === 'dark' ? 'dark-mode' : 'light-mode';
    loadScores();
});

// ===== Sound Toggle =====
function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    document.body.classList.toggle('sound-muted');
    if (gameState.soundEnabled) {
        playSound('click');
    }
}

// ===== Mode Selection =====
function selectMode(mode) {
    gameState.gameMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    const playerSelection = document.getElementById('playerSelection');
    const difficultySelection = document.getElementById('difficultySelection');
    
    if (mode === 'ai') {
        playerSelection.style.display = 'block';
        difficultySelection.style.display = 'block';
        updateLabels();
    } else {
        playerSelection.style.display = 'none';
        difficultySelection.style.display = 'none';
        document.getElementById('labelX').textContent = 'لاعب X';
        document.getElementById('labelO').textContent = 'لاعب O';
    }
    
    playSound('click');
    restartGame();
}

// ===== Player Selection =====
function selectPlayer(player) {
    gameState.humanPlayer = player;
    gameState.aiPlayer = player === 'X' ? 'O' : 'X';
    
    document.querySelectorAll('.player-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-player="${player}"]`).classList.add('active');
    
    updateLabels();
    playSound('click');
    restartGame();
}

function updateLabels() {
    if (gameState.gameMode === 'ai') {
        document.getElementById('labelX').textContent = gameState.humanPlayer === 'X' ? 'أنت' : 'الذكاء الاصطناعي';
        document.getElementById('labelO').textContent = gameState.aiPlayer === 'O' ? 'الذكاء الاصطناعي' : 'أنت';
    }
}

// ===== Difficulty Selection =====
function selectDifficulty(level) {
    gameState.difficulty = level;
    
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-level="${level}"]`).classList.add('active');
    
    playSound('click');
    restartGame();
}

// ===== Cell Click Handler =====
function handleCellClick(index) {
    if (gameState.board[index] || gameState.isGameOver) return;
    
    // In AI mode, prevent clicking when it's AI's turn
    if (gameState.gameMode === 'ai' && gameState.currentPlayer !== gameState.humanPlayer) return;
    
    makeMove(index, gameState.currentPlayer);
}

// ===== Make Move =====
function makeMove(index, player) {
    console.log('Making move:', index, 'for player:', player);
    
    gameState.board[index] = player;
    gameState.moveCount++;
    
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());
    
    playSound('click');
    updateMoveCount();
    
    const result = checkGameOver();
    
    if (result) {
        handleGameOver(result);
    } else {
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
        
        console.log('Next player:', gameState.currentPlayer, 'Game mode:', gameState.gameMode, 'AI player:', gameState.aiPlayer);
        
        // AI's turn
        if (gameState.gameMode === 'ai' && gameState.currentPlayer === gameState.aiPlayer) {
            console.log('Scheduling AI move...');
            setTimeout(makeAIMove, 300);
        }
    }
}

// ===== AI Move =====
function makeAIMove() {
    if (gameState.isGameOver) return;
    
    console.log('AI is making a move...', 'Current player:', gameState.currentPlayer, 'AI player:', gameState.aiPlayer);
    
    let move;
    
    switch(gameState.difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = Math.random() > 0.5 ? getBestMove() : getRandomMove();
            break;
        case 'hard':
            move = getBestMove();
            break;
        default:
            move = getRandomMove();
    }
    
    console.log('AI chose move:', move);
    
    if (move !== -1) {
        makeMove(move, gameState.aiPlayer);
    }
}

// ===== Random Move (Easy AI) =====
function getRandomMove() {
    const availableMoves = gameState.board
        .map((cell, index) => cell === null ? index : -1)
        .filter(index => index !== -1);
    
    return availableMoves.length > 0 
        ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
        : -1;
}

// ===== Minimax Algorithm (Hard AI) =====
function minimax(board, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
    const result = checkWinnerForBoard(board);
    
    if (result === gameState.aiPlayer) return 10 - depth;
    if (result === gameState.humanPlayer) return depth - 10;
    if (result === 'draw') return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = gameState.aiPlayer;
                const score = minimax(board, depth + 1, false, alpha, beta);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) break; // Alpha-Beta Pruning
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = gameState.humanPlayer;
                const score = minimax(board, depth + 1, true, alpha, beta);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) break; // Alpha-Beta Pruning
            }
        }
        return bestScore;
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < 9; i++) {
        if (!gameState.board[i]) {
            gameState.board[i] = gameState.aiPlayer;
            const score = minimax([...gameState.board], 0, false);
            gameState.board[i] = null;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// ===== Check Winner =====
function checkWinnerForBoard(board) {
    for (const combo of WINNING_COMBINATIONS) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    
    if (board.every(cell => cell !== null)) {
        return 'draw';
    }
    
    return null;
}

function checkGameOver() {
    const winner = checkWinnerForBoard(gameState.board);
    
    if (winner && winner !== 'draw') {
        const winningCombo = WINNING_COMBINATIONS.find(combo => {
            const [a, b, c] = combo;
            return gameState.board[a] && 
                   gameState.board[a] === gameState.board[b] && 
                   gameState.board[a] === gameState.board[c];
        });
        
        return { type: 'win', player: winner, combo: winningCombo };
    }
    
    if (winner === 'draw') {
        return { type: 'draw' };
    }
    
    return null;
}

// ===== Handle Game Over =====
function handleGameOver(result) {
    gameState.isGameOver = true;
    
    if (result.type === 'win') {
        // Highlight winning cells
        result.combo.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winner');
        });
        
        gameState.scores[result.player]++;
        playSound('win');
        
        let message;
        if (gameState.gameMode === 'ai') {
            message = result.player === gameState.humanPlayer 
                ? '🎉 مبروك! لقد فزت!' 
                : '🤖 الذكاء الاصطناعي فاز!';
        } else {
            message = `اللاعب ${result.player} فاز!`;
        }
        
        showModal('🏆', 'فوز!', message);
    } else {
        gameState.scores.draws++;
        playSound('draw');
        showModal('🤝', 'تعادل!', 'اللعبة انتهت بالتعادل');
    }
    
    updateScoreboard();
    saveScores();
}

// ===== Modal =====
function showModal(icon, title, message) {
    document.getElementById('modalIcon').textContent = icon;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('gameOverModal').classList.add('show');
}

function closeModal() {
    document.getElementById('gameOverModal').classList.remove('show');
}

function playAgain() {
    closeModal();
    restartGame();
}

// ===== Update UI =====
function updateTurnIndicator() {
    const turnElement = document.getElementById('currentTurn');
    turnElement.textContent = gameState.currentPlayer;
    
    if (gameState.gameMode === 'ai' && gameState.currentPlayer === gameState.aiPlayer) {
        document.getElementById('turnIndicator').innerHTML = 
            '<span class="turn-text">🤖 الذكاء الاصطناعي يفكر...</span>';
    } else {
        document.getElementById('turnIndicator').innerHTML = 
            `<span class="turn-text">الدور:</span><span class="turn-player">${gameState.currentPlayer}</span>`;
    }
}

function updateMoveCount() {
    document.getElementById('moveCount').textContent = gameState.moveCount;
}

function updateScoreboard() {
    document.getElementById('scoreX').textContent = gameState.scores.X;
    document.getElementById('scoreO').textContent = gameState.scores.O;
    document.getElementById('scoreDraw').textContent = gameState.scores.draws;
}

// ===== Game Controls =====
function restartGame() {
    gameState.board = Array(9).fill(null);
    gameState.currentPlayer = 'X';
    gameState.isGameOver = false;
    gameState.moveCount = 0;
    
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
    
    updateTurnIndicator();
    updateMoveCount();
    closeModal();
    playSound('reset');
    
    // If AI starts first
    if (gameState.gameMode === 'ai' && gameState.aiPlayer === 'X') {
        setTimeout(makeAIMove, 300);
    }
}

function resetScores() {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع النتائج؟')) {
        gameState.scores = { X: 0, O: 0, draws: 0 };
        updateScoreboard();
        saveScores();
        restartGame();
        playSound('reset');
    }
}

// ===== Local Storage =====
function saveScores() {
    localStorage.setItem('xoScores', JSON.stringify(gameState.scores));
}

function loadScores() {
    const saved = localStorage.getItem('xoScores');
    if (saved) {
        gameState.scores = JSON.parse(saved);
        updateScoreboard();
    }
}

// ===== Initialize Game =====
updateTurnIndicator();
updateMoveCount();
updateScoreboard();
updateLabels();
