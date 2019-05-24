import _ from 'lodash';
import isThere from 'is-there';
import sass from 'node-sass';
import path, { resolve, basename, extname } from 'path';
import deepExtend from 'deep-extend';

import 'json5/lib/register'; // Enable JSON5 support

/**
 * 
 * @param {*} url 
 * @param {*} prev 
 */
export default function(url, prev) {
    if (!isJSONfile(url)) {
        return null;
    }

    var Synergy = global.Synergy || {};

    let includePaths = this.options.includePaths ? this.options.includePaths.split(path.delimiter) : [];
    let paths = [].concat(prev.slice(0, prev.lastIndexOf('/'))).concat(includePaths);
    let fileName = paths.map(path => resolve(path, url)).filter(isThere).pop();

    if (!fileName) {
        return new Error(`Unable to find "${url}" from the following path(s): ${paths.join(', ')}. Check includePaths.`);
    }

    // Prevent file from being cached by Node's `require` on continuous builds.
    // https://github.com/Updater/node-sass-json-importer/issues/21
    delete require.cache[require.resolve(fileName)];

    try {
        const extensionlessFilename = basename(fileName, extname(fileName));

        let data = require(fileName);
        if (data.default) data = data.default;

        let theme = {};

        if (typeof data === 'function') {
            theme = deepExtend(Synergy.THEME || {}, Synergy.CONFIG && Synergy.CONFIG.theme);
            const MODULE_NAME = Object.keys(theme.modules).filter(key => fileName.indexOf(key) > -1)[0];
            data = deepExtend(data(theme), theme.modules[MODULE_NAME]);
        }

        if (data.config) data = data.config;

        if (Array.isArray(data)) data = { [extensionlessFilename]: data };

        return {
            contents: transformJSONtoSass({
                config: evalConfig(data),
                theme: theme,
                ...(Synergy.CAST_TO_SASS)
            }),
        }
    }
    catch(error) {
        return new Error(`node-sass-json-importer: Error transforming JSON/JSON5 to SASS. Check if your JSON/JSON5 parses correctly. ${error}`);
    }
}

/**
 * Evaluate module config properties
 * @param {*} config 
 */
function evalConfig(config) {
    if (!config) return;

    Object.entries(config).forEach(([key, value]) => {
        if (typeof value === 'object') {
            return evalConfig(value);
        } else {
            if (typeof value !== 'function') return;

            return config[key] = value();
        }
    });

    return config;
}

/**
 * @param {*} url 
 */
export function isJSONfile(url) {
    return (/\.(js)(on(5)?|s)?$/.test(url));
}

/**
 * @param {*} json 
 */
export function transformJSONtoSass(json) {
    return Object.keys(json).filter(key => isValidKey(key)).filter(key => json[key] !== '#').map(key => {
        return `$${key}: ${parseValue(json[key])};`
    }).join('\n');
}

/**
 * @param {*} key 
 */
export function isValidKey(key) {
    return /^[^$@:].*/.test(key);
}

/**
 * @param {*} value 
 */
export function parseValue(value) {
    if (typeof value === 'function') {
        return '"[function]"'
    }
    if (_.isArray(value)) {
        return parseList(value);
    }
    else if (_.isPlainObject(value)) {
        return parseMap(value);
    }
    else if (valueShouldBeStringified(value)) {
        return `"${value}"`;
    }
    else {
        return value;
    }
}

/**
 * @param {*} list 
 */
export function parseList(list) {
    return `(${list.map(value => parseValue(value)).join(',')})`;
}

/**
 * @param {*} map 
 */
export function parseMap(map) {
    const keys = Object.keys(map).map(key => {
        try {
            sass.renderSync({
                data: `$foo: (${key}: 'value');`
            });

            return key;
        } 
        catch(error) {
            return `"${key}"`;
        }
    });

    return `(${keys.filter(key => isValidKey(key)).map(key => {
        return `${key}: ${parseValue(map[key.replace(/"/g,"")])}`;
    }).join(',')})`;
}

/**
 * @param {*} value 
 */
export function valueShouldBeStringified(value) {
    try {
        sass.renderSync({
            data: `$foo: (key: ${value});`
        });

        return false;
    } 
    catch(error) {
        return true
    }
}

// Super-hacky: Override Babel's transpiled export to provide both
// a default CommonJS export and named exports.
// Fixes: https://github.com/Updater/node-sass-json-importer/issues/32
// TODO: Remove in 3.0.0. Upgrade to Babel6.
module.exports = exports.default;
Object.keys(exports).forEach(key => module.exports[key] = exports[key]);