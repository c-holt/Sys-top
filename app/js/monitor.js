const path = require('path')
const {ipcRenderer} = require('electron')
const osu = require('node-os-utils')
const notifier = require('node-notifier');
const cpu = osu.cpu
const mem = osu.mem
const os = osu.os



let cpuOverload
let alertFrequency

//get settings & values
ipcRenderer.on('settings:get', (e,settings) => {
    cpuOverload = +settings.cpuOverload,
    alertFrequency = +settings.alertFrequency
})

//Run Every 2 Sec
setInterval(() => {
    //CPU usage
    cpu.usage().then(info => {
        document.getElementById('cpu-usage').innerText = info + '%'
        document.getElementById('cpu-progress').style.width = info + '%'

        //make progress bar red if overload
        if (info >= cpuOverload){
            document.getElementById('cpu-progress').style.background = 'red'
        }else{
            document.getElementById('cpu-progress').style.background = '#30c88b'
        }

        //check overload
        if (info >= cpuOverload && runNotify(alertFrequency)){
            notifier.notify({
                title: 'CPU Overload',
                message: `CPU is over ${cpuOverload}%`
            });
            localStorage.setItem('lastNotify', +new Date())
        }
    })

    //CPU Free
    cpu.free().then(info => {
        document.getElementById('cpu-free').innerText = info + '%'
    })

    //uptime
    document.getElementById('sys-uptime').innerText = secondsToDhms(os.uptime())
}, 2000)

// set model
document.getElementById('cpu-model').innerText = cpu.model()

//computer name
document.getElementById('comp-name').innerText = os.hostname()

//OS
document.getElementById('comp-os').innerText = `${os.type()} ${os.arch()}`

//Total Mem
mem.info().then(info => {
    document.getElementById('mem-total').innerText = info.totalMemMb
})

//show days, hours, minutes, seconds
function secondsToDhms(seconds) {
    seconds = +seconds
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24))/3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${d}d, ${h}h, ${m}m, ${s}s`
}

//check how much time has past since notification
function runNotify(frequency) {
    if(localStorage.getItem('lastNotify')=== null){
        //store timestamp
        localStorage.setItem('lastNotify', +new Date())
        return true
    }
    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')))
    const now = new Date()
    const diffTIme = Math.abs(now - notifyTime)
    const minutesPassed = Math.ceil(diffTIme / (1000 * 60))

    if (minutesPassed > frequency) {
        return true
    }else {
        return false
    }

}