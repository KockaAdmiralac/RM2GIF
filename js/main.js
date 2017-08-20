'use strict';
const {dialog} = require('electron').remote, img = new Image();
let button, canvas, download, loading, delay;

function onload() {
    [button, canvas, download, loading, delay] =
    ['open', 'main', 'download', 'loading', 'delay'].map(
        el => document.getElementById(el)
    );
    button.addEventListener('click', click);
    img.addEventListener('load', imageLoad);
}

function click() {
    const files = dialog.showOpenDialog({
        filters: [{ name: 'RPG Maker sprites', extensions: ['png'] }]
    });
    loading.classList.add('active');
    if(files) {
        const name = files[0];
        img.src = `file://${name}`;
        download.download = `${name.split('/').pop().slice(0, -4)}.gif`;
    }
}

function imageLoad() {
    const w = img.width / 4,
          h = img.height / 4,
          encoder = new GIF({
              workers: 5,
              quality: 1,
              repeat: 0,
              workerScript: 'js/lib/gif.worker.js',
              transparent: 'rgba(0,0,0,0)',
              width: w,
              height: h
          });
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext('2d'),
          del = Number(delay.value);
    for(let i = 0; i < 4; ++i) {
        for(let j = 0; j < 4; ++j) {
            context.drawImage(img, j * w, i * h, w, h, 0, 0, w, h);
            encoder.addFrame(context, {copy: true, delay: del});
            context.clearRect(0, 0, w, h);
        }
    }
    encoder.on('finished', imageFinish);
    encoder.render();
}

function imageFinish(blob) {
    loading.classList.remove('active');
    const url = URL.createObjectURL(blob);
    download.href = url;
    download.click();
    URL.revokeObjectURL(url);
}

window.addEventListener('load', onload);

