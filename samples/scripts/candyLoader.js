(function ($, params) {
  const { videoId, dataStorageSrc, minDuration, maxDuration } = params;
  const targetVideo = document.getElementById(videoId);

  targetVideo.addEventListener('play', function () {
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
            $('#cc_details_content').empty();
            // for meta information (optional)
            $('#target_video_overlay').removeClass('offscreen-right');
            setTimeout(() => {
              $('#target_video_overlay').addClass('offscreen-right');
            }, 4500);
            // optional
            $('#cc_header').html(`${doid}: ${name} CANDY`);
            // or attach event to the video element to make it simpler
            targetVideo.addEventListener('timeupdate', playevent);
            targetVideo.addEventListener('pause', function () {
              targetVideo.removeEventListener('timeupdate', playevent);
            });
            targetVideo.addEventListener('ended', function () {
              targetVideo.removeEventListener('timeupdate', playevent);
              setTimeout(() => {
                $('#cc_details_content').empty();
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
})(jQuery, { videoId: 'cancan_video', dataStorageSrc: '/storage/data/cancan_data.json', minDuration: 0, maxDuration: 0 });
