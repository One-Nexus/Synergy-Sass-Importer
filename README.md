[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/One-Nexus/Synergy-Sass-Importer/blob/master/LICENSE)
[![Travis build](https://api.travis-ci.com/One-Nexus/Synergy.svg)](https://travis-ci.com/One-Nexus/Synergy-Sass-Importer)
[![npm version](https://badge.fury.io/js/%40onenexus%2Fsynergy-sass-importer.svg)](https://www.npmjs.com/package/@onenexus/synergy-sass-importer)
[![npm downloads](https://img.shields.io/npm/dm/@onenexus/synergy-sass-importer.svg)](https://www.npmjs.com/package/@onenexus/synergy-sass-importer)

<img height="56px" src="http://www.onenexus.io/synergy/github-logo.png" />

> Import JavaScript/JSON files into Sass

Synergy-Sass-Importer allows you to import JavaScript/JSON/json5 files into your Sass file. It was built for the [Cell library](https://github.com/One-Nexus/Synergy) (which in turn was built for the [Synergy framework](https://github.com/One-Nexus/Synergy)) but can be used with any projects that use Node.js and Sass.

* [Setup](#setinstallation--setupup)
* [Usage](#usage)

# Installation & Setup

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
}, function(err, result) { /*...*/ });

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

# Usage

* [JavaScript](#javascript)
* [JSON](#json)
* [Themes](#themes)

Once your Sass compiler has been setup to use `Synergy-Sass-Importer`, you can begin to import JavaScript/JSON files in your `.scss` files. The purpose of `Synergy-Sass-Importer` is to provide [configuration](https://github.com/One-Nexus/Synergy/wiki/Module-Configuration) for [Synergy modules](https://github.com/One-Nexus/Synergy/wiki/Modules,-Components-and-Modifiers#modules), but this essentially can be translated to "provide data to Sass components". This usage guide will assume you are using `Synergy-Sass-Importer` to provide configuration for some UI component that you are styling with Sass, with a rational of being able to share configuration between Sass and JavaScript. If you are using `Synergy-Sass-Importer` for some other purpose, the guide should hopefully still be of some use.

## JavaScript

Using JavaScript to handle your component's configuration is the most flexible means to do it. It allows you to easily use framework-agnostic JavaScript-based themes within your project as well as allows for logic within your component's configuration. Configuration should be exported from its own file.

### File Exports an Object

If your JavaScript configuration file exports a plain JavaScript object, please see the [`JSON`](#json) section for static configuration where the same rules apply. If you require themeing or any sort of logic, consider [exporting a function](#file-exports-a-function) instead.

### File Exports a Function

This is the most flexible way to handle a UI component's configuration ([learn more](https://github.com/One-Nexus/Synergy/wiki/Module-Configuration)). It allows you to use themes and easily share properties accross components. Simply export a function that takes an optional single parameter as the input. The parameter will expose the project's theme ([learn more](https://github.com/One-Nexus/Synergy-Sass-Importer/wiki#themes)). The function should return an object. The object will be converted to a Sass map and attached to a variable named after the file which is imported (e.g `$config` from a `config.js` file) and then made available to Sass.

###### config.js

```js
export default (theme) => ({
    'name': 'myModule',
    'color': theme.colors.secondary,
    ...
})
```

###### styles.scss

```scss
@import 'config.js'; // `$config` will now be defined in Sass

.mySelector {
    color: map-get($config, 'color');
}
```

#### Theme

Using JavaScript for configuration allows you to expose a theme to your configuration (as seen in the above example - [learn more](#themes)), allowing you to share properties between components. Your theme should exist as a separate JavaScript file which should export either an object or a function which returns an object. This object will be passed as the argument to your component's configuration function.

> See the [Themes](#themes) section for more information on themes

## JSON

JSON files are useful for static configuration, but if you require themeing or any sort of logic, consider using [JavaScript](#javascript) instead. The JSON object will be converted to a Sass map and attached to a variable named after the file which is imported (e.g `$config` from a `config.json` file) and then made available to Sass.

###### /config.json

```js
{
    "foo": "red",
    "bar": {
        "qux": "10px"
    }
}
```

###### /styles.scss

```scss
@import 'config.json';

.fizz {
    color: map-get($config, 'foo');
    height: map-get(map-get($config, 'bar'), 'qux');
}
```

###### Output

```css
.fizz {
    color: red;
    height: 10px;
}
```

###### Using Synergy/Cell

If using [Synergy](https://github.com/One-Nexus/Synergy) or [Cell](https://github.com/One-Nexus/Cell), you can use the `this()` function to retreive configurayion from a `$config` variable (this means your files must be named `config.json`):

```scss
@import 'config.json';

.fizz {
    color: this('foo');
    height: this('bar', 'qux');
}
```

## Themes

There are several uses for themes:

* share properties between imported JavaScript files that [export a function](#file-exports-a-function) (share properties between modules, in Synergy terms)
* merge/overwrite properties returned from other imports (overwrite module configuration, in Synergy terms)
* expose a `$theme` variable to Sass with your theme's evaluated properties assigned

Themes can be imported into Sass or passed via the global Node object.

### Theme as a Function

Creating a theme as a function let's you access the theme's values from within the theme itself, as well as from an optional [foundation theme/global object](#globalfoundation-theme) which would be merged into `theme`.

* accepts an optional parameter (`theme`) which will be the object you are creating merged with any [foundation theme/global object](#globalfoundation-theme)
* properties which access `theme` must be passed as functions that return the desired value

```js
export default (theme) => ({
    colors: {
        primary: 'red',
        secondary: 'blue'
    },
    someThing: {
        // // properties which access `theme` must be passed as functions
        color: () => theme.colors.primary // 'red'
    }
})
```

### Importing Theme Into Sass

You can import a theme into your module's Sass file along with any other imports (i.e a `config.js` file), and `Synergy-Sass-Importer` will do the rest. If any other subsequent imports (e.g. config.js) export a function, the theme will be supplied as the argument to the function. The theme will also be exposed to Sass under the `$theme` variable.

> In order for Synergy-Sass-Impoter to know that an imported file is intended to be a theme, it must either be called `theme.{js|json}` or have a direct parent/grand-parent directory called `themes`

###### src/themes/myTheme.js

```js
export default (theme) => ({
    someProperty: true,
    colors: {
        primary: 'red',
        secondary: 'green'
    },
    sizes: {
        primary: '16px',
        secondary: '12px'
    },
    someThing: {
        // properties which access `theme` must be passed as functions
        someProperty: () => theme.colors.primary // 'red'
    },
    // Module configuration can be overwritten by themes (see - https://git.io/fjBww)
    modules: {
        Accordion: {
            'font-size': () => theme.sizes.primary // '16px',
            'font-weight': 'bold' // static values do not need to be passed as functions
        }
    }
    ...
});
```

###### src/modules/Accordion/config.js

```js
export default (theme) => ({
    'color': theme.colors.secondary, // green
    'font-size': theme.sizes.secondary // this gets overwritten by the above theme
});
```

###### src/modules/Accordion/styles.scss

```scss
@import '../../../themes/myTheme.js';
@import 'config.js';

.accordion {
    color: map-get($config, 'color'); // green
    font-size: map-get($config, 'font-size'); // 16px
    font-weight: map-get($config, 'font-weight'); // bold
}

.someThing {
    color: if(map-get($theme, 'someProperty'), 'pink', 'orange'); // pink
}
```

#### Using [`sass-resources-loader`](https://github.com/shakacode/sass-resources-loader)

> Checkout [`sass-resources-loader`](https://github.com/shakacode/sass-resources-loader) for sharing resources between Sass files using Webpack if you don't want to import your theme into every Sass file

### Passing Theme To Sass Through Node.js

Instead of having to import the theme into each file (which could become problematic if you want to change themes and have to update a bunch of paths), you can instead pass the theme through Node.js where it will be picked up by `Synergy-Sass-Importer` - [learn more](https://github.com/One-Nexus/Synergy-Sass-Importer/wiki/Passing-Themes-to-Sass-Through-Node).

### Global/Foundation Theme

It's possible that your various themes may share many properties which are not prone to changing on a theme-to-theme basis. If this is the case, consider creating a foundation theme on which to base subsequent themes. Unlike regular themes, a foundation theme can only be an object (and not a function that returns an object). These values can be exposed to your themes when your theme [exists as a `function`](https://github.com/One-Nexus/Synergy-Sass-Importer/wiki/Passing-Themes-to-Sass-Through-Node#theme-as-a-function) (they will be supplied via the `theme` argument, which the theme function itself mutates, allowing you to access new theme values from [within the theme itself](https://github.com/One-Nexus/Synergy/wiki/Themes#accessing-globalsself-from-within-theme)).

#### Import Foundation Theme Into Sass

You can import a foundation theme into your module's Sass file along with your new theme and `config.js` file, and `Synergy-Sass-Importer` will do the rest.

> In order for Synergy-Sass-Impoter to know that an imported file is intended to be a foundation theme, it must either be called `foundation.{js|json}` or have a direct parent directory called `foundation`

###### src/foundation/index.js

```js
export default {
    someProperty: true,
    colors: {
        primary: 'red',
        secondary: 'blue'
    },
    sizes: {
        primary: '16px',
        secondary: '12px'
    }
};
```

###### src/themes/myTheme.js

```js
export default (theme) => ({
    someProperty: false,
    colors: {
        secondary: 'green'
    },
    someNewThing: {
        // properties which access `theme` must be passed as functions
        someProperty: () => theme.colors.primary // 'red'
    },
    // Module configuration can be overwritten by themes (see - https://git.io/fjBww)
    modules: {
        Accordion: {
            'font-size': () => theme.sizes.primary // '16px',
            'font-weight': 'bold' // static values do not need to be passed as functions
        }
    }
    ...
});
```

###### src/modules/Accordion/config.js

```js
export default (theme) => ({
    'color': theme.colors.secondary, // green
    'font-size': theme.sizes.secondary // this gets overwritten by the above theme
});
```

###### src/modules/Accordion/styles.scss

```scss
@import '../../../foundation/index.js';
@import '../../../themes/myTheme.js';
@import 'config.js';

.accordion {
    color: map-get($config, 'color'); // green
    font-size: map-get($config, 'font-size'); // 16px
    font-weight: map-get($config, 'font-weight'); // bold
}

.someThing {
    color: if(map-get($theme, 'someProperty'), 'pink', 'orange'); // orange
}
```

##### Using [`sass-resources-loader`](https://github.com/shakacode/sass-resources-loader)

> Checkout [`sass-resources-loader`](https://github.com/shakacode/sass-resources-loader) for sharing resources between Sass files using Webpack if you don't want to import your foundation and theme into every Sass file

#### Passing Foundation Theme Through Node

Instead of having to import the foundation theme into each file, you can instead pass the foundation object through Node.js where it will be picked up by `Synergy-Sass-Importer` - [learn more](https://github.com/One-Nexus/Synergy-Sass-Importer/wiki/Passing-Themes-to-Sass-Through-Node).

### Merge Values From Theme

In order to merge and overwrite configuration properties from a theme, the file which is imported and parsed by `Synergy-Sass-Importer` must have a parent directory whose name corresponds to an entry in the `modules` object of your theme ([learn more](https://github.com/One-Nexus/Synergy/wiki/Module-Configuration#theme-level-configuration)). Taking an `Accordion` module as an example:

###### someTheme.json

```js
{
    "someProperty": true,
    "modules": {
        "Accordion": {
            "color": "red"
        }
    }
}
```

...then the file to be imported into your Sass (and processed by Synergy-Sass-Importer) must have a parent directory called `Accordion` (the directory does not have to be a direct parent):

###### src/modules/Accordion/assets/config.js

```js
export default {
    color: 'blue',
    fizz: 'buzz'
}
```

The `modules.Accordion` object will be merged with the config object and made available to Sass under the `$config` variable (the name of the variable will epend on the name of the file that was imported, e.g. `$config` from `config.js`), and the theme object will be made available to Sass under the `$theme` variable:

###### src/modules/Accordion/assets/styles.scss

```scss
@import '../../../themes/myTheme.js';
@import 'config.js';

@debug map-get($config, 'color'); // 'red'
@debug map-get($config, 'fizz'); // 'buzz'
@debug map-get($theme, 'someProperty'); // true
```

---

<a href="https://twitter.com/ESR360">
    <img src="http://edmundreed.com/assets/images/twitter.gif?v=1" width="250px" />
</a>
<a href="https://github.com/ESR360">
    <img src="http://edmundreed.com/assets/images/github.gif?v=1" width="250px" />
</a>