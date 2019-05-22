<img height="56px" src="http://www.onenexus.io/synergy/github-logo.png" />

> Import JavaScript/JSON files into Sass

Synergy-Sass-Importer allows you to import JavaScript/JSON/json5 files into your Sass file. It was built for the [Synergy framework](https://github.com/One-Nexus/Synergy) but can be used with any projects that use Node.js and Sass. 

* [Setup](#setup)
* [Usage](#usage)

# Setup

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

Once your Sass compiler has been setup to use `Synergy-Sass-Importer`, you can begin to import JavaScript/JSON files in your `.scss` files. The purpose of `Synergy-Sass-Importer` is to provide [configuration](#todo) for [Synergy modules](#todo), but this essentially can be translated to "provide data to Sass components". This usage guide will assume you are using `Synergy-Sass-Importer` to provide configuration for some UI component that you are styling with Sass, with a rational of being able to share configuration between Sass and JavaScript.

## JavaScript

Using JavaScript to handle your component's configuration is the most flexible means to do it. It allows you to easily use framework-agnostic JavaScript-based themes within your project as well as allows for logic within your component's configuration. Configuration should be exported from its own file.

### File Exports an Object

If your JavaScript configuration file exports a plain JavaScript object, please see the [`JSON`](#json) section for static configuration where the same rules apply. If you require themeing or any sort of logic, consider [exporting a function](#file-exports-a-function) instead.

### File Exports a Function

This is the most flexible way to handle a UI component's configuration ([learn more](#TODO)). It allows you to use themes and easily share properties accross components. Simply export a function that takes an optional single parameter as the input. The parameter will expose the project's theme ([learn more](#todo)). The function should return an object. The object will be converted to a Sass map and attached to a `$config` variable which will be exposed to Sass.

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

Using JavaScript for configuration allows you to expose a theme to your configuration, allowing you to share properties between components. Your theme should exist as a separate JavaScript file which should export either an object or a function which returns an object. This object will be passed as the argument to your [component's configuration fucntion](#file-exports-a-function). 

If exporting a function in your theme's file, you can pass an optional `foundation` theme argument, should you wish to have a foundation theme on which to base your themes, to prevent common properties from having to be duplicated.

##### Setting Asset Paths

In order for your theme's to make their way into Sass, the Node.js environment will at some point need to know where the files are stored. The following options can be added to either [node's `global` object](https://nodejs.org/api/globals.html#globals_global) under the `Synergy` key (i.e `global.Synergy`), or a JSON file as either top-level keys, under an 'options' key, or under a 'Synergy' key (allowing you to use something like an existing `package.json` file) in order to help Node.js locate the relevent files:

<table class="table">
    <thead>
        <tr>
            <th>Option</th>
            <th>Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>[THEMES_PATH]</code></td>
            <td><code>'src/themes/'</code></td>
            <td>[Optional] The path to your themes directory (relative to the project root)</td>
        </tr>
        <tr>
            <td><code>[THEME_NAME]</code></td>
            <td><code>undefined</code></td>
            <td>[Optional] The name of the theme you are using when compiling</td>
        </tr>
        <tr>
            <td><code>[FOUNDATION_FILE]</code></td>
            <td><code>undefined</code></td>
            <td>[Optional] The path to a file (relative to the project root) which exports an object to act as your theme's foundation</td>
        </tr>
        <tr>
            <td><code><a href="#cast-config-to-sass">[CAST_CONFIG_TO_SASS]</a></code></td>
            <td><code>null</code></td>
            <td>[Optional] If <code>true</code>, all options will be output to the JSON file and available as variables in your Sass</td>
        </tr>
    </tbody>
</table>

The path to this JSON file should be passed to your CLI when executing whatever script compiles your Sass under the `Synergy` flag, e.g. `./myScript.js --Synergy='src/app.json'`(the path should be relative to the working directory from where the script is executed).

## JSON

JSON files are useful for static configuration, but if you require themeing or any sort of logic, consider using [JavaScript](#javascript) instead. 

It's important to note that upon importing a `.json` file into your `.scss` file, the top-level keys become available as variables:

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
    color: $foo;
    height: map-get($bar, 'qux');
}
```

###### Output

```css
.fizz {
    color: red;
    height: 10px;
}
```

A good way to organise JSON configuration files is to have a single top-level key called `config` which contains your module's configuration:

```js
{
    "config": {
        "name": "myModule",
        "color": "red",
        ...
    }
}
```

...which can then be accessed in your Sass like so:

```scss
@import 'config.json';

.fizz {
    color: map-get($config, 'color');
}
```