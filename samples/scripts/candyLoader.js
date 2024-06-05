(function ($, params) {
  const { doid, dataStorageSrc, minDuration, maxDuration } = params;
  const videoId = `doid_${doid}_video`;
  const targetAsset = document.getElementById(videoId);
  $(document).on("click", function (e) {
    if (e.target.classList.contains("bbox")) {
      e.preventDefault();
      const desturl = e.target.getAttribute("value");
      if (checkURL(desturl)) {
        window.open(desturl, "_blank");
      }
      e.stopPropagation();
    } else if (e.target.classList.contains("close-anchor")) {
      e.target.parentNode.style.display = "none";
    }
  });
  $("input.choose-style").on("change", function (e) {
    if (!e.target.checked) {
      if (e.target.id === "check_inview") {
        $(".bbox").hide();
      } else {
        $("#cc_breakdown").hide();
      }
    }
  });
  $("#request_fullscreen").on("click", function () {
    document
      .getElementById("video_wrapper")
      .requestFullscreen()
      .catch((e) => console.error(e));
  });

  document.documentElement.addEventListener("fullscreenchange", function (e) {
    $(".bbox").remove();
  });

  targetAsset.addEventListener("canplay", function () {
    fetch(dataStorageSrc)
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
        throw Error("fetch error");
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
              const currentmark = parseFloat(event.target.currentTime).toFixed(
                2
              );
              $("#timer_counter").text(`${currentmark}"`); // remove in production
              const ts = Math.floor(parseFloat(currentmark));
              if (!$(".cc-wrapper").length) {
                $("#cc_breakdown").hide();
              } else {
                $(".cc-wrapper").each((_, elem) => {
                  const [, , idinfo] = elem.id.split("_");
                  if (parseInt(idinfo, 10) < ts) {
                    elem.classList.add("hidden");
                    elem.parentNode.removeChild(elem);
                  }
                });
              }
              const inview = $('#check_inview').is(':checked');
              const sidebar = $('#check_sidebar').is(':checked');
              if (ts !== iCtrlNa1 && ts in syncobj) {
                iCtrlNa1 = ts;
                const sf = syncobj[ts];

                const { width: vwidth, height: vheight } =
                  targetVideo.getBoundingClientRect();
                sf.forEach((s) => {
                  const [endmark, url, itemname, imgurl, level, bboxes] = s;
                  let duration = endmark - ts;
                  if (maxDuration) {
                    duration = Math.min(maxDuration, duration);
                  }
                  if (minDuration) {
                    duration = Math.max(minDuration, duration);
                  }
                  const [x1, y1, x2, y2] = bboxes;
                  const newbboxes = [
                    Math.round(vwidth * x1),
                    Math.round(vheight * y1),
                    Math.round(vwidth * x2),
                    Math.round(vheight * y2),
                  ];
                  const fontsize = Math.round(Math.min(vwidth, vheight) / 24);
                  const box = document.createElement("div");
                  box.setAttribute("id", `cc_bbox_${duration + ts}`);
                  box.setAttribute("value", url);
                  box.setAttribute("class", "bbox hidden cc-wrapper");
                  box.setAttribute("title", "Shop to support us!");
                  [box.style.left, box.style.top] = newbboxes.map(
                    (el) => `${el}px`
                  );
                  box.style.width = `${newbboxes[2] - newbboxes[0]}px`;
                  box.style.height = `${newbboxes[3] - newbboxes[1]}px`;
                  box.style.fontSize = `${Math.max(fontsize, 15)}px`;
                  box.innerHTML = `<a class="close-anchor"></a><p class="p-3">👚👗👠💄 ${itemname}</p>`;
                  $("#video_wrapper").append(box);
                  if (inview) {
                    box.classList.remove("hidden");
                  }
                  const doc = document.createElement("div");
                  doc.setAttribute(
                    "class",
                    "d-flex justify-content-between ease-transition cc-wrapper sidebar"
                  );
                  doc.setAttribute("id", `cc_entry_${duration + ts}`);
                  doc.innerHTML = `<div class="col-5 p-3">
                  <p class="fw-bold">Product Guide 🛍️</p><p>${ts}"-${endmark}"</p><p><a href="${url}" target="_blank">${itemname}</a></p></div><div class="col-7 p-3"><img src="${imgurl}" class="w-100"></div>`;
                  $("#cc_breakdown").append(doc);
                });
                if (sidebar) {
                  $("#cc_breakdown").show();
                }
              }
            };
            $("#cc_breakdown").hide();

            // for meta information (optional)
            if (targetVideo.currentTime < 1) {
              $("#target_video_overlay").removeClass("offscreen-right");
              setTimeout(() => {
                $("#target_video_overlay").addClass("offscreen-right");
              }, 4500);
            }
            // optional
            $("#cc_header").html(`${doid}: ${name} CANDY`);
            // or attach event to the video element to make it simpler
            targetAsset.addEventListener("timeupdate", playevent);
            targetAsset.addEventListener("pause", function () {
              targetAsset.removeEventListener("timeupdate", playevent);
            });
            targetAsset.addEventListener("ended", function () {
              targetAsset.removeEventListener("timeupdate", playevent);
              setTimeout(() => {
                $("#cc_breakdown").hide();
              }, 1000);
            });
          }
        }
      })
      .catch((e) => {
        // handle errors
      });
  });
})(jQuery, {
  doid: "dwn10lbnz13cb8ec78XXX",
  dataStorageSrc: "/storage/data/cancan_data.json",
  minDuration: 0,
  maxDuration: 0,
});

/**
 * 
 * see @link https://showcase.beingandtime.com/cancan/demo
 * 
 */
