const c_math = require('canvas-sketch-util/math')
const c_random = require('canvas-sketch-util/random')
import setCanvas from '../setCanvas'

// idea for animation: http://jsfiddle.net/Cu6Zv/1/
// or rotate the context?

let [canvas, ctx, canvasW, canvasH] = setCanvas()
const bg = 'blue'
const lightBlue = '#FF0000'
let a = 0

const circles = [
  {
    'radius' : canvasH / 2,
    'points' : 7,
    'colors' : ['yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow']
  },
  {
    'radius' : canvasH / 3,
    'points' : 5,
    'colors' : ['yellow', 'yellow', 'yellow', 'yellow', 'yellow']
  },
  {
    'radius' : canvasH / 5,
    'points' : 3,
    'colors' : ['purple', 'green', 'yellow']
  }
]

function science () {
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
  window.requestAnimationFrame(science)

  return canvas
}

export default science