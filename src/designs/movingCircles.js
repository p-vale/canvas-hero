const c_math = require('canvas-sketch-util/math')
const c_random = require('canvas-sketch-util/random')
import setCanvas from '../setCanvas'

let [canvas, context, canvasW, canvasH] = setCanvas()
const radius = canvasH / 2

function science () {
  context.save()
  context.beginPath()
  context.arc(canvasW, canvasH, radius, 0 , 2 * Math.PI)
  context.stroke()
  context.restore()

  return canvas
}

export default science