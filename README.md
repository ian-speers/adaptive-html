# AdaptiveHtml
HTML to Adaptive Card JSON converter library ([Demo editor](https://adaptive-editor.appspot.com))

The goal of this project is to allow integration with existing WYSIWYG editors such as [CKEditor](https://ckeditor.com/) and convert their HTML output to an [Adaptive Card](https://adaptivecards.io/).

Under the hood, this project has taken the [Turndown](https://github.com/domchristie/turndown/) code and repurposed it.

## Table of contents
- [Getting started](#getting-started)
- [API](#api)
- [Currently supported HTML tags](#currently-supported-html-tags)
- [Known caveats](#known-caveats)
- [Integrating with CKEditor](#integrating-with-ckeditor)
- [Building it yourself](#building-it-yourself)

## Getting started
You can either install the npm package, directly use a pre-built version of the library, or use a CDN.

### Via npm
`npm install adaptive-html`

### Using pre-built libraries
There are [pre-built versions of the library](https://github.com/rcasto/adaptive-html/tree/master/dist) for:
- Browser script (iife)
- CommonJS module environments (cjs)
- ES module environments (es)

#### Browser script
Available in both minified and unminified formats.
```html
<script src="/adaptive-html/dist/adaptive-html.iife.min.js"></script>
```

#### CommonJS
```javascript
var AdaptiveHtml = require('./adaptive-html/dist/adaptive-html.cjs');
```

#### ES
```javascript
import AdaptiveHtml from './adaptive-html/dist/adaptive-html.es';
```

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/adaptive-html/dist/adaptive-html.iife.min.js"></script>
```

## API
- toJSON(string | [HTMLElement](https://devdocs.io/dom/htmlelement)) => Adaptive Card JSON
    ```javascript
    var adaptiveCardJson = AdaptiveHtml.toJSON(`
        <p>Turn me into an Adaptive Card</p>
    `);
    console.log(JSON.stringify(adaptiveCardJson, null, '\t'));
    /*
        JSON returned

        {
            "type": "AdaptiveCard",
            "body": [
                {
                    "type": "TextBlock",
                    "text": "Turn me into an Adaptive Card",
                    "wrap": true
                }
            ],
            "actions": [],
            "version": "1.0"
        }
    */
    ```
- toHTML(object | string, object) => [HTMLElement](https://devdocs.io/dom/htmlelement)
    - Reconstructs headings (h1 - h6), removes empty nodes, and removes attributes from nodes on top of the standard JSON to HTML conversion done by the adaptivecards library
    - The second parameter is optional, but allows you to pass in a few options:
        - **processMarkdown** (function|boolean) - A function accepting a string parameter and returning a string.  Will be called for each [TextBlock](http://adaptivecards.io/explorer/TextBlock.html) to process it's text and is expected to output compiled markdown or the text itself if no markdown is present
            - Default value is `true` (will utilize standard process markdown function of adaptivecards library)
        - **processNode** (function|boolean|object) - A function accepting an [HTMLElement](https://devdocs.io/dom/htmlelement) representing the current node being processed as the first parameter, another HTMLElement representing the card root as the second parameter, and the options object itself as the third parameter. It is not expected to return anything.  Will be called for each element in the HTML output from the adaptivecards library.  Allows you to manipulate the HTML output if desired.  Will override the default HTML transformations done
            - Default value:
            ```json
            {
                "removeEmptyNodes": true,
                "reconstructHeadings": true,
                "removeAttributes": true
            }
            ```
            - options object values:
                - removeEmptyNodes (boolean) - whether or not to remove empty nodes in card html output
                - reconstructHeadings (boolean) - whether or not to attempt to reconstruct headings from card html output
                - removeAttributes (boolean|array) - whether or not to remove attributes or not.  Can also pass a custom attribute white list as an array of attribute names to apply
                    - Default attribute whitelist ['start', 'src', 'href', 'alt']
        - **hostConfig** (object) - An object specifying a [HostConfig](https://docs.microsoft.com/en-us/adaptive-cards/display/hostconfig) you desire to use when converting the Adaptive Card JSON to HTML
            - Default value:
            ```json
            {
                "fontSizes": {
                    "small": 12,
                    "default": 14,
                    "medium": 17,
                    "large": 21,
                    "extraLarge": 26
                },
                "fontWeights": {
                    "lighter": 200,
                    "default": 400,
                    "bolder": 600
                }
            }
            ```
            - When this option is set, the whitelisted attributes for removeAttributes is automatically updated to allow the style and class attributes through
    - **Note**: If you want to use this method, you must also include the [AdaptiveCards for Javascript library](https://docs.microsoft.com/en-us/adaptive-cards/display/libraries/htmlclient)
    ```javascript
    var adaptiveHtmlOptions = {
        processNode: {
            reconstructHeadings: false
        },
        hostConfig: { 
            fontSizes: {
                small: 14,
                default: 17,
                medium: 20,
                large: 24,
                extraLarge: 28
            }
        }
    };
    var adaptiveCardElem = AdaptiveHtml.toHTML({
            "type": "AdaptiveCard",
            "body": [
                {
                    "type": "TextBlock",
                    "text": "Turn me into an Adaptive Card",
                    "wrap": true,
                    "weight:": "bolder",
                    "size": "extraLarge"
                }
            ],
            "actions": [],
            "version": "1.0"
        }, adaptiveHtmlOptions);
    console.log(adaptiveCardElem.outerHTML);
    /*
        HTML returned

        <div class="ac-container" tabindex="0" style="display: flex; flex-direction: column; justify-content: flex-start; box-sizing: border-box; flex: 0 0 auto; padding: 15px;">
            <div style="overflow: hidden; font-family: &quot;Segoe UI&quot;, Segoe, &quot;Segoe WP&quot;, &quot;Helvetica Neue&quot;, Helvetica, sans-serif; text-align: left; font-size: 28px; line-height: 37.24px; color: rgb(0, 0, 0); font-weight: 400; word-wrap: break-word; box-sizing: border-box; flex: 0 0 auto;">
                Turn me into an Adaptive Card
            </div>
        </div>
    */
    ```

## Currently supported HTML tags
- p
- br
- h1, h2, h3, h4, h5, h6
- ul, ol
- li
- a
- em, i
- strong, b
- img

The default replacement for tags not listed above depends on whether the tag refers to a [block](https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements#Elements) or [inline](https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements#Elements) level HTML element.

For block level elements, its contents are processed, and wrapped in a [Container](https://adaptivecards.io/explorer/Container.html).  
For inline level elements, its contents are processed and simply returned.

## Known caveats
- Images in list steps and nested steps are pushed to the bottom of the corresponding list step
- Lists cannot contain headings

## Integrating with CKEditor
If you wish to integrate this with CKEditor it should for the most part work out of the box.  However, if you are utilizing the toHTML(object | string) function to take an Adaptive Card JSON and prepopulate the CKEditor instance then you will need [one extra configuration setting](https://docs.ckeditor.com/ckeditor4/latest/api/CKEDITOR_config.html#cfg-extraAllowedContent).
```javascript
var editorConfig = {
    ...,
    extraAllowedContent: 'ol[start]'
}
```
The reason this is necessary is such that ordered lists are reconstructed with the correct starting index.

## Building it yourself
If you wish to build the library yourself then you can follow these steps:  
1. Clone or download the [repository](https://github.com/rcasto/adaptive-html)
2. `cd` to the repository directory via the command line/terminal
3. Run `npm install` to install the necessary dependencies 
    - Note: Make sure you have [Node.js](https://nodejs.org/en/) installed
4. Hack away
5. Execute the command `npm run build`
6. You should now be able to view the built libraries under the `dist/` folder within your copy of the repository

### Test Client
To demonstrate the transformation there is a test client within the repository. To launch it follow these steps:
1. Execute the command `cd client && npm install && cd ..`
    - This will install the test client dependencies and return to repository root
2. Execute the command `npm start`
3. Navigate to http://localhost:3000

### Running tests
You can run tests by executing the command `npm test`.

If you want to generate a code coverage report execute the command `npm run test:report`.  Launch `coverage/index.html` in the browser to view the report.