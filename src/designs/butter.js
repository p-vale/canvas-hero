import setCanvas from '../setCanvas'
let [canvas, ctx, canvasW, canvasH, hero] = setCanvas()

function resize () {
  canvasW = window.innerWidth - 20
  canvasH = window.innerHeight - 20
  canvas.width = canvasW
  canvas.height = canvasH
}

const grdBg = ctx.createLinearGradient(0, canvasH, canvasW, 0)
grdBg.addColorStop(0, "#FFEFBA")
grdBg.addColorStop(1, "#FFFFFE")

const grdC = ctx.createLinearGradient(canvasW / 2 -75, canvasH / 2 +75, canvasW / 2 +75, canvasH / 2 -75)
grdC.addColorStop(0, "#FFEFBA")
grdC.addColorStop(1, "#FFFFFE")

function butter () {
  resize()

  ctx.save()
  ctx.fillStyle = grdBg
  ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.restore()

  ctx.save()
  ctx.fillStyle = grdC
  ctx.beginPath()
  ctx.arc(canvasW / 2, canvasH / 2, 150, 0 , 2 * Math.PI)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = '50px sans-serif'
  ctx.fillStyle = '#FFCB1E'
  ctx.fillText('BUTTER', canvasW / 2, canvasH / 2 + 50 / 2)
  ctx.restore()

  window.requestAnimationFrame(butter)
  hero.appendChild(canvas)
  return hero
}

export default butter