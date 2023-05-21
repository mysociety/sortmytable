/** SortMyTable 1.0.0 @license https://github.com/mysociety/sortmytable */
var SortMyTable = (function (exports) {
  'use strict';

  class SortMyTable {
    static defaults = {
      /**
       * You can override this function to customise the button that SortMyTable constructs inside each sortable header cell. If a button was already provided in the cell, before SortMyTable was initialised, then that button element is passed straight to this function. Otherwise, SortMyTable wraps the content of the cell in a button, and that button is passed to this function.
       * @param {HTMLElement} button - The button element in the table header cell.
       */
      formatHeaderButton: function (button) {
        button.setAttribute('type', 'button');
        button.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 16" width="32" height="16" focusable="false" aria-hidden="true"><path class="up" d="M8.16 3.33a1 1 0 0 1 1.68 0l5.18 8.13a1 1 0 0 1-.84 1.54H3.82a1 1 0 0 1-.84-1.54l5.18-8.13Z"/><path class="down" d="M23.84 12.67a1 1 0 0 1-1.68 0l-5.18-8.13A1 1 0 0 1 17.82 3h10.36a1 1 0 0 1 .84 1.54l-5.18 8.13Z"/></svg>');
      },
      /**
       * You can override this function to customise how SortMyTable finds the table header cells.
       * @param {HTMLElement} tableElement - This function is passed the table element, so you can select and return a NodeList of table header cells from within it.
       * @returns {NodeList} Table header elements.
       */
      getSortableHeaders: function (tableElement) {
        return tableElement.querySelectorAll('thead th')
      },
      /**
       * You can override this function to customise how SortMyTable finds the table rows to be sorted. You will likely want to keep using this.getSortedRowsContainer() as part of your solution, to ensure sortable rows stay inside the intended parent element.
       * @param {HTMLElement} tableElement - This function is passed the table element, so you can select and return a NodeList of table rows from within it.
       * @returns {NodeList} Table row elements.
       */
      getSortableRows: function (tableElement) {
        return this.getSortedRowsContainer(tableElement).querySelectorAll('tr')
      },
      /**
       * You can override this function to customise how SortMyTable extracts a sortable value from the given table cell. By default, first, it looks for a data-sortable-value attribute, and if that’s not found, it uses the element’s textContent instead. Then it casts numeric values to a proper Number, returning everything else as a String.
       * @param {HTMLElement} cellElement - The cell from which to interpret a value.
       * @returns {(string|number)} The intepreted value of the cell.
       */
      getSortableValue: function (cellElement) {
        let value;

        if (typeof cellElement.dataset.sortableValue !== 'undefined') {
          value = cellElement.dataset.sortableValue;
        } else {
          value = cellElement.textContent;
        }

        if (value === '' || value === null || typeof value === 'undefined') {
          return ''
        } else if (!Number.isNaN(Number(value))) {
          return Number(value)
        } else {
          return String(value)
        }
      },
      /**
       * You can override this function to customise where sorted rows should go. This is most likely to be either the tableElement itself, or a `tbody` inside it.
       * @param {HTMLElement} tableElement - This function is passed the table element, so you can select and return a NodeList of table rows from within it.
       * @returns {HTMLElement} Parent element for sorted rows.
       */
      getSortedRowsContainer: function (tableElement) {
        return tableElement.querySelector('tbody')
      },
      /**
       * You can override this function to run custom code after the table is sorted.
       * @param {HTMLElement} tableElement - The table element.
       * @param {number} [columnIndex] - The index of the currently sorted column (or undefined, if the table has been returned to an "unsorted" state).
       * @param {string} [direction] - The current sort direction (or undefined, if the table has been returned to an "unsorted" state).
       */
      onSort: function (tableElement, columnIndex, direction) { }
    }

    /**
     * Make one or more tables sortable.
     * @param {(HTMLElement | NodeList | object | string)} subject - An element, array/NodeList of elements, jQuery object, or CSS selector, defining the table(s) that should be made sortable. If subject refers to multiple table elements, an array of the resulting SortMyTable instances will be made available in the SortMyTable().instances property.
     * @param {number} options - Optional settings, to override SortMyTable.defaults.
     */
    constructor (subject, options) {
      // Re-bind class methods so they have access to the instance via `this`.
      this.init = this.init.bind(this);
      this.createHeaderButtons = this.createHeaderButtons.bind(this);
      this.storeInitialSortOrder = this.storeInitialSortOrder.bind(this);
      this.sort = this.sort.bind(this);

      this.settings = Object.assign({}, SortMyTable.defaults, options);

      // Assume string argument is a CSS selector,
      // and attempt to create a NodeList from it.
      if (typeof subject === 'string') {
        subject = document.querySelectorAll(subject);
      }

      // eslint-disable-next-line no-prototype-builtins
      if (NodeList.prototype.isPrototypeOf(subject)) {
        if (subject.length === 1) {
          return this.init(subject[0])
        } else {
          this.instances = Array.from(subject).map(function (el) {
            return new SortMyTable(el, options)
          });
        }
      } else if (isHTMLElement(subject)) {
        return this.init(subject)
      } else if (typeof subject === 'object' && 'jquery' in subject) {
        if (subject.length === 1) {
          return this.init(subject[0])
        } else {
          this.instances = subject.get().map(function (el) {
            return new SortMyTable(el, options)
          });
        }
      }
    }

    /**
     * Make a table sortable.
     * @param {HTMLElement} tableElement - Table element that should be made sortable.
     * @returns {SortMyTable} The SortMyTable instance.
     */
    init (tableElement) {
      // Prevent elements from being processed multiple times.
      if (tableElement.sortmytable) {
        return tableElement.sortmytable
      }
      tableElement.sortmytable = this;

      // Store tableElement in class instance, for easy access from now on.
      this.tableElement = tableElement;

      this.storeInitialSortOrder();
      this.createHeaderButtons();

      return this
    }

    createHeaderButtons () {
      const _this = this;

      _this.settings.getSortableHeaders(_this.tableElement).forEach(function (thElement, i) {
        let button = $('button', thElement)[0];
        if (typeof button === 'undefined') {
          wrapInner(thElement, 'button');
          button = $('button', thElement)[0];
        }

        _this.settings.formatHeaderButton(button);

        button.addEventListener('click', function () {
          const currentSort = thElement.getAttribute('aria-sort');

          if (currentSort === null) {
            _this.sort(thElement, 'ascending');
          } else if (currentSort === 'ascending') {
            _this.sort(thElement, 'descending');
          } else if (currentSort === 'descending') {
            _this.sort();
          }
        });
      });
    }

    storeInitialSortOrder () {
      const sortableHeaders = this.settings.getSortableHeaders(this.tableElement);
      const initialSortColumn = filter(sortableHeaders, '[aria-sort]');

      if (initialSortColumn.length === 1) {
        this.initialSortColumn = initialSortColumn[0];
        this.initialSortDirection = initialSortColumn[0].getAttribute('aria-sort');
      } else {
        this.settings.getSortableRows(this.tableElement).forEach(function (rowElement, i) {
          rowElement.dataset.initialSortIndex = i;
        });
      }
    }

    /**
     * Sort the table by the given column, in the given direction. If this function is called without any arguments, the table will be returned to its initial sort order.
     * @param {(HTMLElement|number)} [column] - A table cell (as a HTMLElement) or column index (as a number, 0 being the first column) by which to sort the table. If no column is provided, the table will be returned to its initial sort order.
     * @param {string} [direction] - If a column is provided, the direction must be either "ascending" or "descending".
     */
    sort (column, direction) {
      const _this = this;

      // TODO: Announce sorting via live region? https://adrianroselli.com/2021/04/sortable-table-columns.html

      if (typeof column === 'undefined') {
        if (typeof _this.initialSortColumn !== 'undefined' && typeof _this.initialSortDirection !== 'undefined') {
          _this.sort(_this.initialSortColumn, _this.initialSortDirection);
        } else {
          const rows = Array.from(
            _this.settings.getSortableRows(_this.tableElement)
          ).sort(function (rowA, rowB) {
            return rowA.dataset.initialSortIndex - rowB.dataset.initialSortIndex
          });
          rows.forEach(function (row) {
            _this.settings.getSortedRowsContainer(_this.tableElement).appendChild(row);
          });

          _this.settings.getSortableHeaders(_this.tableElement).forEach(function (thElement, i) {
            thElement.removeAttribute('aria-sort');
          });

          _this.settings.onSort(_this.tableElement);
        }
      } else if (isHTMLElement(column) && _this.tableElement.contains(column)) {
        _this.sort(prevAll(column).length, direction);
      } else if (isNumeric(column)) {
        let rows = Array.from(
          _this.settings.getSortableRows(_this.tableElement)
        ).sort(function (rowA, rowB) {
          const valA = _this.settings.getSortableValue(rowA.children[column]);
          const valB = _this.settings.getSortableValue(rowB.children[column]);
          if (isNumeric(valA) && isNumeric(valB)) {
            return valA - valB
          } else {
            return valA.toString().localeCompare(valB)
          }
        });
        if (direction === 'descending') {
          rows = rows.reverse();
        }
        rows.forEach(function (row) {
          _this.settings.getSortedRowsContainer(_this.tableElement).appendChild(row);
        });

        _this.settings.getSortableHeaders(_this.tableElement).forEach(function (thElement, i) {
          if (i === column) {
            thElement.setAttribute('aria-sort', direction);
          } else {
            thElement.removeAttribute('aria-sort');
          }
        });

        _this.settings.onSort(_this.tableElement, column, direction);
      }
    }
  }

  /**
   * Select elements matching the given CSS selector, from either the document (default) or the supplied context element.
   * @param {string} selector - CSS selector to search for.
   * @param {Document|HTMLElement} [context=document] - Optional HTMLElement to search for matches within.
   * @returns {NodeList} Elements matching the given CSS selector.
   */
  const $ = function (selector, context = document) {
    return context.querySelectorAll(selector)
  };

  /**
   * Return whether the given thing is an HTMLElement.
   * @param {*} thing - Thing that may or may not be a HTMLElement.
   * @returns {boolean} Whether the thing is a HTMLElement.
   */
  const isHTMLElement = function (thing) {
    // eslint-disable-next-line no-prototype-builtins
    return Node.prototype.isPrototypeOf(thing)
  };

  /**
   * Return whether the given thing is a number or not.
   * @param {*} thing - Thing that may or may not be a number.
   * @returns {boolean} Whether the thing is a number.
   */
  const isNumeric = function (thing) {
    return typeof thing === 'number'
  };

  /**
   * Get all previous siblings of the given element.
   * @param {HTMLElement} element - Element to get previous siblings of.
   * @returns {HTMLElement[]} Array of previous siblings.
   */
  const prevAll = function (element) {
    const result = [];
    // https://eslint.org/docs/latest/rules/no-cond-assign
    while ((element = element.previousElementSibling)) {
      result.push(element);
    }
    return result
  };

  /**
   * Narrow down the provided NodeList to include only elements which match the given CSS selector. Note this returns an Array, not a NodeList.
   * @param {NodeList} elements - Elements to filter.
   * @param {string} selector - CSS selector to filter the elements by.
   * @returns {HTMLElement[]} Array of elements which matched the CSS selector.
   */
  const filter = function filter (elements, selector) {
    return Array.from(elements).filter(function (el) {
      return el.matches(selector)
    })
  };

  /**
   * Wrap a new element around the contents of a given element.
   * @param {HTMLElement} parent - HTMLElement whose contents will be wrapped in a new wrapper element.
   * @param {(string|HTMLElement)} [wrapper="div"] - Optional element (or element name) to wrap the contents with, defaults to "div".
   * @returns {HTMLElement} Parent element.
   */
  const wrapInner = function wrapInner (parent, wrapper = 'div') {
    if (typeof wrapper === 'string') {
      wrapper = document.createElement(wrapper);
    }
    parent.appendChild(wrapper);
    while (parent.firstChild !== wrapper) {
      wrapper.appendChild(parent.firstChild);
    }
    return parent
  };

  exports.SortMyTable = SortMyTable;

  return exports;

})({});
