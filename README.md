# Neutrino Svelte preset

[![npm](https://img.shields.io/npm/v/neutrino-preset-svelte.svg)](https://www.npmjs.com/package/neutrino-preset-svelte)
[![npm](https://img.shields.io/npm/dt/neutrino-preset-svelte.svg)](https://www.npmjs.com/package/neutrino-preset-svelte)
[![Greenkeeper badge](https://badges.greenkeeper.io/constgen/neutrino-preset-svelte.svg)](https://greenkeeper.io/)

`neutrino-preset-svelte` is a [Neutrino](https://neutrino.js.org) preset for creation of [Svelte](https://svelte.technology) applications for web platforms.

## Features

- Zero upfront configuration necessary to start developing and building a Svelte web app
- Modern Babel compilation supporting ES modules, last several major browser versions, async functions, dynamic imports, ES class properties, rest spread operators and automatic polyfills bound to platforms
- Webpack loaders for importing HTML Svelte components, CSS, images, icons, and fonts
- ESlint integration in Svelte components `<script>` tags
- Webpack Dev Server during development on "localhost" and local network IP for external devices access
- Automatic creation of HTML pages, no templating of "index.html" necessary
- Hot reloading support
- Tree-shaking to create smaller bundles
- Production-optimized bundles with Babili minification, source maps and easy chunking
- Extensible to customize your project as needed

## Requirements

- Node.js v6.9+
- Neutrino v6

## Installation

`neutrino-preset-svelte` can be installed from NPM. Make sure `neutrino`, and `neutrino-preset-svelte` are development dependencies in your project. `svelte` is installed as an internal dependency of `neutrino-preset-svelte`

```
❯ npm install --save-dev neutrino neutrino-preset-svelte
```

## Project Layout

`neutrino-preset-svelte` follows the standard [project layout](https://neutrino.js.org/project-layout) specified by Neutrino. This means that by default all project source code should live in a directory named `src` in the root of the project. This includes JavaScript files, CSS stylesheets, images, and any other assets that would be available to your compiled project. Only files explicitly imported or lazy loaded to your project will be bundled.

## Quickstart

After installing Neutrino and the Svelte preset, add a new directory named `src` in the root of the project, with a single JS file named `index.js` in it. You can mound you application to the document `<body>`. Edit your `src/index.js` file with the following:

```js
import Main from './main.html'
import './common.css'

new Main({
  target: document.body
})
```

You can change this code base to better match your needs.

Now edit your project's `package.json` to add commands for starting and building the application:

```json
{
  "scripts": {
    "start": "neutrino start",
    "build": "neutrino build"
  }
}
```
And add the new file `.neutrinorc.js` in the root of the project:

```js
module.exports = {
  use: [
    'neutrino-preset-svelte'
  ]
}
```

Start the app. 

```
❯ npm start
✔ Development server running on: http://0.0.0.0:5000
✔ Build completed
```

The console shows that application started at "http://0.0.0.0:5000". This is a way how `webpack-dev-server` starts in both "localhost:5000" and local network IP address (e.g. "http://192.168.1.100:5000"). External IP may be useful for mobile development. The preset tries to automatically start (if not disabled in [custom options](#preset-options)) a browser with the URL of the server IP address (if not changed in [custom options](#preset-options)).

## Building

`neutrino-preset-svelte` builds static assets to the `build` directory by default when running `neutrino build`. 

```
❯ npm run build
```

You can either serve or deploy the contents of this build directory as a static site.

## Static assets

If you wish to copy files to the build directory that are not imported from application code, you can place them in a directory within `src` called `static`. All files in this directory will be copied from `src/static` to `build/static`.

## Hot Reloading

`neutrino-preset-svelte` supports Hot Reloading of files that was changed. Hot Module Replacement is supported only in CSS files. This means that changing of CSS will rerender only a part of styles, and changing of the rest of modules will reload the page.

<!--Using dynamic imports with `import()` will automatically create split points and hot replace those modules upon modification during development.-->

## Preset options

You can provide custom options and have them merged with this preset's default options to easily affect how this
preset builds. You can modify the preset settings from `.neutrinorc.js` by overriding with an options object. Use
an array pair instead of a string to supply these options in `.neutrinorc.js`.

The following shows how you can pass an options object to the preset and override its options, showing the defaults:

**.neutrinorc.js**
```js
module.exports = {
  use: [
    ['neutrino-preset-svelte', {
      // options related to generating the HTML document
      html: {
        title: `${name} ${version}`,
        filename: 'index.html',
        template: path.resolve(__dirname, 'template.ejs'),
        inject: 'head',
        mobile: true,
        minify: {
          collapseWhitespace: true, 
          preserveLineBreaks: true
        }
      },

      // options related to a development server
      server: {
        https: false,
        public: true,
        port: 5000,
        open: true,
        contentBase: neutrino.options.source
      },

      // supported browsers in a Browser List format
      browsers: [
        'last 3 chrome versions',
        'last 3 firefox versions',
        'last 3 edge versions',
        'last 3 opera versions',
        'last 3 safari versions',
        'last 1 ie version',
        'last 1 ie_mob version',
        'last 1 blackberry version',
        'last 3 and_chr versions',
        'last 3 and_ff versions',
        'last 3 op_mob versions',
        'last 2 op_mini versions',
        'ios >= 8',
        'android >= 4'
      ]
    }]
  ]
};
```

*Example: Enable HTTPS, disable auto-opening of a browser, change the page title, define supported browsers:*

**.neutrinorc.js**
```js
module.exports = {
  use: [
    ['neutrino-preset-svelte', {
      // Example: disable Hot Module Replacement
      server: {
        https: true,
        open: false
      },

      // Example: change the page title
      html: {
        title: 'Svelte App'
      },

      // Example: change supported browsers
      browsers: [
        'last 3 versions'
      ]
    }]
  ]
};
```

## Customizing

Consumers may provide their custom configurations for different parts of the current preset that will override its defaults. Also if you want to construct your own preset based on `neutrino-preset-svelte` you can use information below.

To override the build configuration, start with the documentation on [customization](https://neutrino.js.org/customization). `neutrino-preset-svelte` creates some conventions to make overriding the configuration easier once you are ready to make changes.

### Entry points

By default the Svelte preset creates these entry points to your application:

- `polyfill`: contains platform polyfills according to the chosen browsers in the Browser List.
- `index`: maps to the `index.js` file in the src directory. This value is provided by `neutrino.options.entry`.

### Rules

The following is a list of rules and their identifiers which can be overridden:

- `compile`: Compiles JS files from the src directory using Babel. Contains a single loader named `babel`;
- `svelte`: Compiles Svelte components to JavaScript modules. Contains a single loader named the same `svelte`;
- `style`: Allows importing CSS stylesheets from modules. Contains two loaders named `style` and `css`;
- `img`, `svg`, `ico`: Allows import image files from modules. Each contains a single loader named `url`;
- `woff`, `ttf`: Allows importing WOFF and TTF font files from modules. Each contains a single loader named `url`;
- `eot`: Allows importing EOT font files from modules. Contains a single loader named `file`.

### Plugins

The following is a list of plugins and their identifiers which can be overridden:

- `env`: Injects the value of NODE_ENV into the application as process.env.NODE_ENV;
- `html`: Creates HTML files when building. Has various options that can be configured via package.json;
- `html-defer`: Adds `defer` attribute to `<script>` tags in HTML files when building;
- `chunk`: Defines chunks for manifest and vendor entry points. Can be configured via package.json;
- `hot`: Enables hot module reloading;
- `clean`: Clears the contents of build prior to creating a production bundle;
- `copy`: Copies files during build, defaults from `src/static` to `build/static`.
<!--- `progress`: Displays a progress bar when using neutrino build.-->

### Override configuration

By following the [customization guide](https://neutrino.js.org/customization) and knowing the rule, loader, and plugin IDs above,
you can override and augment the build by providing a function to your `.neutrinorc.js` use array. You can also
make these changes from the Neutrino API in custom middleware.

#### Vendoring

By defining an entry point named `vendor` you can split out external dependencies into a chunk separate
from your application code.

_Example: Put lodash into a separate "vendor" chunk:_

**.neutrinorc.js**
```js
module.exports = {
  use: [
    'neutrino-preset-svelte',
    neutrino => neutrino.config.entry('vendor').add('lodash')
  ]
}
```