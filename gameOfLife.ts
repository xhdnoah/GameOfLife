import * as Example from './example'

const GRID_SIZE = 10
const GRID_HEIGHT = 50
const GRID_WIDTH = 50
const GRID_COLOR = "black"
const CELL_DEAD = "white"
const CELL_ALIVE = "HotPink"

class GameOfLife {
  private playTimer
  private generation = 0
  public isPlaying = false
  private board = new Array<Array<number>>()

  private canvas = <HTMLCanvasElement>document.getElementById('gameCanvas')
  private generationCounter = <HTMLElement>document.getElementById('generationCounter')

  constructor() {
    this.canvas.width = GRID_WIDTH * GRID_SIZE + 1
    this.canvas.height = GRID_HEIGHT * GRID_SIZE + 1
    this.board = Array.from(Array(GRID_HEIGHT), _ => Array(GRID_WIDTH).fill(0));
  }

  export() {
    const res = new Array<Array<number>>()

    for (let i = 0; i < GRID_WIDTH; i++) {
      for (let j = 0; j < GRID_HEIGHT; j++) {
        if (this.board[i][j] === 1) {
          res.push([i, j])
        }
      }
    }
    return JSON.stringify(res)
  }

  redraw() {
    let ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d')

    for (let i = 0; i < GRID_WIDTH; i++) {
      for (let j = 0; j < GRID_HEIGHT; j++) {
        ctx.fillStyle = GRID_COLOR
        ctx.fillRect(GRID_SIZE * i, GRID_SIZE * j, GRID_SIZE, 1)
        ctx.fillRect(GRID_SIZE * i, GRID_SIZE * j, 1, GRID_SIZE)

        ctx.fillStyle = this.board[i][j] === 0 ? CELL_DEAD : CELL_ALIVE
        ctx.fillRect(i * GRID_SIZE + 1, j * GRID_SIZE + 1, GRID_SIZE - 1, GRID_SIZE - 1)
      }
    }
    ctx.fillStyle = GRID_COLOR
    ctx.fillRect(GRID_SIZE * (GRID_WIDTH), 0, 1, GRID_SIZE * GRID_HEIGHT + 1)
    ctx.fillRect(0, GRID_SIZE * (GRID_HEIGHT), GRID_SIZE * GRID_WIDTH + 1, 1)
  }

  switchLifeStatus(i: number, j: number, isAlive: boolean) {
    this.board[i][j] = (this.board[i][j] === 0 || isAlive) ? 1 : 0
  }

  nextGeneration() {
    const newBoard = Array.from({length: GRID_HEIGHT}, (_, i) => {
      return Array.from({length: GRID_WIDTH}, (_, j) => {
        const neighbourCount = this.getLivingNeighbours(i, j)

        if (this.board[i][j] === 1 && (neighbourCount === 2 || neighbourCount === 3)) {
          return 1
        }

        if (this.board[i][j] === 0 && neighbourCount === 3) {
          return 1
        }

        return 0
      })
    })
    this.generation++
    this.generationCounter.innerHTML = this.generation.toString()
    this.board = newBoard
  }

  getLivingNeighbours(x: number, y: number) {
    let count = 0
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        if (i < 0 || j < 0) continue
        if (i >= GRID_WIDTH || j >= GRID_HEIGHT) continue
        if (i === x && j === y) continue
        if (this.board[i][j] === 1) count++
      }
    }
    return count
  }

  play(interval: number) {
    this.isPlaying = true
    this.playTimer = window.setInterval(() => this.nextGeneration(), interval)
  }

  pause() {
    this.isPlaying = false
    window.clearInterval(this.playTimer)
  }
}

(function () {
  const game = new GameOfLife()

  const rafLoop = () => {
    game.redraw()
    requestAnimationFrame(rafLoop)
  }
  rafLoop()

  const canvas = <HTMLCanvasElement>document.getElementById('gameCanvas')
  canvas.onclick = (ev: MouseEvent) => {
    const i = Math.floor((ev.clientX - canvas.offsetLeft) / GRID_SIZE)
    const j = Math.floor((ev.clientY - canvas.offsetTop) / GRID_SIZE)
    game.switchLifeStatus(i, j, false)
  }

  const stepButton = <HTMLButtonElement>document.getElementById('stepButton')
  stepButton.onclick = (ev: MouseEvent) => {
    game.nextGeneration()
  }

  const playButton = <HTMLButtonElement>document.getElementById('playButton')

  playButton.onclick = (ev: MouseEvent) => {
    if (game.isPlaying) {
      game.pause()
      playButton.innerHTML = "Play"
    } else {
      const life = (document.getElementById('life-selector') as HTMLSelectElement).value
      if (life) {
        Example[life].forEach(([i, j]) => {
          game.switchLifeStatus(i, j, true)
        })
      }
      game.play(100)
      playButton.innerHTML = "Pause"
    }
  }
}())
