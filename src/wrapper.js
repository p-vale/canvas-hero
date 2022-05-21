function wrapper (parent, child) {
  const box = document.createElement('div')
  box.classList.add('box')

  box.appendChild(child)
  parent.appendChild(box)
}

export default wrapper