import { Chess } from 'chess.js'
import ollama from 'ollama/browser'

const game = new Chess()
const board = Chessboard2('myBoard', 'start')

updateStatus()

console.log("Start: ", game.fen())

window.setTimeout(makeLLMMove, 500)

async function white(game) {

  const possibleMoves = String(game.moves())
  const message = `You are a chess player given the FEN of the current game state what\'s the best move: ${game.fen()}. Your possible moves include: ${possibleMoves} be concise, do not use any excess words, only include the move. Only say one move, don't give options, seriously and please don't provide any other text besides the move.`

  const response = await ollama.chat({
    model: 'llama3.2:latest',
    messages: [
      {
        role: 'user',
        content: message
      }
    ],
  })
  const move = response.message.content;

  console.log(game.turn(), "Move:", move)
  return move
}

async function black(game) {

  const possibleMoves = String(game.moves())
  const message = `You are a chess player given the FEN of the current game state what\'s the best move: ${game.fen()}. Your possible moves include: ${possibleMoves} be concise, do not use any excess words, only include the move. Only say one move, don't give options, seriously and please don't provide any other text besides the move.`

  const response = await ollama.chat({
    model: 'llama3.1:8b',
    messages: [
      {
        role: 'user',
        content: message
      }
    ],
  })
  const move = response.message.content;

  console.log(game.turn(), "Move:", move)
  return move
}

async function makeLLMMove() {
  if (game.isGameOver()) return
  let valid = false
  let move = ''

  while (!valid) {
    const turn = game.turn()

    if (turn === 'w') {
      move = await white(game)
    } else {
      move = await black(game)
    }

    try {
      game.move(move, { strict: true })
      valid = true
    } catch (e) {
      console.log(e)
      valid = false
    }

  }
  board.position(game.fen(), updateStatus)

  window.setTimeout(makeLLMMove, 500)
}

function updateStatus() {
  let statusHTML = ''

  if (game.isCheckmate() && game.turn() === 'w') {
    statusHTML = 'Game over: white is in checkmate. Black wins!'
  } else if (game.isCheckmate() && game.turn() === 'b') {
    statusHTML = 'Game over: black is in checkmate. White wins!'
  } else if (game.isStalemate() && game.turn() === 'w') {
    statusHTML = 'Game is drawn. White is stalemated.'
  } else if (game.isStalemate() && game.turn() === 'b') {
    statusHTML = 'Game is drawn. Black is stalemated.'
  } else if (game.isThreefoldRepetition()) {
    statusHTML = 'Game is drawn by threefold repetition rule.'
  } else if (game.isInsufficientMaterial()) {
    statusHTML = 'Game is drawn by insufficient material.'
  } else if (game.isDraw()) {
    statusHTML = 'Game is drawn by fifty-move rule.'
  }

  document.getElementById('gameStatus').innerHTML = statusHTML
}
