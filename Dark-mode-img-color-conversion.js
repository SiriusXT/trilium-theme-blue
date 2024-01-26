/*
Dark-mode-img-color-conversion.js version:0.8 for trilium:>0.58.4
https://github.com/SiriusXT/trilium-theme-blue/blob/main/Dark-mode-img-color-conversion.js.
You can add the #disableAdjustImage tag to the note if you don’t want the color of a certain note image to be inverted.
*/

let autoAdjustImage = true;
let autoAdjustColor = true;

//------------------------------------------------------------------------------------------------
// Get the value of the CSS custom property "--theme-style" of the document element and assign it to the variable "themeStyle"
var themeStyle = getComputedStyle(document.documentElement).getPropertyValue('--theme-style');
var timeoutIds = [];
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
    this.$widget = $(`<style type="text/css">
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
    </style>`);
    return this.$widget;
  }



  async refreshWithNote(note) {
    clearAllTimeouts();
    var thisnote = this;
    //console.log("Dark-mode-img-color-conversion");
    if (note.type != "text") { return; }
    //thisnote=this;

    function Adjust() {
      var targetElement = getTargetElement();//await
      //window.aaa=targetElement;
      let disableAdjustImage = false;
      if (note.isLabelTruthy("disableAdjustImage")) {
        disableAdjustImage = true;
      }
      if (autoAdjustImage) { thisnote.adjustImage(targetElement, disableAdjustImage); };
      if (autoAdjustColor) { thisnote.adjustColor(targetElement); }
    }
    $(document).ready(function () {
      Adjust();  
      timeoutIds.push(setTimeout(Adjust, 200));
      timeoutIds.push(setTimeout(Adjust, 500));
      timeoutIds.push(setTimeout(Adjust, 1000));
      timeoutIds.push(setTimeout(Adjust, 2000));
      timeoutIds.push(setTimeout(Adjust, 4000));
      //timeoutIds.push(setTimeout(Adjust, 6000));
    });

  }


  async adjustImage(targetElement, disableAdjustImage) {
    //console.log("Dark-mode-img-color-conversion: adjustImage");
    //window.targetElement = targetElement;
    //var imgElements = $(targetElement).find("img").get().reverse();
    //$.each(imgElements, function(index, imgElement) {
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
      // Iterate over all <span> elements in the document with a style attribute containing "background-color"
      if (!$(this).hasClass('color-trans')) {
        $(this).addClass('color-trans');
        var bgColor = $(this).css('background-color');
        var rgbaColor = bgColor.replace(')', ', 0.2)').replace('rgb', 'rgba');
        $(this).css('background-color', rgbaColor);
      }
    });
  }

  async entitiesReloadedEvent({ loadResults }) {
    await this.refresh();
    //setTimeout("await this.refresh();", 3000 )
    /*if (loadResults.isNoteContentReloaded(this.noteId)) {
      await this.refresh();
    } else if (loadResults.getAttributeRows().find(attr => attr.type === 'label'
      && (attr.name.toLowerCase().includes('readonly') || attr.name === 'disableAdjustImage'))) {
      await this.refresh();
    }*/
  }
}

module.exports = new autoAdjustTheme();