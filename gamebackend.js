import uploadGame from "./uploadgame.js";
import { clientRoom, games, io, onlineUsers } from "./index.js";

export default class GameBackend {
    constructor(player1Id, player2Id, player1Name, player2Name, roomCode) {
        this.code = roomCode;
        this.player1Name = player1Name;
        this.player2Name = player2Name;
        this.player1Id = player1Id;
        this.player2Id = player2Id;
        this.board = this.initializeBoard();
        this.movelist = [];
        this.moves = []
        this.turn = true; //whites turn
        this.history = [JSON.parse(JSON.stringify(this.board))];
        this.check = false;

        this.whitetime = 600;
        this.lastwhitetime = Date.now();

        this.blacktime = 600;
        this.lastblacktime = null;

        this.timer = null;
        this.tempmove = 0;
        this.totalmoves = 0;
        this.startTimer();
        this.roomCode = roomCode;
        this.enPassant = 0

        this.whitekingMove = false
        this.blackkingMove = false

        this.whiteleftrookMove = false
        this.whiterightrookMove = false
        this.blackleftrookMove = false
        this.blackrightrookMove = false
    }

    startTimer() {
        this.timer = setInterval(() => {
            //console.log("timer", this.whitetime, this.blacktime)
            if (this.turn) {
                const currentTime = Date.now();
                const elapsed = (currentTime - this.lastwhitetime) / 1000; // Time in seconds

                this.whitetime -= elapsed;

                if (this.whitetime <= 0) {
                    //console.log("suck my nuts")
                    this.time = 0;
                    this.endGame("black");
                }
                this.lastwhitetime = currentTime;
            }
            else {
                const currentTime = Date.now();
                const elapsed = (currentTime - this.lastblacktime) / 1000;
                this.blacktime -= elapsed;

                if (this.blacktime <= 0) {
                    //console.log("suck my nuts")
                    this.time = 0;
                    this.endGame("white");
                }
                this.lastblacktime = currentTime;
            }
        }, 1000);
    }

