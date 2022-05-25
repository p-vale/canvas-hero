import './style.css'
import science from './designs/science'
import wine from './designs/wine'
import waves from './designs/waves'

const container = document.createElement('div')
container.id = 'container'

// container.appendChild(science())
// container.appendChild(wine())
container.appendChild(waves())
document.body.appendChild(container)