import science from './designs/science'
import wine from './designs/wine'
import waves from './designs/waves'
import cappuccino from './designs/cappuccino'
import butter from './designs/butter'
import mint from './designs/mint'

const designs = [
  {
    "name" : 'science',
    "func" : science
  }, 
  {
    "name" : 'wine',
    "func" : wine
  }, 
  {
    "name" : 'waves',
    "func" : waves
  }, 
  {
    "name" : 'cappuccino',
    "func" : cappuccino
  },
  {
    "name" : 'butter',
    "func" : butter
  },
  {
    "name" : 'mint',
    "func" : mint
  }
]

function cancelAllAnimationFrames(){
  let id = window.requestAnimationFrame(function(){});
  while(id--){
    window.cancelAnimationFrame(id);
  }
}

function setHero(item) {
  cancelAllAnimationFrames()
  let displayArea = document.getElementById('container')
  displayArea.innerHTML = ''
  displayArea.appendChild(item.func())
}


function menu () {
  const menu = document.createElement('div')
  menu.id = 'menu'

  let nav = document.createElement('div')
  nav.id = 'nav'
  designs.forEach((item) => {
    let btn = document.createElement('btn')
    btn.classList.add('btn')
    btn.id = item.name
    let t = document.createTextNode(item.name)
    btn.appendChild(t)
    btn.addEventListener('click', () => {
      setHero(item)
    })
    nav.appendChild(btn)
  })
  menu.appendChild(nav)

  let hiddenMenu = true
  const menuTxt = document.createElement('p')
  menuTxt.innerHTML = 'MENU'
  menuTxt.addEventListener('click', () => {
    if (hiddenMenu) {
      nav.style.display = "flex"
      menuTxt.innerHTML = '<sup>x</sup>'
    } else {
      nav.style.display = "none" 
      menuTxt.innerHTML = 'MENU'
    }
    hiddenMenu = !hiddenMenu
  })
  menu.appendChild(menuTxt)

  return menu
}

export default menu