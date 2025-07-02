'use strict';
// to load non-sync items only, e.g. licorices, Taffies, etc.
// if you need to sync items to video frames use candyLoader: https://github.com/gluten-free-beer/cancan_client-side/blob/main/samples/scripts/candyLoader.js
(function ($, _w, _d) {
  if (typeof _w.cancan !== 'undefined') {
    const strategy = _w.cancan.strategy;
    const pauseSecs = _w.cancan.pause;
    let elem = _d.getElementById(_w.cancan.element_id);
    if (!elem) {
      elem = _d.body.children[0];
    }
    const parentEl = elem.parentElement;
    let candydata = [];
    let playstate = 1;
    function play(queue, wrapper) {
      if (queue.length && playstate) {
        const [bobj] = queue.splice(0, 1);
        const { thumbnail = null, context = null, title, boid, url = '' } = bobj;

        if (thumbnail && context) {
          let iname = title;
          if (url.length > 10) {
            iname = `<a href="${url}" target="_blank">${title}</a>`;
          }
          $('#cancan_gallery').fadeOut();
          wrapper.innerHTML = `<a class="close-anchor light"></a><div><p>🌟 ${iname}</p><div class="d-flex justify-content-between"><div class="col-5"><img class="load-later preview-img" loading='lazy' src="${thumbnail}"></div><div class="col-5"><img class="load-later preview-img" loading='lazy' src="${context}"></div></div></div>`;
          $('#cancan_gallery').fadeIn();
          $('.close-anchor').on('click', function () {
            playstate = 0;
            $('#cancan_gallery').fadeOut();
          });
          setTimeout(() => {
            play(queue, wrapper);
          }, pauseSecs * 1000);
        }
      } else {
        setTimeout(() => {
          $('#cancan_gallery').hide();
        }, 1500);
      }
    }
    fetch('/rsc/data/candy/licorice.json')
    .then((r) => r.json())
    .then((r) => {
      if (r && r.data && r.data.length) {
        candydata = r.data;
        return fetch('/rsc/data/references/amazon.json');
      }
      throw 'no data';
    })
    .then((r) => {
      if (r) {
        const amazonref = { ...r }; // you can do for all platforms
        $('.cancan-gallery').remove();
        const cancan_gallery = document.createElement('div');
        cancan_gallery.setAttribute('class', 'cancan-gallery');
        cancan_gallery.setAttribute('id', 'cancan_gallery');
        parentEl.appendChild(cancan_gallery);
        let queue = [...candydata];

        play(queue, cancan_gallery);
      }
    })
    .catch((e) => console.error(e));
  }
})(jQuery, window, document);
