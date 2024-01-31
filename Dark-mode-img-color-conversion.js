/*
Dark-mode-img-color-conversion.js version:0.9 for trilium:>0.58.4
https://github.com/SiriusXT/trilium-theme-blue/blob/main/Dark-mode-img-color-conversion.js.
You can add the #disableAdjustImage tag to the note if you don’t want the color of a certain note image to be inverted.
*/


let autoAdjustImage = true;
let autoAdjustColor = true;

//------------------------------------------------------------------------------------------------
// Get the value of the CSS custom property "--theme-style" of the document element and assign it to the variable "themeStyle"
var themeStyle = getComputedStyle(document.documentElement).getPropertyValue('--theme-style');
var timeoutIds = [];
var observers = [];
function clearAllTimeouts() {
    for (var i = 0; i < timeoutIds.length; i++) {
        clearTimeout(timeoutIds[i]);
    }
    timeoutIds = [];
}

function getTargetElement() {//async
    return $("div.component.note-split:not(.hidden-ext) div.component.scrolling-container");
    /*let maxAttempts = 1
    let targetElement = null;
    let attempts = 0;
    
    while (!targetElement && attempts < maxAttempts) {
      try {
        if (await this.noteContext.isReadOnly()) {
            targetElement = await this.noteContext.getContentElement();
        } else {
          const textEditor = await this.noteContext.getTextEditor();
          if (textEditor && textEditor.editing && textEditor.editing.view && textEditor.editing.view.domRoots) {
            targetElement = $(textEditor.editing.view.domRoots.values().next().value);
          }
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
      attempts++;
      if (!targetElement) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    if (!targetElement) {
      console.log("Tried maximum number of times but failed to obtain a valid targetElement.");
    }
    return targetElement;*/
}


class autoAdjustTheme extends api.NoteContextAwareWidget {
    get position() {
        return 100;
    }

    get parentWidget() {
        return 'center-pane';
    }
    isEnabled() {
        return super.isEnabled()
            && this.note.type === 'text';
    }
    doRender() {
        var adjustImgCss=`<style type="text/css">
    .note-detail-editable-text img.imgInversion, .note-detail-readonly-text img.imgInversion {
      filter: invert(88%) hue-rotate(180deg);
    }
    .note-detail-editable-text img:not(.imgInversion), .note-detail-editable-text  img:not(.imgNotInversion), .note-detail-readonly-text img:not(.imgInversion), .note-detail-readonly-text  img:not(.imgNotInversion) {
       visibility: hidden;
    }
    .note-detail-editable-text img.imgInversion, .note-detail-editable-text img.imgNotInversion, .note-detail-readonly-text img.imgInversion, .note-detail-readonly-text img.imgNotInversion{
       visibility:visible;
    }
    .note-detail-editable-text img.imgNotInversionImportant, .note-detail-editable-text img.imgNotInversionImportant, .note-detail-readonly-text img.imgNotInversionImportant, .note-detail-readonly-text img.imgNotInversionImportant{
      visibility:visible !important;
      filter: invert(0) hue-rotate(0deg) !important;
    }    
    </style>`
        var adjustColorCss=`<style type="text/css">
        span[style*="background-color:hsl(0,0%,0%)"],span[style*="background-color:hsl(0, 0%, 0%)"]{
    background-color: rgba(0,0,0,0.5) !important;
}
    
span[style*="background-color:hsl(0,0%,30%)"],span[style*="background-color:hsl(0, 0%, 30%)"]{
    background-color: rgba(77,77,77,0.5) !important;
}
    
span[style*="background-color:hsl(0,0%,60%)"],span[style*="background-color:hsl(0, 0%, 60%)"]{
    background-color: rgba(153,153,153,0.5) !important;
}
    
span[style*="background-color:hsl(0,0%,90%)"],span[style*="background-color:hsl(0, 0%, 90%)"]{
    background-color: rgba(230,230,230,0.5) !important;
}
    
span[style*="background-color:hsl(0,0%,100%)"],span[style*="background-color:hsl(0, 0%, 100%)"]{
    background-color: rgba(255,255,255,0.5) !important;
}
    
span[style*="background-color:hsl(0,75%,60%)"],span[style*="background-color:hsl(0, 75%, 60%)"]{
    background-color: rgba(230,76,76,0.5) !important;
}
    
span[style*="background-color:hsl(30,75%,60%)"],span[style*="background-color:hsl(30, 75%, 60%)"]{
    background-color: rgba(230,153,76,0.5) !important;
}
    
span[style*="background-color:hsl(60,75%,60%)"],span[style*="background-color:hsl(60, 75%, 60%)"],span[style*="background-color:yellow"]{
    background-color: rgba(230,230,76,0.5) !important;
}
    
span[style*="background-color:hsl(90,75%,60%)"],span[style*="background-color:hsl(90, 75%, 60%)"]{
    background-color: rgba(153,230,76,0.5) !important;
}
    
span[style*="background-color:hsl(120,75%,60%)"],span[style*="background-color:hsl(120, 75%, 60%)"]{
    background-color: rgba(76,230,76,0.5) !important;
}
    
span[style*="background-color:hsl(150,75%,60%)"],span[style*="background-color:hsl(150, 75%, 60%)"]{
    background-color: rgba(76,230,153,0.5) !important;
}
    
span[style*="background-color:hsl(180,75%,60%)"],span[style*="background-color:hsl(180, 75%, 60%)"]{
    background-color: rgba(76,230,230,0.5) !important;
}
    
span[style*="background-color:hsl(210,75%,60%)"],span[style*="background-color:hsl(210, 75%, 60%)"]{
    background-color: rgba(76,153,230,0.5) !important;
}
    
span[style*="background-color:hsl(240,75%,60%)"],span[style*="background-color:hsl(240, 75%, 60%)"]{
    background-color: rgba(76,76,230,0.5) !important;
}
    
span[style*="background-color:hsl(270,75%,60%)"],span[style*="background-color:hsl(270, 75%, 60%)"]{
    background-color: rgba(153,76,230,0.5) !important;
}
</style>`
        if (autoAdjustColor==false){
            this.$widget = $(adjustImgCss);
        }else{
            this.$widget = $(adjustImgCss+adjustColorCss);
        }        
        return this.$widget;
    }



