/*
Dark-mode-img-color-conversion.js version:0.10 for trilium:>0.58.4
https://github.com/SiriusXT/trilium-theme-blue/blob/main/Dark-mode-img-color-conversion.js.
You can add the #disableAdjustImage tag to the note if you don’t want the color of a certain note image to be inverted.
*/


let autoAdjustImage = true;
let autoAdjustColor = true;

//--------------------------------------------------------------------------------------
// Get the value of the CSS custom property "--theme-style" of the document element and assign it to the variable "themeStyle"
var themeStyle = getComputedStyle(document.documentElement).getPropertyValue('--theme-style');

const adjustImgCss = `
    .scrolling-container img.imgInversion{
      filter: invert(88%) hue-rotate(180deg);
    }
    .scrolling-container img:not(.imgInversion):not(.imgNotInversion) {
       opacity: 0.05;
       brightness(10%);
    }
    .scrolling-container img.imgInversion {
       opacity: 1;
    }
    .scrolling-container img.imgNotInversion {
       opacity: 1;
       filter: brightness(90%);
    }
    .scrolling-container img.imgNotInversionImportant {
      opacity: 1 !important;
      filter: invert(0) hue-rotate(0deg) !important;
    }    
    `
const adjustColorCss = `
span[style*="background-color:hsl(0,0%,0%)"],
span[style*="background-color:hsl(0, 0%, 0%)"] {
    background-color: rgba(0, 0, 0, 0.3) !important;
}

span[style*="background-color:hsl(0,0%,30%)"],
span[style*="background-color:hsl(0, 0%, 30%)"] {
    background-color: rgba(77, 77, 77, 0.3) !important;
}

span[style*="background-color:hsl(0,0%,60%)"],
span[style*="background-color:hsl(0, 0%, 60%)"] {
    background-color: rgba(153, 153, 153, 0.3) !important;
}

span[style*="background-color:hsl(0,0%,90%)"],
span[style*="background-color:hsl(0, 0%, 90%)"] {
    background-color: rgba(230, 230, 230, 0.3) !important;
}

span[style*="background-color:hsl(0,0%,100%)"],
span[style*="background-color:hsl(0, 0%, 100%)"] {
    background-color: rgba(255, 255, 255, 0.3) !important;
}

span[style*="background-color:hsl(0,75%,60%)"],
span[style*="background-color:hsl(0, 75%, 60%)"] {
    background-color: rgba(230, 76, 76, 0.3) !important;
}

span[style*="background-color:hsl(30,75%,60%)"],
span[style*="background-color:hsl(30, 75%, 60%)"] {
    background-color: rgba(230, 153, 76, 0.3) !important;
}

span[style*="background-color:hsl(60,75%,60%)"],
span[style*="background-color:hsl(60, 75%, 60%)"],
span[style*="background-color:yellow"] {
    background-color: rgba(230, 230, 76, 0.3) !important;
}

span[style*="background-color:hsl(90,75%,60%)"],
span[style*="background-color:hsl(90, 75%, 60%)"] {
    background-color: rgba(153, 230, 76, 0.3) !important;
}

span[style*="background-color:hsl(120,75%,60%)"],
span[style*="background-color:hsl(120, 75%, 60%)"] {
    background-color: rgba(76, 230, 76, 0.3) !important;
}

span[style*="background-color:hsl(150,75%,60%)"],
span[style*="background-color:hsl(150, 75%, 60%)"] {
    background-color: rgba(76, 230, 153, 0.3) !important;
}

span[style*="background-color:hsl(180,75%,60%)"],
span[style*="background-color:hsl(180, 75%, 60%)"] {
    background-color: rgba(76, 230, 230, 0.3) !important;
}

span[style*="background-color:hsl(210,75%,60%)"],
span[style*="background-color:hsl(210, 75%, 60%)"] {
    background-color: rgba(76, 153, 230, 0.3) !important;
}

span[style*="background-color:hsl(240,75%,60%)"],
span[style*="background-color:hsl(240, 75%, 60%)"] {
    background-color: rgba(76, 76, 230, 0.3) !important;
}

span[style*="background-color:hsl(270,75%,60%)"],
span[style*="background-color:hsl(270, 75%, 60%)"] {
    background-color: rgba(153, 76, 230, 0.3) !important;
}
`
let styles = ''
// Prevent bright themes from displaying images
if (themeStyle.indexOf('dark') >= 0 && themeStyle.indexOf('light') < 0 && autoAdjustImage) {
    styles += adjustImgCss;
}