    initializeBoard() {
        return [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.', '.', '.', '.'],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];
    }

    getCoords(move) {
        const from = move.from;
        const to = move.to;
        const fromRow = 8 - parseInt(from[1]);
        const fromCol = from.charCodeAt(0) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(to[1]);
        const toCol = to.charCodeAt(0) - 'a'.charCodeAt(0);
        return { from: [fromRow, fromCol], to: [toRow, toCol] }
    }

    getPieceAt(row, col) {
        return this.board[row][col];
    }

    isSquareUnderAttack(row, col, isWhite) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = this.board[i][j];
                if (isWhite && piece === piece.toUpperCase()) {
                    continue;
                }
                if (!isWhite && piece === piece.toLowerCase()) {
                    continue;
                }

                const from = String.fromCharCode('a'.charCodeAt(0) + j) + (8 - i);
                const to = String.fromCharCode('a'.charCodeAt(0) + col) + (8 - row);
                if (this.isMoveValidCp(from, to)) {
                    return true;
                }
            }
        }
        return false;
    }

    getTurn() {
        return this.turn
    }

    isMoveValid(from, to) {
        if (!from)
            return false
        const fromRow = 8 - parseInt(from[1]);
        const fromCol = from.charCodeAt(0) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(to[1]);
        const toCol = to.charCodeAt(0) - 'a'.charCodeAt(0);

        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];
        if (piece === '.') return false;

        if (targetPiece != '.' && this.isSamePlayer(piece, targetPiece)) {
            return false;
        }

        if (this.turn && this.board[fromRow][fromCol] != this.board[fromRow][fromCol].toUpperCase()) {
            return false

        }

        if (!this.turn && this.board[fromRow][fromCol] != this.board[fromRow][fromCol].toLowerCase()) {
            return false
        }

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = '.';

        const check = this.isCheck();

        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = targetPiece;

        if (check) {
            this.check = false
            return false
        }
        switch (piece.toLowerCase()) {
            case 'p':
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, this.turn, targetPiece);
            case 'r':
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case 'n':
                return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case 'b':
                return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case 'q':
                return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case 'k':
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    isMoveValidCp(from, to) {
        if (!from)
            return false
        const fromRow = 8 - parseInt(from[1]);
        const fromCol = from.charCodeAt(0) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(to[1]);
        const toCol = to.charCodeAt(0) - 'a'.charCodeAt(0);

        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];
        if (piece === '.')
            return false;
        if (targetPiece != '.' && this.isSamePlayer(piece, targetPiece))
            return false;
        let isWhite
        if (piece == 'p')
            isWhite = false
        else if (piece == 'P')
            isWhite = true

        switch (piece.toLowerCase()) {
            case 'p':
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite, targetPiece);
            case 'r':
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case 'n':
                return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case 'b':
                return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case 'q':
                return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case 'k':
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    getValidMoves(from) {
        const validMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const to = String.fromCharCode('a'.charCodeAt(0) + col) + (8 - row);
                if (this.isMoveValid(from, to)) {
                    validMoves.push(to);
                }
            }
        }
        return validMoves;
    }

    isSamePlayer(piece1, piece2) {
        if (piece1 == piece1.toUpperCase() && piece2 == piece2.toUpperCase())
            return true;
        if (piece1 == piece1.toLowerCase() && piece2 == piece2.toLowerCase())
            return true;
        return false
    }

    isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite, target) {
        const direction = isWhite ? -1 : 1;
        if (fromCol === toCol) {
            if (target === '.') {
                if (fromRow + direction === toRow) {
                    return true;
                } else if ((fromRow === 6 && toRow === 4 && isWhite && this.board[fromRow - 1][fromCol] == '.') || (fromRow === 1 && toRow === 3 && !isWhite && this.board[fromRow + 1][fromCol] == '.')) {
                    return true;
                }
            }
        } else {
            if (this.enPassant != 0) {
                if (Math.abs(fromCol - toCol) == 1 && fromRow + direction == toRow && toCol == this.enPassant) {
                    return true
                }
            }
            if (Math.abs(fromCol - toCol) === 1 && fromRow + direction === toRow) {
                return target !== '.' && (isWhite !== (target === target.toUpperCase()));
            }
        }
        return false;
    }

    isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) {
            return false;
        }

        const rowDirection = Math.sign(toRow - fromRow);
        const colDirection = Math.sign(toCol - fromCol);
        const steps = Math.abs(fromRow - toRow);

        for (let i = 1; i < steps; i++) {
            const currentRow = fromRow + i * rowDirection;
            const currentCol = fromCol + i * colDirection;
            if (this.board[currentRow][currentCol] !== '.') {
                return false;
            }
        }

        return true;
    }

    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol)
            return false;
        if (fromRow === toRow) {
            for (let i = Math.min(fromCol, toCol) + 1; i < Math.max(fromCol, toCol); i++) {
                if (this.board[fromRow][i] !== '.')
                    return false;
            }
        } else {
            for (let i = Math.min(fromRow, toRow) + 1; i < Math.max(fromRow, toRow); i++) {
                if (this.board[i][fromCol] !== '.')
                    return false;
            }
        }
        return true;
    }

    isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol) || this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }

    isValidKingMove(fromRow, fromCol, toRow, toCol) {
        if (this.turn && this.board[fromRow][fromCol] != 'K')
            return false
        if (!this.turn && this.board[fromRow][fromCol] != 'k')
            return false
        if (this.turn && this.whitekingMove == false) {
            if (fromRow == toRow && fromCol == toCol + 2) {
                console.log("why")
                if (this.board[fromRow][fromCol - 1] != '.' || this.board[fromRow][fromCol - 2] != '.')
                    return false
                if (this.check)
                    return false
                if (this.whiteleftrookMove == true)
                    return false
                if (this.isSquareUnderAttack(fromRow, fromCol - 1, this.turn))
                    return false
                if (this.isSquareUnderAttack(fromRow, fromCol - 2, this.turn))
                    return false
                console.log(1);
                return true
            }
            else if (fromRow == toRow && fromCol == toCol - 2) {
                console.log("whyf")
                if (this.board[fromRow][fromCol + 1] != '.' || this.board[fromRow][fromCol + 2] != '.') {
                    return false
                }
                if (this.check) {
                    return false
                }
                if (this.whiterightrookMove == true) {
                    return false
                }
                if (this.isSquareUnderAttack(fromRow, fromCol + 1, this.turn)) {
                    return false
                }
                if (this.isSquareUnderAttack(fromRow, fromCol + 2, this.turn)) {
                    return false
                }
                console.log(1)
                return true
            }
        }
        if (!this.turn && this.blackkingMove == false) {
            if (fromRow == toRow && fromCol == toCol + 2) {
                console.log("whyb")
                if (this.board[fromRow][fromCol - 1] != '.' || this.board[fromRow][fromCol - 2] != '.')
                    return false
                if (this.check)
                    return false
                if (this.blackrightrookMove == true)
                    return false
                if (this.isSquareUnderAttack(fromRow, fromCol - 1, this.turn))
                    return false
                if (this.isSquareUnderAttack(fromRow, fromCol - 2, this.turn))
                    return false
                console.log(1)
                return true
            }
            else if (fromRow == toRow && fromCol == toCol - 2) {
                console.log("whyba")
                if (this.board[fromRow][fromCol + 1] != '.' || this.board[fromRow][fromCol + 2] != '.')
                    return false
                if (this.check)
                    return false
                if (this.blackleftrookMove == true)
                    return false
                if (this.isSquareUnderAttack(fromRow, fromCol + 1, this.turn))
                    return false
                if (this.isSquareUnderAttack(fromRow, fromCol + 2, this.turn))
                    return false
                console.log(1)
                return true
            }
        }
        if (Math.abs(Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1)) {
            return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
        }
    }

    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        return (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) ||
            (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2);
    }

    // makeMove(from, to) {
    //     //console.log(from, to)
    //     if (!this.turn)
    //         return false
    //     const fromRow = 8 - parseInt(from[1]);
    //     const fromCol = from.charCodeAt(0) - 'a'.charCodeAt(0);
    //     const toCol = to.charCodeAt(0) - 'a'.charCodeAt(0);
    //     const toRow = 8 - parseInt(to[1]);
    //     if (this.isWhite) {
    //         if (this.getPieceAt(fromRow, fromCol) != this.getPieceAt(fromRow, fromCol).toUpperCase())
    //             return false
    //     }
    //     else {
    //         if (this.getPieceAt(fromRow, fromCol) == this.getPieceAt(fromRow, fromCol).toUpperCase())
    //             return false
    //     }
    //     if (!this.isMoveValid(from, to))
    //         return false

    //     let move = { from, to }
    //     const code = this.code

    //     if (this.board[fromRow][fromCol] == 'K' || this.board[fromRow][fromCol] == 'k') {
    //         if (fromRow != toRow) {
    //             if (this.live)
    //                 this.socket.emit('move', move, code, getGame())
    //             this.check = false
    //             return true
    //         }
    //         if (this.isWhite) {
    //             if (this.kingMove == false) {
    //                 if (toCol - fromCol == 2) {
    //                     let fromrook = String.fromCharCode(97 + 7) + (1);
    //                     let torook = String.fromCharCode(97 + 5) + (1);
    //                     move = [{ from, to }, { from: fromrook, to: torook }]
    //                 }
    //                 else if (fromCol - toCol == 2) {
    //                     let fromrook = String.fromCharCode(97 + 0) + (1);
    //                     let torook = String.fromCharCode(97 + 3) + (1);
    //                     move = [{ from, to }, { from: fromrook, to: torook }]
    //                     if (this.live)
    //                         this.socket.emit('move', move, code, getGame())
    //                 }
    //             }
    //             else
    //                 if (this.live)
    //                     this.socket.emit('move', move, code, getGame())
    //         }
    //         else {
    //             if (this.kingMove == false) {
    //                 if (toCol - fromCol == 2) {
    //                     let fromrook = String.fromCharCode(97 + 7) + (8);
    //                     let torook = String.fromCharCode(97 + 5) + (8);
    //                     move = [{ from, to }, { from: fromrook, to: torook }]
    //                     if (this.live)
    //                         this.socket.emit('move', move, code, getGame())
    //                 }
    //                 else if (fromCol - toCol == 2) {
    //                     let fromrook = String.fromCharCode(97 + 0) + (8);
    //                     let torook = String.fromCharCode(97 + 3) + (8);
    //                     move = [{ from, to }, { from: fromrook, to: torook }]
    //                     if (this.live)
    //                         this.socket.emit('move', move, code, getGame())
    //                 }
    //             }
    //             else
    //                 if (this.live)
    //                     this.socket.emit('move', move, code, getGame())
    //         }
    //         this.kingMove = true
    //     }
    //     else {
    //         if (this.enPassant != 0) {
    //             if (parseInt(from[1]) == 4 && this.board[fromRow][fromCol] == 'p' && this.enPassant == toCol)
    //                 move = [{ from, to }, 'enPassant']
    //             else if (parseInt(from[1]) == 5 && this.board[fromRow][fromCol] == 'P' && this.enPassant == toCol)
    //                 move = [{ from, to }, 'enPassant']
    //         }
    //         if (parseInt(to[1]) == 8 && this.board[fromRow][fromCol] == 'P') {
    //             this.getPromotion(from, to);
    //         }
    //         else if (parseInt(to[1]) == 1 && this.board[fromRow][fromCol] == 'p') {
    //             this.getPromotion(from, to);
    //         }
    //         else {
    //             if (this.live)
    //                 this.socket.emit('move', move, code, getGame())
    //         }
    //     }
    //     this.check = false
    //     return true
    // }

    applyMove(move) {
        const from = move.from;
        const to = move.to;
        const fromRow = 8 - parseInt(from[1]);
        const fromCol = from.charCodeAt(0) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(to[1]);
        const toCol = to.charCodeAt(0) - 'a'.charCodeAt(0);

        if (isNaN(fromRow) || isNaN(fromCol) || isNaN(toRow) || isNaN(toCol) ||
            fromRow < 0 || fromRow > 7 || fromCol < 0 || fromCol > 7 ||
            toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) {
            console.error('Invalid move coordinates');
            return;
        }

        const piece = this.board[fromRow][fromCol];
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = '.';
    }

    isCheck() {
        let kingRow, kingCol
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.turn) {
                    if (this.board[i][j] == 'K') {
                        kingRow = i
                        kingCol = j
                    }
                }
                else {
                    if (this.board[i][j] == 'k') {
                        kingRow = i
                        kingCol = j
                    }
                }
            }
        }
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.isMoveValidCp(String.fromCharCode(97 + j) + (8 - i), String.fromCharCode(97 + kingCol) + (8 - kingRow))) {
                    this.check = true
                    return true
                }
            }
        }
        return false
    }

    acceptMove(move) {
        if (Array.isArray(move)) {
            if (!this.isMoveValid(move[0].from, move[0].to))
                return false
            if (move[1] != 'enPassant') {
                if (!this.isMoveValid(move[1].from, move[1].to))
                    return false
            }
        }
        else if (!this.isMoveValid(move.from, move.to))
            return false
        // //console.log("how", this.getmoves())
        let movestr = ""
        let num = 1;
        // //console.log(this.getmoves())
        for (let i = 0; i < this.getmoves().length; i++) {
            movestr += `${num}. ${this.getmoves()[i++]} ${this.getmoves()[i]} `
            num++;
        }
        // //console.log(movestr)
        if (Array.isArray(move)) {
            //promotion
            if (move[1].hasOwnProperty('promotion')) {
                this.pushMove({ from: move[0].from, to: move[0].to }, move[1].promotion, this.isCheck())
                this.applyMove(move[0])
                const toRow = 8 - parseInt(move[0].to[1]);
                const toCol = move[0].to.charCodeAt(0) - 'a'.charCodeAt(0);
                this.board[toRow][toCol] = move[1].promotion
            }
            //enpassant
            else if (move[1] == 'enPassant') {
                this.pushMove({ from: move[0].from, to: move[0].to }, move[1], this.isCheck())
                this.applyMove(move[0])
                const toRow = 8 - parseInt(move[0].to[1]);
                const toCol = move[0].to.charCodeAt(0) - 'a'.charCodeAt(0);
                if (this.turn)
                    this.board[toRow + 1][toCol] = '.'
                else
                    this.board[toRow - 1][toCol] = '.'
                this.enPassant = 0
            }
            //castling
            else {
                let fromRow = 8 - parseInt(move[1].from[1])
                let fromCol = move[1].from[0].charCodeAt(0) - 'a'.charCodeAt(0)
                console.log(fromRow, fromCol)
                if (this.turn) {
                    this.whitekingMove = true
                    if (fromRow == 7 && fromCol == 7)
                        this.whiterightrookMove = true
                    else if (fromRow == 7 && fromCol == 0) {
                        this.whiteleftrookMove = true
                    }
                }
                else {
                    this.blackkingMove = true
                    if (fromRow == 0 && fromCol == 7)
                        this.blackleftrookMove = true
                    else if (fromRow == 0 && fromCol == 0)
                        this.blackrightrookMove = true
                }
                for (let i = 0; i < move.length; i++) {
                    this.applyMove(move[i])
                    if (this.isCheck()) // confused about this
                        this.checkCheckmate()
                }
                this.pushMove(move, undefined, this.isCheck())
            }
            this.turn = !this.turn
            if (this.turn)
                this.lastwhitetime = Date.now()
            else
                this.lastblacktime = Date.now()

            this.totalmoves++
            this.tempmove = this.totalmoves
            this.history.push(JSON.parse(JSON.stringify(this.board)))
            this.enPassant = 0;
        }
        //rest of the moves
        else {
            let fromRow = 8 - parseInt(move.from[1])
            let fromCol = move.from[0].charCodeAt(0) - 'a'.charCodeAt(0)

            if (this.board[fromRow][fromCol] == 'k' || this.board[fromRow][fromCol] == 'K') {
                if (this.turn)
                    this.whitekingMove = true
                else
                    this.blackkingMove = true
            }
            if (this.board[fromRow][fromCol] == 'r' || this.board[fromRow][fromCol] == 'R') {
                console.log("roook moved")
                console.log(fromRow, fromCol)
                if (this.turn) {
                    console.log("white rook moved")
                    if (fromRow == 7 && fromCol == 0)
                        this.whiteleftrookMove = true
                    if (fromRow == 7 && fromCol == 7)
                        this.whiterightrookMove = true
                }
                else {
                    console.log("black rook moved")
                    if (fromRow == 0 && fromCol == 0)
                        this.blackrightrookMove = true
                    if (fromRow == 0 && fromCol == 7)
                        this.blackleftrookMove = true
                }
            }
            if (move.from[1] == '2' && move.to[1] == '4')
                this.enPassant = move.from.charCodeAt(0) - 'a'.charCodeAt(0)
            else if (move.from[1] == '7' && move.to[1] == '5')
                this.enPassant = move.from.charCodeAt(0) - 'a'.charCodeAt(0)
            else
                this.enPassant = 0;

            this.pushMove(move, undefined, this.isCheck())
            this.applyMove(move)
            this.history.push(JSON.parse(JSON.stringify(this.board)))
            this.turn = !this.turn
            if (this.turn)
                this.lastwhitetime = Date.now()
            else
                this.lastblacktime = Date.now()
            this.totalmoves++
            this.tempmove = this.totalmoves
        }
        if (this.isCheck())
            this.checkCheckmate()
        else
            this.checkStalemate()
        return true
    }

    getDisambiguation(coords) {
        const piecetoMove = this.board[coords.from[0]][coords.from[1]]
        const to = String.fromCharCode(97 + coords.to[1]) + (8 - coords.to[0]);
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] == piecetoMove) {
                    if (i == coords.from[0] && j == coords.from[1])
                        continue
                    if (this.isMoveValidCp(String.fromCharCode(97 + j) + (8 - i), to)) {
                        let k = 0
                        for (let file = 0; file < 8; file++) {
                            if (this.board[coords.from[0]][file] == piecetoMove)
                                k++
                        }
                        if (k > 1)
                            return String.fromCharCode(97 + coords.from[1])

                        k = 0
                        for (let rank = 0; rank < 8; rank++) {
                            if (this.board[rank][coords.from[1]] == piecetoMove)
                                k++
                        }
                        if (k > 1)
                            return 8 - coords.from[0]
                        //for a knight(not sure)
                        let out = String.fromCharCode(97 + coords.from[1])
                        out += 8 - coords.from[0]
                        return out
                    }
                }
            }
        }
        return ""
    }

    pushMove(move, promotion, isCheck) {
        if (promotion)
            this.movelist.push([move, promotion])
        else
            this.movelist.push(move)
        if (move.length > 1) {
            if (Math.abs(move[1].from[0].charCodeAt(0) - move[1].to[0].charCodeAt(0)) == 2)
                this.moves.push('0-0')
            else if (Math.abs(move[1].from[0].charCodeAt(0) - move[1].to[0].charCodeAt(0)) == 3)
                this.moves.push('0-0-0')
            return;
        }
        const coords = this.getCoords(move)
        const pieceMoved = this.board[coords.from[0]][coords.from[1]].toUpperCase()
        const destinationPiece = this.board[coords.to[0]][coords.to[1]]
        let moveMade = ""
        if (pieceMoved != 'P') {
            moveMade += pieceMoved
        }
        else {
            if (promotion) {
                if (promotion == 'enPassant') {
                    moveMade += move.from[0]
                    moveMade += 'x'
                }
            }
        }
        const desambiguation = this.getDisambiguation(coords)
        if (desambiguation) {
            moveMade += desambiguation
        }
        if (destinationPiece != '.') {
            moveMade += 'x'
        }
        moveMade += move.to

        if (pieceMoved == 'P') {
            if (promotion) {
                if (promotion == 'enPassant') {
                    moveMade += ' e.p.'
                }
                else {
                    moveMade += '='
                    moveMade += promotion
                }
            }
        }
        if (isCheck)
            moveMade += '+'
        this.moves.push(moveMade)
    }

    checkStalemate() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const from = String.fromCharCode(97 + j) + (8 - i)
                const moves = this.getValidMoves(from)
                if (moves.length > 0)
                    return false
            }
        }
        // alert("Stalemate! It's a draw")
        this.endGame("draw")
        return true
    }



    checkCheckmate() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                // Check for white pieces
                if (this.turn) {
                    if (this.board[i][j] === '.' || this.board[i][j] !== this.board[i][j].toUpperCase()) {
                        continue; // Skip to the next iteration if it's not a white piece
                    }
                    let from = String.fromCharCode(97 + j) + (8 - i);
                    const validMoves = this.getValidMoves(from);
                    if (validMoves.length > 0) {
                        return false; // If a valid move exists, it's not checkmate
                    }
                }
                // Check for black pieces
                else {
                    if (this.board[i][j] === '.' || this.board[i][j] !== this.board[i][j].toLowerCase()) {
                        continue; // Skip to the next iteration if it's not a black piece
                    }
                    let from = String.fromCharCode(97 + j) + (8 - i);
                    const validMoves = this.getValidMoves(from);
                    if (validMoves.length > 0) {
                        return false; // If a valid move exists, it's not checkmate
                    }
                }
            }
        }
        // alert("Checkmate! YOU LOSE");
        if(this.turn)
            this.endGame("white")
        else
            this.endGame("black")
        return true; // Return true if no valid moves found, meaning it's checkmate
    }

    getmoves() {
        return this.moves;
    }

    getGameState() {
        return {
            board: this.board,
            movelist: this.movelist,
            turn: this.turn,
            name: this.name,
            opponentName: this.opponentName,
            opponentId: this.opponentId,
            // Add other necessary details
        };
    }

    endGame(result) {
        //console.log("hello shut the fuck up")
        let pgns = ""
        for (let i = 0; i < this.moves.length; i++) {
            pgns += `${i + 1}. ${this.moves[i]} `
        }
        let winner
        if(result == 'draw'){
            winner = null
        }
        else if(result == 'black'){
            winner = {
                id: this.player1Id,
                name: this.player1Name,
                color: "white"
            }
        }
        else if(result == 'white'){
            winner = {
                id: this.player2Id,
                name: this.player2Name,
                color: "black"
            }
        }
        uploadGame({
            pgn: pgns,
            creation: new Date(),
            moves: this.moves.length,
            winner: winner,
            game_id: this.code,
            movelist: this.movelist,
            players: [{
                id: this.player1Id,
                name: this.player1Name,
                color: "white"
            },
            {
                id: this.player2Id,
                name: this.player2Name,
                color: "black"
            }]

        })
        this.cleanup()
        // //console.log(this.moves)
        //end game
    }
    cleanup() {
        // delete the mapping of playerId to the room they are in
        delete clientRoom[this.player1Id]
        delete clientRoom[this.player2Id]

        // delete the store game
        delete games[this.roomCode]

        // emit game over
        io.to(this.roomCode).emit("gameover")

        // both players leave the room
        io.sockets.sockets.get(onlineUsers[this.player1Id]).leave(this.roomCode)
        io.sockets.sockets.get(onlineUsers[this.player2Id]).leave(this.roomCode)

        if (this.timer) {
            clearInterval(this.timer);
            //console.log("Game interval cleared.");
        }
    }
}
