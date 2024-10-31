import { Chess } from 'chess.js'
import ollama from 'ollama/browser'

const game = new Chess()
const board = Chessboard('myBoard', 'start')

updateStatus()

console.log("Start: ", game.fen())

window.setTimeout(makeLLMMove, 500)

async function white(game) {

  const possibleMoves = String(game.moves())
  const message = `You are a the best chess player around and are playing the most important game of your life. This is FEN of the current game: ${game.fen()}. Your possible moves include: ${possibleMoves} What do you think about your position as white and how the different moves will affect your position.`

  const thought = await ollama.chat({
    model: 'llama3.2:latest',
    messages: [
      {
        role: 'user',
        content: message
      }
    ],
  })
  const thoughtStr = thought.message.content

  const newMessage = `You are a the best chess player around and are playing the most important game of your life. You always get checkmate so that's what you're going to do this time. Unlease your inner Beth Harmon. The chess board has the current FEN: ${game.fen()}. Youre possible moves include: ${possibleMoves}. Your thoughts about the position are: ${thoughtStr}. What will you do next? Be concise, do not use any excess words, only include the move. Only say one move, don't give options, seriously and please don't provide any other text besides the move. `

  const response = await ollama.chat({
    model: 'llama3.2:latest',
    messages: [
      {
        role: 'user',
        content: message
      }
    ],
    options: {
      num_predict: 5
    }
  })

  const move = response.message.content;

  console.log(game.turn(), "Thought:", thoughtStr, "Move:", move)

  return move
}

async function black(game) {

  const possibleMoves = String(game.moves())
  const message = `You are a chess player. You're the best there is and you always checkmate. The FEN of the current game is: ${game.fen()}. Your possible moves include: ${possibleMoves}. What's your next move? be concise, do not use any excess words, only include the move. Only say one move, don't give options, seriously and please don't provide any other text besides the move.`

  const response = await ollama.chat({
    model: 'llama3.2:latest',
    messages: [
      {
        role: 'user',
        content: message
      }
    ],
    options: {
      num_predict: 5
    }
  })
  const move = response.message.content;

  return move
}

async function makeLLMMove() {
  if (game.isGameOver()) return
  let valid = false
  let move = ''

  while (!valid) {
    const turn = game.turn()

    if (turn === 'w') {
      // TODO make a working thought step for white
      move = await black(game)
    } else {
      move = await black(game)
    }

    try {
      game.move(move, { strict: true })
      // console.log(game.turn(), "Move:", move)
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
