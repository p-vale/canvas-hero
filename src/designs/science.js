const c_math = require('canvas-sketch-util/math')
const c_random = require('canvas-sketch-util/random')
import setCanvas from '../setCanvas'

let [canvas, ctx, canvasW, canvasH, hero] = setCanvas()

function resize () {
  canvasW = window.innerWidth - 20
  canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH
}

const bg = '#000B94'
const lightBlue = '#9DC9FF'
const redish = '#FF7A00'
const orange = '#FF9D00'
const yellow = '#FFD300'
let a = 0

const circles = [
  {
    'radius' : canvasH / 2,
    'points' : 7,
    'colors' : [yellow, orange, redish, orange, yellow, redish, orange]
  },
  {
    'radius' : canvasH / 3,
    'points' : 5,
    'colors' : [redish, yellow, redish, orange, redish]
  },
  {
    'radius' : canvasH / 5,
    'points' : 4,
    'colors' : [redish, orange, yellow, orange]
  }
]

function science() {
  resize()
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvasW, canvasH)

  circles.map( (item) => {
    ctx.save()
    ctx.strokeStyle = lightBlue
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(canvasW, canvasH, item.radius, 0 , 2 * Math.PI)
    ctx.stroke()
    ctx.restore()

    for (let i = 0; i < item.points; i++) {
      ctx.strokeStyle = bg
      ctx.lineWidth = 5
      const slice = c_math.degToRad(360 / item.points)
      let angle
      if (circles.indexOf(item) % 2) {
        angle = slice * i - a
      } else {
        angle = slice * i + a
      }

      const x = canvasW + item.radius * Math.sin(angle)
      const y = canvasH + item.radius * Math.cos(angle)

      ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-angle)

        ctx.fillStyle = item.colors[i]
        ctx.beginPath()
        ctx.arc(0, 0, 10, 0, 2 *Math.PI)
        ctx.fill()
        ctx.stroke()
      ctx.restore()
    }
  })
  a = a + 0.001

  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = '48px sans-serif'
  ctx.fillStyle = orange
  ctx.fillText('SCIENCE', canvasW / 2, canvasH / 3)
  ctx.restore()

  window.requestAnimationFrame(science)

  hero.appendChild(canvas)
  return hero
}

export default science