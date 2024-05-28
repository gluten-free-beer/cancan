"use strict";

// add to the main script if necessary
// dimensize => the size of the canvas (rendering)

const paintCanvas = ({
  vidEl,
  bboxes,
  dimenSize = 400,
  doid,
  targetEl = "canvas_area", endmark
}) => {
  const drawCanvas = function (cwidth, cheight) {
    const _CANVAS = document.createElement("canvas");
    _CANVAS.setAttribute("class", "cc-wrapper"); // synced
    _CANVAS.width = cwidth;
    _CANVAS.height = cheight;
    return _CANVAS;
  };
  const videoId = `doid_${doid}_video`;
  const vwidth = $(`#${videoId}`)[0].videoWidth;
  const vheight = $(`#${videoId}`)[0].videoHeight;
  const [x1, y1, x2, y2] = bbxs;
  const bbxn = [
    x1 * vwidth,
    y1 * vheight,
    (x2 - x1) * vwidth,
    (y2 - y1) * vheight,
  ].map((el) => Math.round(el));
  let ratio;
  let canvasWidth = dimenSize;
  let canvasHeight = dimenSize;

  const aspectRatio = vwidth / vheight;
  if (aspectRatio >= 1) {
    ratio = bbxn[2] / canvasWidth;
    canvasHeight = Math.ceil(bbxn[3] / ratio);
  } else {
    ratio = bbxn[3] / canvasHeight;
    canvasWidth = Math.ceil(bbxn[2] / ratio);
  }
  const iCanvasEz1 = drawCanvas(canvasWidth, canvasHeight);
  iCanvasEz1.setAttribute("id", `cc_canvas_${endmark}`);
  const ictx = iCanvasEz1.getContext("2d");
  ictx.drawImage(
    vidEl,
    bbxn[0],
    bbxn[1],
    bbxn[2],
    bbxn[3],
    0,
    0,
    canvasWidth,
    canvasHeight
  );
  $(`#${targetEl}`).append(iCanvasEz1);
};
