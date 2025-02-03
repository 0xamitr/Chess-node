import GameS from "./models/game_model.js";
import User from "./models/users.js";
import dbConnect from "./lib/dbConnect.js";

export default async function uploadGame(body) {
    await dbConnect();
    console.log("body", body);

    // Create the game record
    const game = await GameS.create({
      players: body.players,
      creation: body.creation,
      moves: body.moves,
      winner: body.winner,
      pgn: body.pgn,
      movelist: body.movelist,
      game_id: body.game_id,
    });

    // Find the winner and the opponent (loser)
    const winner = await User.findById(body.winner.id);
    const loserPlayer = body.players.find(player => player.id !== body.winner.id);
    const loser = loserPlayer ? await User.findById(loserPlayer.id) : null;

    console.log("Game ID:", game._id);
    console.log("Winner:", winner);

    // Update winner's game history if found
    if (winner) {
      await User.findByIdAndUpdate(body.winner.id, {
        games: [
          ...winner.games,
          {
            _id: game._id,
            winner: winner._id,
            creation: game.creation,
            moves: game.moves,
          },
        ],
      });
    }

    // Update loser's game history if found
    if (loser) {
      await User.findByIdAndUpdate(loser._id, {
        games: [
          ...loser.games,
          {
            _id: game._id,
            winner: winner ? winner._id : null,
            creation: game.creation,
            moves: game.moves,
          },
        ],
      });
    }

  }