if (autoAdjustColor) {
    styles += adjustColorCss;
}

if (!autoAdjustImage && !autoAdjustColor) {
    return;
}
let style = document.createElement('style');
style.innerHTML = styles;
document.head.appendChild(style);

if (themeStyle.indexOf('dark') < 0) return;

let autoAdjustTheme = class extends api.NoteContextAwareWidget {
    get position() {
        return 100;
    }
    static get parentWidget() {
        return 'note-detail-pane';
    }
    constructor() {
        super();
    }
    isEnabled() {
        return super.isEnabled();
        // && this.note.type === 'text';
    }
    doRender() {
        this.$widget = $('');
        return this.$widget;
    }

    async refreshWithNote(note) {
        const $noteSplit = $(`.note-split[data-ntx-id="${this.noteContext.ntxId}"]`);
        this.$scrollingContainer = $noteSplit.children('.scrolling-container');
        this.disableAdjustImage = note.isLabelTruthy("disableAdjustImage");

        setTimeout(() => {
            const $imgs = this.$scrollingContainer.find("img");
            if ($imgs.length === 0) {
                return;
            }
            this.currentTime = 1;
            this.adjustImage(this.currentTime, $imgs);
        }, 100);
        setTimeout(() => {
            const $imgs = this.$scrollingContainer.find("img");
            if ($imgs.length === 0) {
                return;
            }
            this.currentTime = 2;
            this.adjustImage(this.currentTime, $imgs);
        }, 1000);
        setTimeout(() => {
            const $imgs = this.$scrollingContainer.find("img");
            if ($imgs.length === 0) {
                return;
            }
            this.currentTime = 3;
            this.adjustImage(this.currentTime, $imgs);
        }, 3000);
    }

    async adjustImage(currentTime, $imgs) {
        let countExecutions = 0;
        const maxExecutions = 60; // If your internet speed is too slow, the image may take a long time to load, so try for a long time.
        const scaleFactor = 0.4;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const interval = setInterval(() => {
            let uncompleteImgCount = 0;
            countExecutions++;

            // Process all img >>>
            for (const img of $imgs) {
                if (this.disableAdjustImage) {
                    img.classList.add('imgNotInversionImportant');
                    continue;
                } else {
                    img.classList.remove('imgNotInversionImportant');
                }
                if (img.classList.contains('imgInversion') || img.classList.contains('imgNotInversion')) {
                    continue;
                }
                if (img.complete) {
                    try {
                        canvas.width = img.width * scaleFactor;
                        canvas.height = img.height * scaleFactor;
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

                        let whiteCount = 0; // Record the number of white points
                        for (let i = 0; i < imageData.length; i += 4) {
                            if (imageData[i] > 200 && imageData[i + 1] > 200 && imageData[i + 2] > 200) whiteCount += 1;
                        }
                        if (whiteCount / (imageData.length / 4) > 0.7) {
                            img.classList.add('imgInversion');
                        } else {
                            img.classList.add('imgNotInversion');
                        }
                    } catch (error) {
                        if (img.src.indexOf('drawio.svg') > 0) {
                            img.classList.add('imgInversion');
                        }else{
                        	img.classList.add('imgNotInversion');
                        }
                        console.log('Widget: autoAdjustTheme => ', error);
                    }
                } else {
                    uncompleteImgCount++;
                }
            }
            // Process all img <<<
            if (uncompleteImgCount == 0 || countExecutions >= maxExecutions || currentTime < this.currentTime) {
                clearInterval(interval);
            }
        }, 1000);

    }

    async entitiesReloadedEvent({ loadResults }) {
        if (loadResults.isNoteContentReloaded(this.noteId)) {
            await this.refresh();
        } else if (loadResults.getAttributeRows().find(attr => attr.type === 'label' && attr.noteId === this.noteId)) {
            await this.refresh();
        }
    }
}

module.exports = autoAdjustTheme;

