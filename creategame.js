import GameBackend from './gamebackend.js';

export default function createGame(isPlayerWhite, player1Id, player2Id, player1Name, player2Name, roomCode ) {
    const game = new GameBackend(isPlayerWhite, player1Id, player2Id, player1Name, player2Name, roomCode);
    return game;
}