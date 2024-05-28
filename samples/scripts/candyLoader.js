(function ($, params) {
  const { doid, dataStorageSrc, minDuration, maxDuration } = params;
  const videoId = `doid_${doid}_video`;
  const targetAsset = document.getElementById(videoId);

  targetAsset.addEventListener('canplay', function () {
    fetch(dataStorageSrc)
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
        throw Error('fetch error');
      })
      .then((res) => {
        const { meta = null, data = [] } = res;
        if (meta) {
          const { doid, name } = meta;
          if (data.length) {
            const syncobj = {};
            data.forEach((elem) => {
              const [startmark] = elem;
              if (!(startmark in syncobj)) {
                syncobj[startmark] = [];
              }
              syncobj[startmark].push(elem.slice(1));
            });
            let iCtrlNa1 = 0;
            const playevent = (event) => {
              const currentmark = parseFloat(event.target.currentTime).toFixed(2);
              $('#timer_counter').text(`${currentmark}"`);
              const ts = Math.floor(parseFloat(currentmark));
              if (!$('.cc-wrapper').length) {
                $('#cc_breakdown').hide();
              } else {
                $('.cc-wrapper').each((_, elem) => {
                  const [, , idinfo] = elem.id.split('_');
                  if (parseInt(idinfo, 10) < ts) {
                    elem.classList.add('hidden');
                    elem.parentNode.removeChild(elem);
                  }
                });
              }
              if (ts !== iCtrlNa1 && ts in syncobj) {
                iCtrlNa1 = ts;
                const sf = syncobj[ts];

                sf.forEach((s) => {
                  const [endmark] = s;
                  let duration = endmark - ts;
                  if (maxDuration) {
                    duration = Math.min(maxDuration, duration);
                  }
                  if (minDuration) {
                    duration = Math.max(minDuration, duration);
                  }
                  const doc = document.createElement('div');
                  doc.setAttribute('class', 'd-flex justify-content-between ease-transition cc-wrapper');
                  doc.setAttribute('id', `cc_entry_${duration + ts}`);
                  doc.innerHTML = `<div class="col-5 p-3">
                  <p class="fw-bold">Product Guide 🛍️</p><p>${ts}"-${endmark}"</p><p><a href="${s[1]}" target="_blank">${s[2]}</a></p></div><div class="col-7 p-3"><img src="${s[3]}" class="w-100"></div>`;
                  $('#cc_breakdown').append(doc);
                });
                $('#cc_breakdown').show();
              }
            };
            $('#cc_breakdown').hide();
        
            // for meta information (optional)
            $('#target_video_overlay').removeClass('offscreen-right');
            setTimeout(() => {
              $('#target_video_overlay').addClass('offscreen-right');
            }, 4500);
            // optional
            $('#cc_header').html(`${doid}: ${name} CANDY`);
            // or attach event to the video element to make it simpler
            targetAsset.addEventListener('timeupdate', playevent);
            targetAsset.addEventListener('pause', function () {
              targetAsset.removeEventListener('timeupdate', playevent);
            });
            targetAsset.addEventListener('ended', function () {
              targetAsset.removeEventListener('timeupdate', playevent);
              setTimeout(() => {
          
                $('#cc_breakdown').hide();
              }, 1000);
            });
          }
        }
      })
      .catch((e) => {
        // handle errors
      });
  });
})(jQuery, { doid: 'dwn10lbnz13cb8ec78XXX', dataStorageSrc: '/storage/data/cancan_data.json', minDuration: 0, maxDuration: 0 });
