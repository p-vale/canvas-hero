function setCanvas () {
  let canvas = document.createElement('canvas')
  let context = canvas.getContext('2d')
  let canvasW = window.innerWidth - 20
  let canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH

  return [canvas, context, canvasW, canvasH]
}

export default setCanvas