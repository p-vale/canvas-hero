import './style.css'
import science from './designs/science'
import menu from './menu'

const container = document.createElement('div')
container.id = 'container'

container.appendChild(science())
document.body.appendChild(container)
document.body.appendChild(menu())
