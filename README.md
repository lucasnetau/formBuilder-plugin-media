# Media (Image/Video/Audio) plugin for kevinchappell/formBuilder
![GitHub](https://img.shields.io/github/license/lucasnetau/formBuilder-plugin-media)

A plugin to embed images, video, or audio into a formBuilder form.

## Features
* Renders HTML5 elements - Figure, Video, Audio
* Supports embedding via:
  * URL
  * DataURI
  * File Upload

## Installation

Include the plugin after formBuilder/formRender JS include

```<script src="image.js"></script>```

## Configuration
Un-used attributes "placeholder" and "required" are presented in the edit panel. These can be removed via configuring typeUserDisabledAttrs in formBuilder

```javascript
typeUserDisabledAttrs: {
    media: [
        'placeholder',
        'required',
    ]
}
```

##Notes on File Upload support
* Media uploads are converted to DataURIs in the browser and stored in the **src** field attribute. It is recommended that when processing the formBuilder template on the backend that the DataURI is uploaded (for example to a S3 bucket) and the **src** attribute is modified to point to the public URL.
* For large files it is recommended to manually upload media and link to the public URL instead of using the file upload support