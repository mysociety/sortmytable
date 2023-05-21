# SortMyTable

A JavaScript plugin for making HTML tables sortable, by clicking column headers, or calling a `.sort()` method.

- Vanilla JavaScript, no dependencies
- Supports modern browsers (see [browserlist.rc](./browserlist.rc))
- Pretty good accessibility (with heavy inspiration from [Adrian Roselli](https://adrianroselli.com/2021/04/sortable-table-columns.html))

## Limitations

- Will make a table sortable by _all_ columns – there is no way to mark some columns as unsortable
- Sorting will break if your table has colspans or rowspans
- Table cannot be sorted by more than one column at a time
- Does not support IE11 or below

## Using the plugin

A selection of versions of SortMyTable are included in the `dist` directory:

- [sortmytable.esm.js](dist/sortmytable.esm.js) – ESM (ES6) module
- [sortmytable.esm.min.js](dist/sortmytable.esm.min.js) – minified ESM (ES6) module
- [sortmytable.js](dist/sortmytable.js) – an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) for non-ESM workflows
- [sortmytable.min.js](dist/sortmytable.min.js) – minified [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)

If loading SortMyTable as an ESM (ES6) module, you need to either import it into an existing module:

    import { SortMyTable } from './path/to/sortmytable.esm.js'

Or load it directly in the page, with `type="module"`:

    <script src="path/to/sortmytable.esm.min.js" type="module"></script>

You will then be able to call `new SortMyTable()`, passing a CSS selector, HTMLElement, or NodeList, eg:

    var example1 = new SortMyTable( '.table' )
    var example2 = new SortMyTable( document.querySelector('#table') )
    var example3 = new SortMyTable( document.querySelectorAll('.table') )

And if loading SortMyTable as an IIFE…

    <script src="path/to/sortmytable.min.js"></script>

…You’ll find the `SortMyTable` class inside `SortMyTable.SortMyTable`:

    var example = new SortMyTable.SortMyTable( '.table' )

Note that SortMyTable does *not* include CSS styles – it’s up to you to decide how to style the elements that SortMyTable inserts into your tables. See [demo/demo.css](demo/demo.css) for an example of how we’ve integrated SortMyTable alongside Bootstrap.

## Tips

Check the `defaults` object in the `SortMyTable` class for a list of functions you can override each time you create a SortMyTable instance. For example…

### onSort

If you wanted to highlight all of the cells in the sorted column using CSS and a `<colgroup>`, you could provide a custom `onSort` callback which toggles a class on the relevant `<colgroup>` column:

    <table class="js-sortmytable">
        <colgroup>
            <col>
            <col>
            …
        </colgroup>
        …
    </table>
    <style>
        .js-sortmytable colgroup col.sorted { background: #fcc; }
    </style>
    <script>
        new SortMyTable('.js-sortmytable', { 
            onSort: function(tableElement, columnIndex, direction){
                tableElement.querySelector('colgroup .selected').removeClass('selected');
                tableElement.querySelector('colgroup').children[columnIndex].addClass('selected');
            }
        });
    </script>

### formatHeaderButton

SortMyTable adds an SVG containing up/down arrows to the header cell buttons, to act as both an indicator that the columns are sortable and a representation of the currently sort direction. Note that, to get these working, you’ll need to write your own styles (see [demo/demo.css](demo/demo.css) for an example).

If you want your arrows to look different, you could also supply your own custom `formatHeaderButton` function that inserts a different SVG—or something else entirely!—in the buttons.

Or, you could use `formatHeaderButton` to add an `aria-describedby` or `aria-label` attribute to the buttons, announcing the presence of the sortable column headers to non-visual users. (See [Adrian Roselli’s excellent article on sortable table columns](https://adrianroselli.com/2021/04/sortable-table-columns.html#ScreenReaders) for a few different ways you could do this.)

## Running the tests

`package.json` includes a static file server and test script. Install and run it with:

    npm install
    npm run test

Then visit <http://localhost:8080> to run the Jasmine tests in your browser.

Alternatively, you can poke around in the demo, at the same URL, with:

    npm install
    npm run start

## Linting

JavaScript in this project follows the [JS Standard](https://github.com/standard/standard). You can lint your JavaScript with:

    npm install
    npm run lint

And you can attempt to automatically fix errors with:

    npm intall
    npm run lint -- --fix

## Building

You can re-build to the `dist` directory with:

    npm install
    npm run build

Remember to update the `version` number in `package.json` before you build, if you want to release a new "version" of the plugin.
