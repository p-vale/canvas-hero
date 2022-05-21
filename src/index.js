import './style.css'
import wrapper from './wrapper'
import science from './designs/movingCircles'

const container = document.createElement('div')
container.id = 'container'

wrapper(container, science())
document.body.appendChild(container)