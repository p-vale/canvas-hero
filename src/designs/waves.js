import setCanvas from '../setCanvas'
const c_random = require('canvas-sketch-util/random')

let [canvas, ctx, canvasW, canvasH, hero] = setCanvas()

function resize () {
  canvasW = window.innerWidth - 20
  canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH
}

function getLonger() {
  let a;
  (canvasW > canvasH) ? a = canvasW : a = canvasH
  return a
}

function getGrd(rad) {
  let circleGdr = ctx.createRadialGradient(0, 0, 0, 0, 0, rad)
  circleGdr.addColorStop(0, 'rgb(210, 163, 93)')
  circleGdr.addColorStop(0.30, 'rgb(217, 177, 118')
  circleGdr.addColorStop(0.56, 'rgb(236, 213, 179')
  circleGdr.addColorStop(0.90, 'rgb(201, 232, 249)')
  // circleGdr.addColorStop(1, 'rgb(220, 220, 220)')
  return circleGdr
}

// SHAPE
let topPath = [
  {
    'x' : 0,
    'y' : 0.5 / 4 * canvasH
  },
  {
    'x' : 0.5 / 2 * canvasW,
    'y' : 0.5 / 8 * canvasH
  },
  {
    'x' : 1 / 2 * canvasW,
    'y' : 0.5 / 4 * canvasH
  },
  {
    'x' : 1.5 / 2 * canvasW,
    'y' : 1.5 / 8 * canvasH
  },
  {
    'x' : canvasW,
    'y' : 0.5 / 4 * canvasH
  }
]

let bottomPath = [
  { 
    'x' : 0,
    'y' : 3.5 / 4 * canvasH
  },
  { 
    'x' : 0.5 / 2 * canvasW,
    'y' : 7.5/8 * canvasH
  },
  { 
    'x' : 1 / 2 * canvasW,
    'y' : 3.5/4 * canvasH
  },
  { 
    'x' : 1.5 / 2 * canvasW,
    'y' : 6.5/8 * canvasH
  },
  { 
    'x' : canvasW,
    'y' : 3.5 / 4 * canvasH
  }
]

// CIRCLES
class Origin {
  constructor(a, b) {
    this.x = c_random.range(0, canvasW)
    this.y = c_random.range(a, b)
    this.velX = c_random.range(0.5, 3)
    this.velY = c_random.range(0.5, 3)
  }
}

let topOrigin = new Origin(0, canvasH / 2)
let bottomOrigin = new Origin(canvasH / 2, canvasH)

// TITLE
const titleRad = 200
let grdWhite = ctx.createRadialGradient(
  canvasW / 2, 
  canvasH / 2 + titleRad, 
  1, 
  canvasW / 2, 
  canvasH / 2 + titleRad,
  titleRad * 2.5
  )
grdWhite.addColorStop(0, 'rgb(255, 255, 255, 0)')
grdWhite.addColorStop(1, 'rgb(255, 255, 255, 1)')

function waves () {
  resize()
  ctx.clearRect(0, 0, canvasW, canvasH)
  let circleRad = getLonger()

  // BACKGROUND
  ctx.save()
  ctx.translate(canvasW / 2, canvasH / 2)
  ctx.fillStyle = getGrd(circleRad / 1.75)
  ctx.arc(0, 0, circleRad, 0, 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = getGrd(circleRad)
  // TOP
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(topPath[0].x, topPath[0].y)
  ctx.bezierCurveTo(topPath[1].x, topPath[1].y, topPath[1].x, topPath[1].y, topPath[2].x, topPath[2].y)
  ctx.bezierCurveTo(topPath[3].x, topPath[3].y, topPath[3].x, topPath[3].y, topPath[4].x, topPath[4].y)
  ctx.lineTo(canvasW, 0)
  ctx.lineTo(0, 0)
  ctx.lineTo(topPath[0].x, topPath[0].y)
  ctx.closePath()
  ctx.clip()
  ctx.translate(topOrigin.x, topOrigin.y)
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.fill()
  ctx.restore()
  // move
  if (topOrigin.x <= 0 || topOrigin.x >= canvasW) topOrigin.velX *= -1 //bounce
  if (topOrigin.y <= 0 || topOrigin.y >= canvasH / 4) topOrigin.velY *= -1
  topOrigin.x += topOrigin.velX
  topOrigin.y += topOrigin.velY;  

  // BOTTOM
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(bottomPath[0].x, bottomPath[0].y)
  ctx.bezierCurveTo(bottomPath[1].x, bottomPath[1].y, bottomPath[1].x, bottomPath[1].y, bottomPath[2].x, bottomPath[2].y)
  ctx.bezierCurveTo(bottomPath[3].x, bottomPath[3].y, bottomPath[3].x, bottomPath[3].y, bottomPath[4].x, bottomPath[4].y)
  ctx.lineTo(canvasW, canvasH)
  ctx.lineTo(0, canvasH)
  ctx.lineTo(bottomPath[0].x, bottomPath[0].y)
  ctx.closePath()
  ctx.clip()
  // move
  ctx.translate(bottomOrigin.x, bottomOrigin.y)
  if (bottomOrigin.x <= 0 || bottomOrigin.x >= canvasW) bottomOrigin.velX *= -1 //bounce
  if (bottomOrigin.y <= 0 || bottomOrigin.y >= canvasH) bottomOrigin.velY *= -1
  bottomOrigin.x += bottomOrigin.velX
  bottomOrigin.y += bottomOrigin.velY
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.fill()
  ctx.restore()

  // CIRCLE
  // ctx.globalCompositeOperation = 'source-atop'
  ctx.save()
  ctx.fillStyle = grdWhite
  ctx.beginPath()
  ctx.arc(canvasW / 2, canvasH / 2, titleRad, 0, 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  //TXT

  window.requestAnimationFrame(waves)
  hero.appendChild(canvas)
  return hero
}

export default waves