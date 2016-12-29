console.log('happy holidays!')

import 'whatwg-fetch'

import './app.styl'

import imgZ0 from './static/img/z0.jpg'
import imgZ1r from './static/img/z1-red.png'
import imgZ1g from './static/img/z1-green.png'

const createImage = (dataURL) => new Promise((resolve, reject) => {
  const i = new Image()
  i.onload = () => resolve(i)
  i.onerror = (e) => reject(e)
  i.src = dataURL
})

const loadImage = (url) => fetch(url)
  .then(r => r.blob())
  .then(b => URL.createObjectURL(b))
  .then(createImage)

class CanvasImage {
  constructor (img) {
    const canvas = document.createElement('canvas')
    const { width: w, height: h } = img
    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    this.canvas = canvas
    this.ctx = ctx
    this.originalImage = ctx.getImageData(0, 0, w, h)

    this.imagesAtAlpha = {}
  }

  get alpha () {
    return this.originalImage.data[3] / 255
  }

  getImageWithAlpha (v = 1) {
    const a = Math.round(255 * v)

    if (!this.imagesAtAlpha[a]) {
      this.ctx.putImageData(this.originalImage, 0, 0)
      const { width: w, height: h } = this.canvas
      const tmp = this.ctx.getImageData(0, 0, w, h)
      const d = tmp.data
      for (let i = 3; i < d.length; i += 4) {
        d[i] = Math.min(a, d[i])
      }
      this.ctx.putImageData(tmp, 0, 0)
      const u = this.canvas.toDataURL()
      this.imagesAtAlpha[a] = createImage(u)
    }

    return this.imagesAtAlpha[a]
  }
}

class Lights {
  constructor (canvas, base, overlay, cycles) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')

    this.base = base
    this.overlay = overlay
    this.cycles = cycles.map(c => new CanvasImage(c))

    this.interval = null
  }

  drawCycleAtAlpha (cycleIndex = 0, alpha = 1) {
    return this.cycles[cycleIndex].getImageWithAlpha(alpha)
      .then(i => {
        this.ctx.globalCompositeOperation = 'source-over'
        this.ctx.drawImage(this.base, 0, 0)
        this.ctx.drawImage(i, 0, 0)
        this.ctx.globalCompositeOperation = 'lighten'
        this.ctx.drawImage(this.overlay, 0, 0)
      })
  }

  alphaAtStep (x) {
    return -Math.abs((2 * x) - 1) + 1
  }

  start (fps = 30, cyclesPerSecond = 0.5) {
    this.stop()
    const interval = 1000 / fps
    const steps = fps / cyclesPerSecond
    let step = 0
    let cycle = 0
    let drop = false

    this.ctx.scale(
      this.base.width / this.canvas.width,
      this.base.height / this.canvas.height
    )

    this.interval = setInterval(() => {
      if (drop) {
        return
      }
      drop = true
      this.drawCycleAtAlpha(cycle, this.alphaAtStep(step / steps))
        .then(() => drop = false)
      step += 1
      if (step > steps) {
        cycle = (cycle + 1) % this.cycles.length
        step = 0
      }
    }, 1000 / fps)
  }

  stop() {
    clearInterval(this.interval)
  }
}

const lightsImages = Promise.all([
    loadImage(imgZ0),
    loadImage(imgZ1r),
    loadImage(imgZ1g)
  ])
  .then(images => {
    const [ z0 ] = images

    const z2 = new CanvasImage(z0)

    return z2.getImageWithAlpha(0.32)
      .then(i => [ ...images, i ])
  })
  .then(images => {
    const [ z0, r, g, z2 ] = images

    return new Lights(
      document.querySelector('#lights'),
      z0,
      z2,
      [ r, g ]
    )
  })

const readPause = new Promise((resolve, reject) => {
  setTimeout(resolve, 2000)
})

Promise.all([
    lightsImages,
    readPause
  ])
  .then(([ l ])=> l.start(20, 1 / 3))
  .then(() => {
    const c = document.querySelector('#card')
    c.classList.add('shake')
    const em = c.querySelector('.front em')

    c.onclick = () => {
      c.classList.toggle('flipped')
      c.classList.toggle('shake')
      em.classList.add('hide')
    }
  })

