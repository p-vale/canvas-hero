import setCanvas from '../setCanvas'
// import winepois from './winepois'
const c_random = require('canvas-sketch-util/random')

let [canvas, ctx, canvasW, canvasH, hero] = setCanvas()

function resize () {
  canvasW = window.innerWidth - 20
  canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH
  cw = canvasW / 2
  ch = canvasH / 2
  radius = setRadius()
}

function setRadius () {
  let a;
  (canvasW > canvasH) ? a = canvasW : a = canvasH 
  return a
}

function setX () {
  return c_random.range(0, canvasW)
}

function setY () {
  return c_random.range(0, canvasH)
}

function setVel() {
  let v = c_random.range(-3, 3)
  if (-0.5 < v && v < 0.5) v = v * 1.5
  return v
}

let cw = canvasW / 2
let ch = canvasH / 2
let radius = setRadius()
const fontSize = 50

const color = '#912853'
const grd = ctx.createRadialGradient(cw, ch, 1, cw, ch, radius);
grd.addColorStop(0, color);
grd.addColorStop(0.75, 'rgb(255, 255, 255, 0)')

const points = [
  {
    'rad' : radius,
    'x' : setX(),
    'y' : setY(),
    'velX' : setVel(),
    'velY' : setVel()
  }, 
  {
    'rad' : radius,
    'x' : setX(),
    'y' : setY(),
    'velX' : setVel(),
    'velY' : setVel()
  },
  {
    'rad' : radius / 2,
    'x' : setX(),
    'y' : setY(),
    'velX' : setVel(),
    'velY' : setVel()
  },
  {
    'rad' : radius / 2,
    'x' : setX(),
    'y' : setY(),
    'velX' : setVel(),
    'velY' : setVel()
  },
  {
    'rad' : radius / 3,
    'x' : setX(),
    'y' : setY(),
    'velX' : setVel(),
    'velY' : setVel()
  },
  {
    'rad' : radius / 3,
    'x' : setX(),
    'y' : setY(),
    'velX' : setVel(),
    'velY' : setVel()
  },
]

function wine () {
  resize()
  ctx.clearRect(0, 0, canvasW, canvasH)

  // MOVING POIS
  points.map( (item) => {
    if (item.x < -50 || item.x > canvasW +50) { //resize smaller
      item.x = setX()
      item.y = setY()
    }
    ctx.save()
    ctx.translate(item.x, item.y)
    let itemGrd = ctx.createRadialGradient(0, 0, 1, 0, 0, item.rad)
    itemGrd.addColorStop(0, color);
    itemGrd.addColorStop(1, 'rgb(255, 255, 255, 0)')
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

  // TITLE
  ctx.fillStyle = grd
  ctx.save()
  ctx.beginPath()
  ctx.arc(cw, ch, radius, 0 , 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  let whiteRadius
  (radius > 150) ? whiteRadius = 150 : whiteRadius = radius / 5
  ctx.save()
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(cw, ch, whiteRadius, 0 , 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = color
  ctx.fillText('WINE', canvasW / 2, canvasH / 2 + fontSize / 2)
  ctx.restore()

  // SETUP
  window.requestAnimationFrame(wine)
  hero.appendChild(canvas)
  return hero
}

export default wine