import './style.css'
import menu from './menu'

document.body.appendChild(menu())

const container = document.createElement('div')
container.id = 'container'
document.body.appendChild(container)
const btn = document.getElementById('science')
btn.click()
