"use strict";
/**
 * This file is part of the Media (Image,Video,Audio) Element for formBuilder.
 * https://github.com/lucasnetau/formBuilder-plugin-media
 *
 * (c) James Lucas <james@lucas.net.au>
 *
 * @license MIT
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * To disable the default handler for files (convert to dataURI) configure this via controlConfig
 *
 * A custom handler can be
 * ```
 * var renderOpts = {
 *    controlConfig: {
 *      'media.image': {
 *         default_change_handler: false,
 *         change_handler: (event) => {}
 *       }
 *       //Need to repeat config for media.video and media.image since Formbuilder does not load controlControl for parent type
 *    }
 * };
 */
if (!window.fbControls) { window.fbControls = []; }
window.fbControls.push(function media(controlClass) {
    class controlMedia extends controlClass {

        /**
         * Load embedded Javascript
         */
        configure() {
            let changeHandler = this.defaultChangeHandler;
            if ((this.classConfig.default_change_handler ?? true) === false) {
                changeHandler = undefined;
            }
            if (typeof this.classConfig.change_handler === 'function') {
                changeHandler = this.classConfig.change_handler
            }
            if (changeHandler) {
                const marker = 'controlMediaEmbedded';
                const cache = window.fbLoaded.js; //Reuse the FormBuilder cache to ensure we only load the media control JS once
                if (!cache.includes(marker)) {
                    $(document.body).on('change', '.form-builder .frm-holder .fld-media-file-upload', changeHandler)
                    cache.push(marker);
                }
            }
        }

        defaultChangeHandler(event) {
            const input = $(event.target);
            let reader = new FileReader();

            //Async read of the uploaded file and convert to a DataURI. Detect mimetype and adjust mimetype attribute and control Subtype
            reader.addEventListener("load", function () {
                const regexp = /^data:((?:\w+\/(?:(?!;).)+)?)/;
                const elementContainer = input.closest('.form-elements'); //The container for an element's configuration fields
                const srcElement = elementContainer.find('.fld-src');
                const dataUri = this.result;
                const mediatype = dataUri.match(regexp);
                if (null !== mediatype) {
                    elementContainer.find('.fld-mimetype').val(mediatype[1]);

                    let pluginSubtype;
                    if (mediatype[1].startsWith('image/')) {
                        pluginSubtype = 'image';
                    } else if (mediatype[1].startsWith('video/')) {
                        pluginSubtype = 'video';
                    } else {
                        pluginSubtype = 'audio';
                    }
                    elementContainer.find('.fld-subtype').val(pluginSubtype);
                }
                srcElement.val(dataUri).trigger('change');
                input.val("");
            });
            reader.readAsDataURL(input[0].files[0]);
        }

        /**
         * Class configuration - return the icons & label related to this control
         * @return {object} definition
         */
        static get definition() {
            return {
                icon: '🖼️',
                i18n: {
                    default: 'Media',
                },
                defaultAttrs: {
                    'className': {
                        label: "Class",
                        value: 'img-fluid',
                        type: 'text',
                    },
                    'description': {
                        label: "Help Text",
                        value: '',
                        type: 'text',
                    },
                    'src': {
                        label: "Src",
                        value: '',
                        type: 'textarea', //text inputs do not handle large data URI strings, need to use textarea to ensure the browser doesn't hang
                    },
                    'mimetype': {
                        label: "Mime Type",
                        value: '',
                        type: 'text',
                        description: 'Mimetype of Media',
                        //readonly: true,
                    },
                    'media-file-upload': {
                        label: "File",
                        value: '',
                        type: 'file',
                        description: 'Upload a media file (Image, Audio, Video)',
                        accept:"image/*,video/mp4,video/x-m4v,video/*,audio/x-m4a,audio/*",
                    },
                    'width': {
                        label: "Width",
                        value: '200',
                        type: 'text',
                    },
                    'height': {
                        label: "Height",
                        value: 'auto',
                        type: 'text',
                    },
                    'subtype': {
                        label: 'Media Type',
                        options: {
                            'image': 'Image',
                            'video': 'Video',
                            'audio': 'Audio',
                        },
                    },
                },
            };
        }

        /**
         * Build the HTML5 attribute for the specified media type
         * @return {Object} DOM Element to be injected into the form.
         */
        build() {
            const {...attrs} = this.config;
            delete(attrs.type);

            switch(this.subtype) {
                case 'image':
                    let caption = this.markup('figcaption', this.label, {});
                    let img = this.markup('img', null, attrs);
                    this.field = this.markup('figure', [img, caption,], attrs);
                    return {
                        field: this.field,
                        layout: 'noLabel',
                    };

                case 'video':
                    attrs.controls = true;
                    attrs.controlsList = "nodownload";
                    let videoSource = this.markup('source', null, {src: attrs.src, type: attrs.mimetype,});
                    this.field = this.markup('video', [videoSource, '<p>Your browser does not support HTML5 video</p>',], attrs);
                    return this.field;

                case 'audio':
                    attrs.controls = true;
                    let audioSource = this.markup('source', null, {src: attrs.src, type: attrs.mimetype,});
                    this.field = this.markup('audio', [audioSource, '<p>Your browser does not support HTML5 audio</p>',], attrs);
                    return this.field;
            }
        }

        /**
         * onRender callback
         */
        onRender() {

        }
    }

    // register this control for the following types & text subtypes
    controlClass.register('media', controlMedia);
    controlClass.register(['image','video','audio',], controlMedia, 'media');
    return controlMedia;
});