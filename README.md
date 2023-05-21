# SortMyTable

A JavaScript plugin for making HTML tables sortable, by clicking column headers, or calling a `.sort()` method.

- Vanilla JavaScript, no dependencies
- Supports modern browsers (see [browserlist.rc](./browserlist.rc))
- Pretty good accessibility (with heavy inspiration from [Adrian Roselli](https://adrianroselli.com/2021/04/sortable-table-columns.html))

## Limitations

- Only supports ESM workflows ([…for now](https://rollupjs.org/))
- No minification ([…for now](https://terser.org/))
- Will make a table sortable by _all_ columns – there is no way to mark some columns as unsortable
- Sorting will break if your table has colspans or rowspans
- Table cannot be sorted by more than one column at a time
- Does not support IE11 or below

## Using the plugin

SortMyTable currently only supports loading as an ESM (ES6) module. You can include it like so:

    <script src="path/to/sortmytable.esm.js" type="module"></script>

Then call `new SortMyTable()`, passing a CSS selector, HTMLElement, or NodeList, eg:

    var example1 = new SortMyTable( '.table' )
    var example2 = new SortMyTable( document.querySelector('#table') )
    var example3 = new SortMyTable( document.querySelectorAll('.table') )

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

To run the tests, [start a HTTP server](https://gist.github.com/willurd/5720255) in the top level directory, eg:

    python3 -m http.server 8000

And then open the test page in your browser, eg:

    chrome http://localhost:8000/test/jasmine/SpecRunner.html
