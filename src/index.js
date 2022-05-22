import './style.css'
import science from './designs/science'
import wine from './designs/wine'

const container = document.createElement('div')
container.id = 'container'

container.appendChild(science())
// container.appendChild(wine())
document.body.appendChild(container)