import rgbaToHex from 'canvas-sketch-util/lib/rgba-to-hex';
import setCanvas from '../setCanvas'
const c_random = require('canvas-sketch-util/random')

let [canvas, ctx, canvasW, canvasH, hero] = setCanvas()

function resize () {
  canvasW = window.innerWidth - 20
  canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH
}

function setRadius () {
  let a;
  (canvasW > canvasH) ? a = canvasW / 2 : a = canvasH / 2 
  return a
}

function setVel() {
  let v = c_random.range(0.5, 3)
  return v
}

const colors = [
  {
    'r' : 210,
    'b' : 163,
    'g' : 93
  },
  {
    'r' : 217,
    'b' : 177,
    'g' : 118
  },
  {
    'r' : 236,
    'b' : 213,
    'g' : 179
  },
  {
    'r' : 202,
    'b' : 214,
    'g' : 221
  },
  {
    'r' : 220,
    'b' : 220,
    'g' : 220
  }
]

class Circle {
  constructor(r, b, g) {
    this.rad = setRadius()
    this.x = c_random.range(0, canvasW)
    this.y = c_random.range(0, canvasH)
    this.velX = setVel()
    this.velY = setVel()
    this.start = `rgb(${r}, ${b}, ${g}, 1)`
    this.end = `rgb(${r}, ${b}, ${g}, 0)`
  }
}

let points = []
colors.map(item => { 
  let p = new Circle(item.r, item.b, item.g)
  points.push(p)
})
let shapePoints = []
colors.map(item => { 
  let p = new Circle(item.r, item.b, item.g)
  shapePoints.push(p)
})

// SHAPE
let topPath = [
  {
    'x' : 0,
    'y' : 0.5 / 4 * canvasH
  },
  {
    'x' : 1 / 3 * canvasW,
    'y' : 0.5 / 8 * canvasH
  },
  {
    'x' : 1 /2 * canvasW,
    'y' : 0.5/4 * canvasH
  },
  {
    'x' : 2/3 * canvasW,
    'y' : 1.5/8 * canvasH
  },
  {
    'x' : canvasW,
    'y' : 0.5/4 * canvasH
  }
]

let bottomPath = [
  { 
    'x' : canvasW,
    'y' : 3.5/4 * canvasH
  },
  { 
    'x' : 2/3 * canvasW,
    'y' : 7.5/8 * canvasH
  },
  { 
    'x' : 1/2 * canvasW,
    'y' : 3.5/4 * canvasH
  },
  { 
    'x' : 1/3 * canvasW,
    'y' : 6.5/8 * canvasH
  },
  { 
    'x' : 0,
    'y' : 3.5/4 * canvasH
  }
]

// TITLE
const radius = 200
let grd = ctx.createRadialGradient(
  canvasW / 2, 
  canvasH / 2 + radius, 
  1, 
  canvasW / 2, 
  canvasH / 2 + radius,
  radius * 2.5
  )
grd.addColorStop(0, 'rgb(255, 255, 255, 0)');
grd.addColorStop(1, 'rgb(255, 255, 255, 1)')

function waves () {
  resize()
  ctx.clearRect(0, 0, canvasW, canvasH)
  
  ctx.save()
  ctx.fillStyle = 'rgb(217, 177, 118'
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.restore()

  // MOVING POIS
  points.map( (item) => {
    if (item.x < -10 || item.x > canvasW +10) { //resize smaller
      item.x = setX()
      item.y = setY()
    }
    ctx.save()
    ctx.translate(item.x, item.y)
    let itemGrd = ctx.createRadialGradient(0, 0, 5, 0, 0, item.rad)
    itemGrd.addColorStop(0, item.start)
    itemGrd.addColorStop(1, item.end)
    ctx.fillStyle = itemGrd
    ctx.beginPath()
    ctx.arc(0, 0, item.rad, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    if (item.x <= 0 || item.x >= canvasW) item.velX *= -1 //bounce
    if (item.y <= 0 || item.y >= canvasH) item.velY *= -1
    item.x += item.velX
    item.y += item.velY
  })
  ctx.globalCompositeOperation = 'color'

  // ctx.globalCompositeOperation = 'source-atop'
  // SHAPE
  // do not save-restore or it won't clip the elements after
  ctx.strokeStyle = 'rgb(0, 0, 0, 0)'
  ctx.beginPath()
  ctx.moveTo(topPath[0].x, topPath[0].y)
  // TOP
  ctx.bezierCurveTo(topPath[1].x, topPath[1].y, topPath[1].x, topPath[1].y, topPath[2].x, topPath[2].y)
  ctx.bezierCurveTo(topPath[3].x, topPath[3].y, topPath[3].x, topPath[3].y, topPath[4].x, topPath[4].y)
  // BOTTOM
  ctx.lineTo(bottomPath[0].x, bottomPath[0].y)
  ctx.bezierCurveTo(bottomPath[1].x, bottomPath[1].y, bottomPath[1].x, bottomPath[1].y, bottomPath[2].x, bottomPath[2].y)
  ctx.bezierCurveTo(bottomPath[3].x, bottomPath[3].y, bottomPath[3].x, bottomPath[3].y, bottomPath[4].x, bottomPath[4].y)
  ctx.lineTo(topPath[0].x, topPath[0].y)
  ctx.closePath()
  ctx.stroke()
  ctx.clip();
  // move shape WORK ON THIS
  (topPath[1].y <= 0.5 / 8 * canvasH) ? topPath[1].y = topPath[1].y + 1: topPath[1].y = topPath[1].y -1

  // MOVING POIS 2
  shapePoints.map( (item) => {
    if (item.x < -10 || item.x > canvasW +10) { //resize smaller
      item.x = setX()
      item.y = setY()
    }
    ctx.save()
    ctx.translate(item.x, item.y)
    let itemGrd = ctx.createRadialGradient(0, 0, 5, 0, 0, item.rad)
    itemGrd.addColorStop(0, item.start)
    itemGrd.addColorStop(1, item.end)
    ctx.fillStyle = itemGrd
    ctx.beginPath()
    ctx.arc(0, 0, item.rad, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    if (item.x <= 0 || item.x >= canvasW) item.velX *= -1 //bounce
    if (item.y <= 0 || item.y >= canvasH) item.velY *= -1
    item.x += item.velX
    item.y += item.velY
  })
  ctx.globalCompositeOperation = 'color'

  // CIRCLE
  ctx.globalCompositeOperation = 'source-atop'
  ctx.save()
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.arc(canvasW / 2, canvasH / 2, radius, 0, 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  //TXT

  window.requestAnimationFrame(waves)
  hero.appendChild(canvas)
  return hero
}

export default waves