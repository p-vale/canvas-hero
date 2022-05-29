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
  return circleGdr
}

class Origin { //move color circles
  constructor(a, b) {
    this.x = c_random.range(0, canvasW)
    this.y = c_random.range(a, b)
    this.velX = c_random.range(0.5, 3)
    this.velY = c_random.range(0.5, 3)
  }
}
let topOrigin = new Origin(0, canvasH / 2)
let bottomOrigin = new Origin(canvasH / 2, canvasH)

const titleRad = 200 //title color circle
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
  ctx.moveTo(0, 0.5 / 4 * canvasH)
  ctx.bezierCurveTo(
    0.5 / 2 * canvasW, 0.5 / 8 * canvasH, 
    0.5 / 2 * canvasW, 0.5 / 8 * canvasH, 
    1 / 2 * canvasW, 0.5 / 4 * canvasH
    )
  ctx.bezierCurveTo(
    1.5 / 2 * canvasW, 1.5 / 8 * canvasH, 
    1.5 / 2 * canvasW, 1.5 / 8 * canvasH, 
    canvasW, 0.5 / 4 * canvasH
    )
  ctx.lineTo(canvasW, 0)
  ctx.lineTo(0, 0)
  ctx.lineTo(0, 0.5 / 4 * canvasH)
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
  ctx.moveTo(0, 3.5 / 4 * canvasH)
  ctx.bezierCurveTo(
    0.5 / 2 * canvasW, 7.5/8 * canvasH, 
    0.5 / 2 * canvasW, 7.5/8 * canvasH,
    1 / 2 * canvasW, 3.5/4 * canvasH
    )
  ctx.bezierCurveTo(
    1.5 / 2 * canvasW, 6.5/8 * canvasH, 
    1.5 / 2 * canvasW, 6.5/8 * canvasH, 
    canvasW, 3.5 / 4 * canvasH
    )
  ctx.lineTo(canvasW, canvasH)
  ctx.lineTo(0, canvasH)
  ctx.lineTo(0, 3.5 / 4 * canvasH)
  ctx.closePath()
  ctx.clip()
  ctx.translate(bottomOrigin.x, bottomOrigin.y)
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.fill()
  ctx.restore()
  // move
  if (bottomOrigin.x <= 0 || bottomOrigin.x >= canvasW) bottomOrigin.velX *= -1 //bounce
  if (bottomOrigin.y <= 0 || bottomOrigin.y >= canvasH) bottomOrigin.velY *= -1
  bottomOrigin.x += bottomOrigin.velX
  bottomOrigin.y += bottomOrigin.velY

  // TITLE
  ctx.save()
  ctx.fillStyle = grdWhite
  ctx.beginPath()
  ctx.arc(canvasW / 2, canvasH / 2, titleRad, 0, 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = '48px sans-serif'
  ctx.fillStyle = 'rgb(220, 153, 83)'
  ctx.fillText('WAVES', canvasW / 2, canvasH / 2 + 48 / 2)
  ctx.restore()

  // setup
  window.requestAnimationFrame(waves)
  hero.appendChild(canvas)
  return hero
}

export default waves