import science from './designs/science'
import wine from './designs/wine'
import waves from './designs/waves'
import cappuccino from './designs/cappuccino'

const designs = [
  {
    "name" : 'science',
    "func" : science()
  }, 
  {
    "name" : 'wine',
    "func" : wine()
  }, 
  {
    "name" : 'waves',
    "func" : waves()
  }, 
  {
    "name" : 'cappuccino',
    "func" : cappuccino()
  }
]

function menu () {
  const menu = document.createElement('div')
  menu.id = 'menu'

  let nav = document.createElement('div')
  nav.id = 'nav'
  designs.forEach((hero) => {
    let btn = document.createElement('btn')
    btn.classList.add('btn')
    let t = document.createTextNode(hero.name)
    btn.appendChild(t)
    btn.addEventListener('click', () => {
      let displayArea = document.getElementById('container')
      displayArea.innerHTML = ''
      displayArea.appendChild(hero.func)
    })
    nav.appendChild(btn)
  })
  menu.appendChild(nav)

  let hiddenMenu = true
  const menuTxt = document.createElement('p')
  menuTxt.innerHTML = 'menu'
  menuTxt.addEventListener('click', () => {
    if (hiddenMenu) {
      nav.style.display = "flex"
      menuTxt.innerHTML = 'x'
    } else {
      nav.style.display = "none" 
      menuTxt.innerHTML = 'menu'
    }
    hiddenMenu = !hiddenMenu
  })
  menu.appendChild(menuTxt)

  return menu
}

export default menu