    async refreshWithNote(note) {
        clearAllTimeouts();
        var thisnote = this;
        //console.log("Dark-mode-img-color-conversion");
        if (note.type != "text") { return; }
        //thisnote=this;

        var targetElement = getTargetElement();
        
        function Adjust() {//await
            let disableAdjustImage = false;
            if (note.isLabelTruthy("disableAdjustImage")) {
                disableAdjustImage = true;
            }
            if (autoAdjustImage) { thisnote.adjustImage(targetElement, disableAdjustImage); };
            //if (autoAdjustColor) { thisnote.adjustColor(targetElement); }
        }


        $(document).ready(function () {
            Adjust();
            timeoutIds.push(setTimeout(Adjust, 500));
            timeoutIds.push(setTimeout(Adjust, 1000));
            timeoutIds.push(setTimeout(Adjust, 2000));
            timeoutIds.push(setTimeout(Adjust, 4000));
        });
    }


    async adjustImage(targetElement, disableAdjustImage) {
        $(targetElement).find("img").each(function () {//
            var img = this;
            //console.log(img);
            if (disableAdjustImage) {
                $(img).addClass('imgNotInversionImportant');
                return;
            } else {
                $(img).removeClass('imgNotInversionImportant');
            }
            if ($(img).hasClass('imgInversion') || $(img).hasClass('imgNotInversion')) {
                return;
            }
            // Iterate over all <img> elements in the document and skip the iteration if the element already has either "imgInversion" or "imgNotInversion" class
            var imgObj = new Image();
            // Create a new Image object to get the pixel information
            imgObj.src = img.src;
            imgObj.onload = function () {
                try {
                    // When the image is loaded, get its pixel data
                    var canvas = document.createElement('canvas');
                    canvas.width = imgObj.width;
                    canvas.height = imgObj.height;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(imgObj, 0, 0);
                    // Get the pixel data from the canvas
                    var imageData = ctx.getImageData(0, 0, canvas.width / 2, canvas.height / 2).data;
                    var rSum = 0, gSum = 0, bSum = 0;
                    for (var i = 0; i < imageData.length; i += 4) {
                        rSum += imageData[i];
                        gSum += imageData[i + 1];
                        bSum += imageData[i + 2];
                    }
                    // Calculate the average pixel color
                    var pixelCount = imageData.length / 4;
                    var rAvg = Math.round(rSum / pixelCount);
                    var gAvg = Math.round(gSum / pixelCount);
                    var bAvg = Math.round(bSum / pixelCount);
                    //console.log(pixelCount,rAvg,gAvg,bAvg);
                    // Check if the background is white
                    if (!disableAdjustImage && (themeStyle.indexOf('dark') >= 0 && ((rAvg > 180) + (gAvg > 180) + (bAvg > 180) >= 2))) { // || (themeStyle.indexOf('light') >= 0 && false)
                        $(img).addClass('imgInversion');
                    }
                    else {
                        $(img).addClass('imgNotInversion');
                    }

                } catch (error) {
                    //console.log("Dark-mode-img-color-conversion: adjustImage error!");
                    $(img).removeClass('imgInversion');
                    $(img).addClass('imgNotInversion');
                }
            }
        });
    }

    async adjustColor(targetElement) {
        $(targetElement).find('span[style*="background-color"]').add($('div.highlights-list-widget span[style*="background-color"]')).each(function () {
            var bgColor = $(this).css('background-color');
            if (bgColor.indexOf("rgba") == -1) {
                var rgbaColor = bgColor.replace(')', ', 0.2)').replace('rgb', 'rgba');
                $(this).css('background-color', rgbaColor);
            }
        });
    }

    async entitiesReloadedEvent({ loadResults }) {
        await this.refresh();
    }
}

module.exports = new autoAdjustTheme();