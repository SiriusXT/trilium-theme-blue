var themeStyle = getComputedStyle(document.documentElement).getPropertyValue('--theme-style');
// Get the value of the CSS custom property "--theme-style" of the document element and assign it to the variable "themeStyle"

var invInterval;
function colorTrans(){
$('div.component.note-split.type-text:not(.hidden-ext) div.component.scrolling-container div.note-detail span[style*="background-color"]').each(function() {
  // Iterate over all <span> elements in the document with a style attribute containing "background-color"
  if (!$(this).hasClass('color-trans')) {
    $(this).addClass('color-trans');
      var bgColor = $(this).css('background-color');
    var rgbaColor = bgColor.replace(')', ', 0.3)').replace('rgb', 'rgba');
    $(this).css('background-color', rgbaColor);
  }
});
}
// If an <span> element does not have the "color-trans" class, add it and adjust its background color

function imgColorInversion(){
$('div.component.note-split:not(.hidden-ext) div.component.scrolling-container div.note-detail img').each(function() {
                var img=this;
                if ($(img).hasClass('imgInversion') || $(img).hasClass('imgNotInversion')){
                    return;
                }
                // Iterate over all <img> elements in the document and skip the iteration if the element already has either "imgInversion" or "imgNotInversion" class
                var imgObj=new Image();
                // Create a new Image object to get the pixel information

                imgObj.onload=function() {
                  // When the image is loaded, get its pixel data
                  var canvas=document.createElement('canvas');
                  canvas.width=imgObj.width;
                  canvas.height=imgObj.height;
                  var ctx=canvas.getContext('2d');
                  ctx.drawImage(imgObj, 0, 0);
                  // Get the pixel data from the canvas
                  var imageData=ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                  var rSum=0, gSum=0, bSum=0;

                  for (var i=0; i < imageData.length; i +=4) {
                    rSum +=imageData[i];
                    gSum +=imageData[i + 1];
                    bSum +=imageData[i + 2];
                  }

                  // Calculate the average pixel color
                  var pixelCount=imageData.length / 4;
                  var rAvg=Math.round(rSum / pixelCount);
                  var gAvg=Math.round(gSum / pixelCount);
                  var bAvg=Math.round(bSum / pixelCount);
                    //console.log($(img),rAvg,gAvg,bAvg);
                  // Check if the background is white
                    rAvg > 200 && gAvg > 200 && bAvg > 200
                  if ((themeStyle.indexOf('dark')>0  && ((rAvg > 200) + ( gAvg > 200) + (bAvg > 200) >= 2))||(themeStyle.indexOf('light')>0 && rAvg <100 && ((rAvg <50) + ( gAvg <50) + (bAvg <50) >= 2))) {
                    if ( !$(img).hasClass('imgInversion')) {
                      $(img).addClass('imgInversion');
                    }
                  }
                  else {
                    if ( !$(img).hasClass('imgNotInversion')) {
                      $(img).addClass('imgNotInversion');
                    }
                  }
                }
                
                imgObj.src=img.src;
              });
}
// Iterate over all <img> elements in the document and add the "imgInversion" or "imgNotInversion" class based on the background color of the image

class blackStyle extends api.NoteContextAwareWidget {
  get position() {
    return 100;
  }

  get parentWidget() {
    return 'center-pane';
  }

  doRender() {
    this.$widget =$(`<style type="text/css">
	img.imgInversion {
  filter: invert(88%) hue-rotate(180deg);
}
img:not(.imgInversion),img:not(.imgNotInversion) {
 visibility: hidden;
}
img.imgInversion,img.imgNotInversion{
  visibility:visible;
}
</style>`);
    return this.$widget;
  }

  async refreshWithNote(note) {
    $(document).ready(function () {
        clearInterval(invInterval);
        // 遍历所有 <img> 元素
        var timesRun = 0;
        invInterval=setInterval(function () {
            timesRun += 1;
            if (timesRun == 5) {
                clearInterval(invInterval);
            }
            colorTrans();
            imgColorInversion();
          }
          , 200);
      });

  }
  async entitiesReloadedEvent() {
      $(document).ready(function () {
          colorTrans();
            imgColorInversion();
          });
  }
}

module.exports=new blackStyle();