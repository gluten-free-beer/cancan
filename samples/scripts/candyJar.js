'use strict';
// to load non-sync items only, e.g. licorices, Taffies, etc.
// if you need to sync items to video frames use candyLoader: https://github.com/gluten-free-beer/cancan_client-side/blob/main/samples/scripts/candyLoader.js
(function ($, _w, _d) {
  if (typeof _w.cancan !== 'undefined') {
    const strategy = _w.cancan.strategy;
    const pauseSecs = _w.cancan.pause;
    let elem = _d.getElementById(_w.cancan.element_id);
    let vid = null;

    if (!elem) {
      elem = _d.body.children[0];
    } else if (elem.tagName === 'VIDEO' && strategy !== 'self') {
      vid = elem;
    }
    const parentEl = elem.parentElement;
    let candydata = [];
    let playstate = 1;
    const ref = {};
    function play(queue, wrapper) {
      if (queue.length && playstate) {
        if (!vid || (vid && !vid.paused)) {
          const [bobj] = queue.splice(0, 1);
          const { thumbnail = null, context = null, title, boid, url = '', provider = null } = bobj;
          // change to all to provide info even if some fields are missing
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
          }
        }
        setTimeout(() => {
          play(queue, wrapper);
        }, pauseSecs * 1000);
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
        ref.amazon = { ...r }; // you can do for all platforms
        $('.cancan-gallery').remove();
        const cancan_gallery = document.createElement('div');
        cancan_gallery.setAttribute('class', 'cancan-gallery');
        cancan_gallery.setAttribute('id', 'cancan_gallery');
        parentEl.appendChild(cancan_gallery);
        $('#cancan_gallery').hide();
        let queue = [];
        candydata.forEach((cd) => {
          let n = { ...cd };
          const { boid, provider } = cd;
          if (provider in ref) {
            if (boid in ref[provider]) {
              n.url = ref[provider][boid];
            } else {
              n = null;
            }
          }
          if (n) {
            queue = [...queue, { ...n }];
          }
        });
        play(queue, cancan_gallery);
      }
    })
    .catch((e) => console.error(e));
  }
})(jQuery, window, document);
