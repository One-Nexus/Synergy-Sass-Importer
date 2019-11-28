[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/One-Nexus/Synergy-Sass-Importer/blob/master/LICENSE)
[![Travis build](https://api.travis-ci.com/One-Nexus/Synergy.svg)](https://travis-ci.com/One-Nexus/Synergy-Sass-Importer)
[![npm version](https://badge.fury.io/js/%40onenexus%2Fsynergy-sass-importer.svg)](https://www.npmjs.com/package/@onenexus/synergy-sass-importer)
[![npm downloads](https://img.shields.io/npm/dm/@onenexus/synergy-sass-importer.svg)](https://www.npmjs.com/package/@onenexus/synergy-sass-importer)

<img height="56px" src="http://www.onenexus.io/synergy/github-logo.png" />

> Import JavaScript/JSON files into Sass

* [Overview](#overview)
* [Setup](#setinstallation--setup)
* [Usage](#usage)

## Overview

Synergy-Sass-Importer allows you to import JavaScript/JSON/json5 files into your Sass files. It was built for the [Cell library](https://github.com/One-Nexus/Synergy) (which in turn was built for the [Synergy framework](https://github.com/One-Nexus/Synergy)) but can be used with any projects that use Node.js and Sass.

###### Usecases

* Share UI component configuration between Sass/JavaScript
* Theming (import JavaScript themes into your Sass)
* ...expose theme to UI component configuration
* Import any JavaScript/JSON data into Sass for any reason

## Installation & Setup

> npm install --save-dev @onenexus/synergy-sass-importer

### [node-sass](https://github.com/sass/node-sass)

This module hooks into [node-sass's importer api](https://github.com/sass/node-sass#importer--v200---experimental).

```javascript
var sass = require('node-sass');
var SynergySassImporter = require('@onenexus/synergy-sass-importer');

// Example 1
sass.render({
  file: scss_filename,
  importer: SynergySassImporter,
  ...options
}, function(err, result) {
  ...
});

// Example 2
var result = sass.renderSync({
  data: scss_content
  importer: [SynergySassImporter, someOtherImporter]
  ...options
});
```

### [node-sass](https://github.com/sass/node-sass) command-line interface

To run this using node-sass CLI, point `--importer` to your installed json importer, for example: 

```sh
node-sass /PATH/TO/app.scss --importer node_modules/synergy-sass-importer/dist/synergy-sass-importer.js
```

### Webpack / [sass-loader](https://github.com/jtangelder/sass-loader)

###### ES6 Imports

```js
import SassJSONImporter from '@onenexus/sass-json-importer';
```

###### CommonJS

```js
const SassJSONImporter = require('@onenexus/sass-json-importer');
```

###### Configuration

```js
{
  test: /\.scss$/,
  use: [
    {
      loader: 'sass-loader', 
      options: {
        importer: SynergySassImporter
      }
    }
  ]
}
```

## Usage

Once your Sass compiler has been setup to use `Synergy-Sass-Importer`, you can begin to import JavaScript/JSON files in your `.scss` files. Any of the following are valid imports into `.scss` files:

* Any valid `.json`/`.json5` file
* Any `.js` file that exports an object
* Any `.js` file that exports a function which returns an object

The resultant object of the import (if a function is imported [it will be evaluated](#componentsmycomponentconfigjs-1)) will be converted to a Sass map and exposed to your Sass under a variable named after the name of the file that was imported.

##### Example

###### components/myComponent/config.json

```json
{
  "someProperty": "someValue",
  "anotherProp": 20
}
```

###### components/myComponent/styles.scss

```scss
 // `$config` is now defined (because the file is called 'config.json');
 // if the file were called 'data.json', `$data` would instead be defined
@import 'config.json';

.myComponent {
  display: block;
  font-size: map-get($config, 'anotherProp');
}
```

### Themes

There are several uses for themes:

* Share common properties between UI components
* Change entire project look and feel on the fly by switching themes

From what we've seen so far, we can already import a JavaScript/JSON theme into our Sass and access the values:

###### themes/myTheme.json

```json
{
  "colors": {
    "primary": "#009dff",
    "secondary": "#ff004c"
  }
}
```

###### components/myComponent/styles.scss

```scss
 // `$theme` is now defined
@import '../../themes/myTheme.json';

.myComponent {
  display: block;
  color: map-get-deep($theme, 'colors', 'primary');
}
```

Consider the case where we want to access the theme values from within the earleir `config.json` file. One approach would be to convert it to a `.js` file and manually import the theme like so:

###### components/myComponent/config.js

```js
import theme from '../../themes/myTheme.json';

export default {
  'someProperty': theme.colors.primary,
  'anotherProp': 20
}
```

An alternative approach is to convert the configuration to a function that accepts a `theme` argument:

###### components/myComponent/config.js

```js
export default (theme) => ({
  'someProperty': theme.colors.primary,
  'anotherProp': 20
});
```

The theme (provided it has been imported into your Sass) will automatically be passed to the function which will be evaluated, and the returned object will be converted to a Sass map.

###### components/myComponent/styles.scss

```scss
@import 'config.js';

.myComponent {
  display: block;
  color: map-get($config, 'someProperty'); // #009dff
}
```

###### app.scss

```scss
@import 'themes/myTheme.json';
@import 'components/myComponent.scss';
```

#### Passing Theme To Sass Through Node.js

Rather than importing the theme into your Sass manually, you can expose it to Node.js where it will be picked up by Synergy-Sass-Importer and automatically passed to Sass - [learn more](https://github.com/One-Nexus/Synergy-Sass-Importer/wiki/Passing-Themes-to-Sass-Through-Node).

---

<a href="https://twitter.com/ESR360">
    <img src="http://edmundreed.com/assets/images/twitter.gif?v=1" width="250px" />
</a>
<a href="https://github.com/ESR360">
    <img src="http://edmundreed.com/assets/images/github.gif?v=1" width="250px" />
</a>