import setCanvas from '../setCanvas'
let [canvas, ctx, canvasW, canvasH, hero] = setCanvas()

function resize () {
  canvasW = window.innerWidth - 20
  canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH
}

const radius = 150 

const grdC = ctx.createRadialGradient(canvasW / 2, canvasH / 2 + radius, 0, canvasW / 2, canvasH / 2, 200)
grdC.addColorStop(0, 'rgb(255, 255, 255, 0)')
grdC.addColorStop(1, "#93C5CC")

function mint () {
  resize()

  ctx.save()
  ctx.fillStyle = '#D9E6E2'
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.restore()

  ctx.save()
  ctx.fillStyle = grdC
  ctx.beginPath()
  ctx.arc(canvasW / 2, canvasH / 2, radius, 0 , 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = '50px sans-serif'
  ctx.fillStyle = 'white'
  ctx.fillText('MINT', canvasW / 2, canvasH / 2 + 50 / 2)
  ctx.restore()

  window.requestAnimationFrame(mint)
  hero.appendChild(canvas)
  return hero
}

export default mint