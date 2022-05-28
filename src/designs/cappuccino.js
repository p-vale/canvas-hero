import { value } from 'canvas-sketch-util/random'
import setCanvas from '../setCanvas'
const c_random = require('canvas-sketch-util/random')

let [canvas, ctx, canvasW, canvasH, hero] = setCanvas()

function resize () {
  canvasW = window.innerWidth - 20
  canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH
}

const sides = 4 / 6 * canvasH
const center = canvasH
let point = canvasW / 2
let move = 0.5

function cappuccino () {
  resize()
  ctx.clearRect(0, 0, canvasW, canvasH)

  ctx.fillStyle = 'rgb(227, 215, 188)'
  ctx.moveTo(0, 0)
  ctx.lineTo(0, sides)
  ctx.bezierCurveTo(
    0, center, 
    point, center, 
    canvasW, sides
    )
  ctx.lineTo(canvasW, 0)
  ctx.lineTo(0, 0)
  ctx.closePath()
  ctx.fill()

  if (point <= 0 || point >= canvasW) move *= -1
  point += move
  if (point <= - 10 || point >= canvasW + 10) point = 0

  window.requestAnimationFrame(cappuccino)
  hero.appendChild(canvas)
  return hero
}

export default cappuccino