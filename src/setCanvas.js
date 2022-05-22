function setCanvas () {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const canvasW = window.innerWidth - 20
  const canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH

  const hero = document.createElement('div')
  hero.classList.add('hero-box')

  return [canvas, context, canvasW, canvasH, hero]
}

export default setCanvas