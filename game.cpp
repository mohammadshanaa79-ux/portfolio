/*
 * XO Game (Tic-Tac-Toe) - C++ Implementation
 * لعبة إكس أو - نسخة C++
 * 
 * هذا الملف يحتوي على منطق اللعبة الكامل بلغة C++
 * يمكن استخدامه كمرجع أو دمجه مع واجهات رسومية مختلفة
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <limits>
#include <ctime>
#include <cstdlib>

using namespace std;

// ===== Constants =====
const int BOARD_SIZE = 9;
const char EMPTY = ' ';
const char PLAYER_X = 'X';
const char PLAYER_O = 'O';

// ===== Winning Combinations =====
const int WINNING_COMBINATIONS[8][3] = {
    {0, 1, 2}, {3, 4, 5}, {6, 7, 8}, // Rows
    {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, // Columns
    {0, 4, 8}, {2, 4, 6}             // Diagonals
};

// ===== Game Class =====
class TicTacToe {
private:
    vector<char> board;
    char currentPlayer;
    char humanPlayer;
    char aiPlayer;
    int difficulty; // 1=Easy, 2=Medium, 3=Hard
    int scoreX, scoreO, scoreDraw;
    bool gameOver;
    
public:
    // Constructor
    TicTacToe() {
        board.resize(BOARD_SIZE, EMPTY);
        currentPlayer = PLAYER_X;
        humanPlayer = PLAYER_X;
        aiPlayer = PLAYER_O;
        difficulty = 2; // Medium by default
        scoreX = 0;
        scoreO = 0;
        scoreDraw = 0;
        gameOver = false;
        srand(time(0));
    }
    
    // Display Board
    void displayBoard() {
        cout << "\n";
        cout << "  " << board[0] << " | " << board[1] << " | " << board[2] << "\n";
        cout << " -----------\n";
        cout << "  " << board[3] << " | " << board[4] << " | " << board[5] << "\n";
        cout << " -----------\n";
        cout << "  " << board[6] << " | " << board[7] << " | " << board[8] << "\n";
        cout << "\n";
    }
    
    // Check if cell is empty
    bool isCellEmpty(int index) {
        return board[index] == EMPTY;
    }
    
    // Make move
    bool makeMove(int index, char player) {
        if (index < 0 || index >= BOARD_SIZE || !isCellEmpty(index)) {
            return false;
        }
        board[index] = player;
        return true;
    }
    
    // Check winner
    char checkWinner() {
        // Check all winning combinations
        for (int i = 0; i < 8; i++) {
            int a = WINNING_COMBINATIONS[i][0];
            int b = WINNING_COMBINATIONS[i][1];
            int c = WINNING_COMBINATIONS[i][2];
            
            if (board[a] != EMPTY && 
                board[a] == board[b] && 
                board[a] == board[c]) {
                return board[a];
            }
        }
        
        // Check for draw
        bool isFull = true;
        for (int i = 0; i < BOARD_SIZE; i++) {
            if (board[i] == EMPTY) {
                isFull = false;
                break;
            }
        }
        
        if (isFull) return 'D'; // Draw
        
        return EMPTY; // Game continues
    }
    
    // Get available moves
    vector<int> getAvailableMoves() {
        vector<int> moves;
        for (int i = 0; i < BOARD_SIZE; i++) {
            if (board[i] == EMPTY) {
                moves.push_back(i);
            }
        }
        return moves;
    }
    
    // Random move (Easy AI)
    int getRandomMove() {
        vector<int> moves = getAvailableMoves();
        if (moves.empty()) return -1;
        return moves[rand() % moves.size()];
    }
    
    // Minimax Algorithm with Alpha-Beta Pruning (Hard AI)
    int minimax(vector<char>& tempBoard, int depth, bool isMaximizing, int alpha, int beta) {
        char winner = checkWinnerForBoard(tempBoard);
        
        if (winner == aiPlayer) return 10 - depth;
        if (winner == humanPlayer) return depth - 10;
        if (winner == 'D') return 0;
        
        if (isMaximizing) {
            int bestScore = numeric_limits<int>::min();
            for (int i = 0; i < BOARD_SIZE; i++) {
                if (tempBoard[i] == EMPTY) {
                    tempBoard[i] = aiPlayer;
                    int score = minimax(tempBoard, depth + 1, false, alpha, beta);
                    tempBoard[i] = EMPTY;
                    bestScore = max(score, bestScore);
                    alpha = max(alpha, bestScore);
                    if (beta <= alpha) break; // Alpha-Beta Pruning
                }
            }
            return bestScore;
        } else {
            int bestScore = numeric_limits<int>::max();
            for (int i = 0; i < BOARD_SIZE; i++) {
                if (tempBoard[i] == EMPTY) {
                    tempBoard[i] = humanPlayer;
                    int score = minimax(tempBoard, depth + 1, true, alpha, beta);
                    tempBoard[i] = EMPTY;
                    bestScore = min(score, bestScore);
                    beta = min(beta, bestScore);
                    if (beta <= alpha) break; // Alpha-Beta Pruning
                }
            }
            return bestScore;
        }
    }
    
    // Check winner for temporary board
    char checkWinnerForBoard(vector<char>& tempBoard) {
        for (int i = 0; i < 8; i++) {
            int a = WINNING_COMBINATIONS[i][0];
            int b = WINNING_COMBINATIONS[i][1];
            int c = WINNING_COMBINATIONS[i][2];
            
            if (tempBoard[a] != EMPTY && 
                tempBoard[a] == tempBoard[b] && 
                tempBoard[a] == tempBoard[c]) {
                return tempBoard[a];
            }
        }
        
        bool isFull = true;
        for (int i = 0; i < BOARD_SIZE; i++) {
            if (tempBoard[i] == EMPTY) {
                isFull = false;
                break;
            }
        }
        
        if (isFull) return 'D';
        return EMPTY;
    }
    
    // Get best move using Minimax
    int getBestMove() {
        int bestScore = numeric_limits<int>::min();
        int bestMove = -1;
        
        for (int i = 0; i < BOARD_SIZE; i++) {
            if (board[i] == EMPTY) {
                vector<char> tempBoard = board;
                tempBoard[i] = aiPlayer;
                int score = minimax(tempBoard, 0, false, 
                                   numeric_limits<int>::min(), 
                                   numeric_limits<int>::max());
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    // AI Move
    int getAIMove() {
        switch(difficulty) {
            case 1: // Easy
                return getRandomMove();
            case 2: // Medium
                return (rand() % 2 == 0) ? getBestMove() : getRandomMove();
            case 3: // Hard
                return getBestMove();
            default:
                return getRandomMove();
        }
    }
    
    // Reset game
    void resetGame() {
        fill(board.begin(), board.end(), EMPTY);
        currentPlayer = PLAYER_X;
        gameOver = false;
    }
    
    // Reset scores
    void resetScores() {
        scoreX = 0;
        scoreO = 0;
        scoreDraw = 0;
    }
    
    // Display scores
    void displayScores() {
        cout << "\n===== النتائج =====\n";
        cout << "X: " << scoreX << " | ";
        cout << "تعادل: " << scoreDraw << " | ";
        cout << "O: " << scoreO << "\n";
        cout << "==================\n";
    }
    
    // Set difficulty
    void setDifficulty(int level) {
        if (level >= 1 && level <= 3) {
            difficulty = level;
        }
    }
    
    // Set player choice
    void setHumanPlayer(char player) {
        if (player == PLAYER_X || player == PLAYER_O) {
            humanPlayer = player;
            aiPlayer = (player == PLAYER_X) ? PLAYER_O : PLAYER_X;
        }
    }
    
    // Play game against AI
    void playAgainstAI() {
        resetGame();
        
        cout << "\n===== لعبة XO ضد الذكاء الاصطناعي =====\n";
        cout << "أنت: " << humanPlayer << " | الذكاء الاصطناعي: " << aiPlayer << "\n";
        
        while (!gameOver) {
            displayBoard();
            
            if (currentPlayer == humanPlayer) {
                // Human turn
                cout << "دورك! أدخل رقم الخانة (0-8): ";
                int move;
                cin >> move;
                
                if (cin.fail() || !makeMove(move, humanPlayer)) {
                    cin.clear();
                    cin.ignore(numeric_limits<streamsize>::max(), '\n');
                    cout << "حركة غير صحيحة! حاول مرة أخرى.\n";
                    continue;
                }
            } else {
                // AI turn
                cout << "الذكاء الاصطناعي يفكر...\n";
                int move = getAIMove();
                makeMove(move, aiPlayer);
                cout << "الذكاء الاصطناعي اختار الخانة: " << move << "\n";
            }
            
            // Check game status
            char winner = checkWinner();
            if (winner != EMPTY) {
                displayBoard();
                
                if (winner == 'D') {
                    cout << "\n🤝 تعادل!\n";
                    scoreDraw++;
                } else {
                    if (winner == humanPlayer) {
                        cout << "\n🎉 مبروك! لقد فزت!\n";
                    } else {
                        cout << "\n🤖 الذكاء الاصطناعي فاز!\n";
                    }
                    
                    if (winner == PLAYER_X) scoreX++;
                    else scoreO++;
                }
                
                gameOver = true;
                displayScores();
            } else {
                // Switch player
                currentPlayer = (currentPlayer == PLAYER_X) ? PLAYER_O : PLAYER_X;
            }
        }
    }
    
    // Play against friend
    void playAgainstFriend() {
        resetGame();
        
        cout << "\n===== لعبة XO ضد صديق =====\n";
        
        while (!gameOver) {
            displayBoard();
            
            cout << "دور اللاعب " << currentPlayer << "! أدخل رقم الخانة (0-8): ";
            int move;
            cin >> move;
            
            if (cin.fail() || !makeMove(move, currentPlayer)) {
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
                cout << "حركة غير صحيحة! حاول مرة أخرى.\n";
                continue;
            }
            
            // Check game status
            char winner = checkWinner();
            if (winner != EMPTY) {
                displayBoard();
                
                if (winner == 'D') {
                    cout << "\n🤝 تعادل!\n";
                    scoreDraw++;
                } else {
                    cout << "\n🏆 اللاعب " << winner << " فاز!\n";
                    if (winner == PLAYER_X) scoreX++;
                    else scoreO++;
                }
                
                gameOver = true;
                displayScores();
            } else {
                // Switch player
                currentPlayer = (currentPlayer == PLAYER_X) ? PLAYER_O : PLAYER_X;
            }
        }
    }
};

// ===== Main Menu =====
void displayMenu() {
    cout << "\n╔════════════════════════════════╗\n";
    cout << "║      لعبة XO - Tic Tac Toe    ║\n";
    cout << "╚════════════════════════════════╝\n";
    cout << "1. اللعب ضد الذكاء الاصطناعي\n";
    cout << "2. اللعب ضد صديق\n";
    cout << "3. تغيير مستوى الصعوبة\n";
    cout << "4. اختيار الرمز (X أو O)\n";
    cout << "5. إعادة النتائج\n";
    cout << "6. الخروج\n";
    cout << "\nاختر (1-6): ";
}

// ===== Main Function =====
int main() {
    TicTacToe game;
    int choice;
    
    cout << "مرحباً بك في لعبة XO!\n";
    
    while (true) {
        displayMenu();
        cin >> choice;
        
        if (cin.fail()) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "اختيار غير صحيح!\n";
            continue;
        }
        
        switch(choice) {
            case 1:
                game.playAgainstAI();
                break;
            case 2:
                game.playAgainstFriend();
                break;
            case 3: {
                cout << "\nاختر مستوى الصعوبة:\n";
                cout << "1. سهل 😊\n";
                cout << "2. متوسط 😐\n";
                cout << "3. صعب 😈\n";
                cout << "اختر (1-3): ";
                int level;
                cin >> level;
                game.setDifficulty(level);
                cout << "تم تغيير مستوى الصعوبة!\n";
                break;
            }
            case 4: {
                cout << "\nاختر رمزك:\n";
                cout << "1. X\n";
                cout << "2. O\n";
                cout << "اختر (1-2): ";
                int playerChoice;
                cin >> playerChoice;
                game.setHumanPlayer(playerChoice == 1 ? PLAYER_X : PLAYER_O);
                cout << "تم اختيار الرمز!\n";
                break;
            }
            case 5:
                game.resetScores();
                cout << "تم إعادة النتائج!\n";
                break;
            case 6:
                cout << "\nشكراً للعب! وداعاً 👋\n";
                return 0;
            default:
                cout << "اختيار غير صحيح!\n";
        }
    }
    
    return 0;
}
