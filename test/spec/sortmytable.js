/* eslint-disable no-new */

import { SortMyTable } from '../src/sortmytable.esm.js'

// https://jasmine.github.io/api/5.0/matchers.html

const create = function (elementName, attributes = {}, parentElement = undefined) {
  const el = document.createElement(elementName)
  for (const key in attributes) {
    el.setAttribute(key, attributes[key])
  }
  if (parentElement) {
    parentElement.appendChild(el)
  }
  return el
}

const createTable = function (data, attributes = {}, parentElement = undefined) {
  const table = create('table', attributes, parentElement)
  const thead = create('thead', {}, table)
  const tbody = create('tbody', {}, table)

  const tr = create('tr', {}, thead)
  data.cols.forEach(function (col) {
    const th = create('th', col.attributes, tr)
    th.innerHTML = col.html
  })

  data.rows.forEach(function (row) {
    const tr = create('tr', {}, tbody)
    row.forEach(function (cell) {
      const td = create('td', cell.attributes, tr)
      td.innerHTML = cell.html
    })
  })

  return table
}

const getColumnCellValues = function (table, colIndex) {
  return Array.from(table.querySelectorAll('tbody tr')).map(function (tr) {
    return tr.children[colIndex].textContent
  })
}

const simpleTable = {
  cols: [
    { html: 'A' },
    { html: 'B' }
  ],
  rows: [
    [{ html: 'A1' }, { html: 'B1' }],
    [{ html: 'A2' }, { html: 'B2' }]
  ]
}

const leaderboardTable = {
  cols: [
    { html: 'Name', attributes: { id: 'col0', 'aria-sort': 'ascending' } },
    { html: 'Score', attributes: { id: 'col1' } },
    { html: 'Joined', attributes: { id: 'col2' } },
    { html: 'Notes', attributes: { id: 'col3' } }
  ],
  rows: [
    [
      { html: 'Alice' },
      { html: '55' },
      { html: '9th Feb 2023', attributes: { 'data-sortable-value': '1676764800' } },
      { html: '' }
    ],
    [
      { html: 'Bob' },
      { html: '35' },
      { html: '5th Mar 2023', attributes: { 'data-sortable-value': '1677801600' } },
      { html: 'Special achievement badge' }
    ],
    [
      { html: 'Carol' },
      { html: '110' },
      { html: '1st Jan 2023', attributes: { 'data-sortable-value': '1672531200' } },
      { html: '' }
    ],
    [
      { html: 'David' },
      { html: '80' },
      { html: '21st Feb 2023', attributes: { 'data-sortable-value': '1676937600' } },
      { html: 'Fastest riser award' }
    ]
  ]
}

const colourTable = {
  cols: [
    { html: 'Colour', attributes: { id: 'col0' } },
    { html: 'Depth', attributes: { id: 'col1' } }
  ],
  rows: [
    [{ html: 'Red' }, { html: '20' }],
    [{ html: 'Blue' }, { html: '100' }],
    [{ html: 'Green' }, { html: '90' }],
    [{ html: 'Yellow' }, { html: '60' }]
  ]
}

describe('when SortMyTable() is called multiple times on the same element', function () {
  beforeEach(function () {
    this.table = createTable(simpleTable, { id: 'simpleTable' }, document.body)
  })

  afterEach(function () {
    this.table.remove()
  })

  it('the original instance should be returned each time', function () {
    const el = document.querySelector('#simpleTable')
    expect(el.sortmytable).not.toBeDefined()
    const s1 = new SortMyTable(el)
    expect(el.sortmytable).toBeDefined()
    const s2 = new SortMyTable(el)
    expect(s2).toBe(s1)
  })
})

describe('new SortMyTable()', function () {
  beforeEach(function () {
    this.table1 = createTable(simpleTable, { id: 'simpleTable1', class: 'simpleTable' }, document.body)
    this.table2 = createTable(simpleTable, { id: 'simpleTable2', class: 'simpleTable' }, document.body)
  })

  afterEach(function () {
    this.table1.remove()
    this.table2.remove()
  })

  it('should accept a HTMLElement', function () {
    const el = document.querySelector('#simpleTable1')
    expect(el.sortmytable).not.toBeDefined()
    new SortMyTable(el)
    expect(el.sortmytable).toBeDefined()
  })

  it('should accept a NodeList (creating an instance for each element in the NodeList)', function () {
    const nodelist = document.querySelectorAll('.simpleTable')
    expect(nodelist[0].sortmytable).not.toBeDefined()
    expect(nodelist[1].sortmytable).not.toBeDefined()

    new SortMyTable(nodelist)
    expect(nodelist[0].sortmytable).toBeDefined()
    expect(nodelist[1].sortmytable).toBeDefined()

    expect(nodelist[0].sortmytable).not.toBe(nodelist[1].sortmytable)
  })

  it('should accept a CSS selector as a string (creating an instance for each matching element)', function () {
    const selector = '.simpleTable'
    new SortMyTable(selector)
    expect(this.table1.sortmytable).toBeDefined()
    expect(this.table2.sortmytable).toBeDefined()

    expect(this.table1.sortmytable).not.toBe(this.table2.sortmytable)
  })
})

describe('when a table does not already have buttons in its header cells', function () {
  beforeEach(function () {
    this.table = createTable(simpleTable, {}, document.body)
  })

  afterEach(function () {
    this.table.remove()
  })

  it('the content of each header cell is wrapped in a button', function () {
    expect(
      this.table.querySelectorAll('th button')
    ).toHaveSize(0)

    new SortMyTable(this.table)

    expect(
      this.table.querySelectorAll('th button')[0].textContent
    ).toBe('A')
    expect(
      this.table.querySelectorAll('th button')[1].textContent
    ).toBe('B')
    expect(
      this.table.querySelectorAll('th button > svg')
    ).toHaveSize(2)
  })
})

describe('when a table already has buttons in its header cells', function () {
  beforeEach(function () {
    this.table = createTable(simpleTable, {}, document.body)
    this.table.querySelectorAll('th').forEach(function (th) {
      th.insertAdjacentHTML('beforeend', '<button>Sort</button>')
    })
  })

  afterEach(function () {
    this.table.remove()
  })

  it('the existing buttons are used', function () {
    const numberOfButtons = this.table.querySelectorAll('th button').length

    new SortMyTable(this.table)

    expect(
      this.table.querySelectorAll('th button')
    ).toHaveSize(numberOfButtons)
    expect(
      this.table.querySelectorAll('th button > svg')
    ).toHaveSize(numberOfButtons)
    expect(
      this.table.querySelectorAll('th button button')
    ).toHaveSize(0)
    expect(
      this.table.querySelectorAll('th > svg')
    ).toHaveSize(0)
  })
})

describe('when a table is not pre-sorted', function () {
  beforeEach(function () {
    this.table = createTable(colourTable, {}, document.body)
  })

  afterEach(function () {
    this.table.remove()
  })

  it('the initial sort index is stored on each table row', function () {
    expect(
      this.table.querySelectorAll('tr[data-initial-sort-index]')
    ).toHaveSize(0)

    new SortMyTable(this.table)

    expect(
      this.table.querySelectorAll('tr[data-initial-sort-index]')
    ).toHaveSize(colourTable.rows.length)
  })

  it('an aria-sort attribute is not added to any of the column header cells', function () {
    expect(
      this.table.querySelectorAll('th[aria-sort]')
    ).toHaveSize(0)

    new SortMyTable(this.table)

    expect(
      this.table.querySelectorAll('th[aria-sort]')
    ).toHaveSize(0)
  })

  describe('clicking a column’s header button (a first time)', function () {
    it('sorts the table by that column, ascending', function () {
      new SortMyTable(this.table)

      this.table.querySelector('#col0 button').click()

      expect(
        this.table.querySelector('#col0').getAttribute('aria-sort')
      ).toBe('ascending')

      expect(
        getColumnCellValues(this.table, 0)
      ).toEqual(
        ['Blue', 'Green', 'Red', 'Yellow']
      )

      this.table.querySelector('#col1 button').click()

      expect(
        this.table.querySelector('#col1').getAttribute('aria-sort')
      ).toBe('ascending')

      expect(
        getColumnCellValues(this.table, 1)
      ).toEqual(
        ['20', '60', '90', '100']
      )
    })

    describe('clicking a second time', function () {
      it('sorts the table by that column, descending', function () {
        new SortMyTable(this.table)

        this.table.querySelector('#col0 button').click()
        this.table.querySelector('#col0 button').click()

        expect(
          this.table.querySelector('#col0').getAttribute('aria-sort')
        ).toBe('descending')

        expect(
          getColumnCellValues(this.table, 0)
        ).toEqual(
          ['Yellow', 'Red', 'Green', 'Blue']
        )
      })

      describe('clicking a third time', function () {
        it('returns the table to its original sort order', function () {
          new SortMyTable(this.table)

          this.table.querySelector('#col0 button').click()
          this.table.querySelector('#col0 button').click()
          this.table.querySelector('#col0 button').click()

          expect(
            this.table.querySelector('#col0').hasAttribute('aria-sort')
          ).toBe(false)

          expect(
            getColumnCellValues(this.table, 0)
          ).toEqual(
            ['Red', 'Blue', 'Green', 'Yellow']
          )
        })

        describe('and clicking a fourth time', function () {
          it('sorts the table by that column, ascending', function () {
            new SortMyTable(this.table)

            this.table.querySelector('#col0 button').click()
            this.table.querySelector('#col0 button').click()
            this.table.querySelector('#col0 button').click()
            this.table.querySelector('#col0 button').click()

            expect(
              this.table.querySelector('#col0').getAttribute('aria-sort')
            ).toBe('ascending')

            expect(
              getColumnCellValues(this.table, 0)
            ).toEqual(
              ['Blue', 'Green', 'Red', 'Yellow']
            )
          })
        })
      })
    })
  })
})

describe('when a table is pre-sorted (with `th[aria-sort]`)', function () {
  beforeEach(function () {
    this.table = createTable(leaderboardTable, {}, document.body)
  })

  afterEach(function () {
    this.table.remove()
  })

  it('the initial sort index is not stored on each table row', function () {
    new SortMyTable(this.table)

    expect(
      this.table.querySelectorAll('tr[data-initial-sort-index]')
    ).toHaveSize(0)
  })

  it('the sorted column header retains its original aria-sort attribute', function () {
    const originalHeader = this.table.querySelector('th[aria-sort]')
    const originalDirection = originalHeader.getAttribute('aria-sort')

    new SortMyTable(this.table)

    expect(
      originalHeader.getAttribute('aria-sort')
    ).toBe(originalDirection)
  })

  describe('clicking the pre-sorted column header button', function () {
    it('sorts the table by that column, in the opposite direction', function () {
      const originalHeader = this.table.querySelector('th[aria-sort]')
      const originalDirection = originalHeader.getAttribute('aria-sort')

      const oppositeDirection = (originalDirection === 'ascending' ? 'descending' : 'ascending')

      new SortMyTable(this.table)

      originalHeader.querySelector('button').click()

      expect(
        originalHeader.getAttribute('aria-sort')
      ).toBe(oppositeDirection)

      expect(
        getColumnCellValues(this.table, 0)
      ).toEqual(
        // NOTE: hard-coded to descending, unlike the rest of this test, because meh
        ['David', 'Carol', 'Bob', 'Alice']
      )
    })

    describe('clicking a second time', function () {
      it('sorts the table by that column, in the original direction', function () {
        const originalHeader = this.table.querySelector('th[aria-sort]')
        const originalDirection = originalHeader.getAttribute('aria-sort')
        const originalValues = getColumnCellValues(this.table, 0)

        new SortMyTable(this.table)

        originalHeader.querySelector('button').click()
        originalHeader.querySelector('button').click()

        expect(
          originalHeader.getAttribute('aria-sort')
        ).toBe(originalDirection)

        expect(
          getColumnCellValues(this.table, 0)
        ).toEqual(
          originalValues
        )
      })
    })
  })

  describe('clicking another column’s header button (a first time)', function () {
    it('sorts the table by that column, ascending', function () {
      const originalHeader = this.table.querySelector('th[aria-sort]')

      new SortMyTable(this.table)

      this.table.querySelector('#col1 button').click()

      expect(
        this.table.querySelector('#col1').getAttribute('aria-sort')
      ).toBe('ascending')

      expect(
        originalHeader.hasAttribute('aria-sort')
      ).toBe(false)

      expect(
        getColumnCellValues(this.table, 1)
      ).toEqual(
        ['35', '55', '80', '110']
      )
    })

    describe('clicking a second time', function () {
      it('sorts the table by that column, descending', function () {
        const originalHeader = this.table.querySelector('th[aria-sort]')

        new SortMyTable(this.table)

        this.table.querySelector('#col1 button').click()
        this.table.querySelector('#col1 button').click()

        expect(
          this.table.querySelector('#col1').getAttribute('aria-sort')
        ).toBe('descending')

        expect(
          originalHeader.hasAttribute('aria-sort')
        ).toBe(false)

        expect(
          getColumnCellValues(this.table, 1)
        ).toEqual(
          ['110', '80', '55', '35']
        )
      })

      describe('clicking a third time', function () {
        it('returns the table to its original sort order', function () {
          const originalHeader = this.table.querySelector('th[aria-sort]')
          const originalDirection = originalHeader.getAttribute('aria-sort')
          const originalValues = getColumnCellValues(this.table, 0)

          new SortMyTable(this.table)

          this.table.querySelector('#col1 button').click()
          this.table.querySelector('#col1 button').click()
          this.table.querySelector('#col1 button').click()

          expect(
            this.table.querySelector('#col1').hasAttribute('aria-sort')
          ).toBe(false)

          expect(
            originalHeader.getAttribute('aria-sort')
          ).toBe(originalDirection)

          expect(
            getColumnCellValues(this.table, 0)
          ).toEqual(
            originalValues
          )
        })

        describe('and clicking a fourth time', function () {
          it('sorts the table by that column, ascending', function () {
            const originalHeader = this.table.querySelector('th[aria-sort]')

            new SortMyTable(this.table)

            this.table.querySelector('#col1 button').click()
            this.table.querySelector('#col1 button').click()
            this.table.querySelector('#col1 button').click()
            this.table.querySelector('#col1 button').click()

            expect(
              this.table.querySelector('#col1').getAttribute('aria-sort')
            ).toBe('ascending')

            expect(
              originalHeader.hasAttribute('aria-sort')
            ).toBe(false)

            expect(
              getColumnCellValues(this.table, 1)
            ).toEqual(
              ['35', '55', '80', '110']
            )
          })
        })
      })
    })
  })
})

describe('JavaScript API: sortable.sort()', function () {
  beforeEach(function () {
    this.table = createTable(leaderboardTable, {}, document.body)
  })

  afterEach(function () {
    this.table.remove()
  })

  describe('when called with an HTMLElement (a column header cell)', function () {
    it('sorts the table by the given column', function () {
      const s = new SortMyTable(this.table)

      s.sort(this.table.querySelectorAll('thead th')[1], 'ascending')

      expect(
        getColumnCellValues(this.table, 1)
      ).toEqual(
        ['35', '55', '80', '110']
      )

      s.sort(this.table.querySelectorAll('thead th')[0], 'descending')

      expect(
        getColumnCellValues(this.table, 0)
      ).toEqual(
        ['David', 'Carol', 'Bob', 'Alice']
      )
    })
  })

  describe('when called with a column index', function () {
    it('sorts the table by the given column', function () {
      const s = new SortMyTable(this.table)

      s.sort(1, 'descending')

      expect(
        getColumnCellValues(this.table, 1)
      ).toEqual(
        ['110', '80', '55', '35']
      )

      s.sort(3, 'ascending')

      expect(
        getColumnCellValues(this.table, 3)
      ).toEqual(
        // Ascending alphabetical order
        ['', '', 'Fastest riser award', 'Special achievement badge']
      )
    })
  })

  describe('when called with no argument', function () {
    it('returns the table to its original sort order', function () {
      const col1values = getColumnCellValues(this.table, 0)

      const s = new SortMyTable(this.table)

      s.sort(this.table.querySelectorAll('thead th')[1], 'ascending')

      expect(
        getColumnCellValues(this.table, 1)
      ).toEqual(
        ['35', '55', '80', '110']
      )

      s.sort()

      expect(
        getColumnCellValues(this.table, 0)
      ).toEqual(
        col1values
      )
    })
  })

  it('sorts by a cell’s data-sort-value attribute if present', function () {
    const s = new SortMyTable(this.table)

    s.sort(this.table.querySelectorAll('thead th')[2], 'ascending')

    expect(
      getColumnCellValues(this.table, 2)
    ).toEqual(
      // note, in logical, not alphabetical, order!
      ['1st Jan 2023', '9th Feb 2023', '21st Feb 2023', '5th Mar 2023']
    )

    s.sort(this.table.querySelectorAll('thead th')[2], 'descending')

    expect(
      getColumnCellValues(this.table, 2)
    ).toEqual(
      // note, in logical, not alphabetical, order!
      ['5th Mar 2023', '21st Feb 2023', '9th Feb 2023', '1st Jan 2023']
    )
  })
})

describe('JavaScript API: onSort', function () {
  beforeEach(function () {
    this.table = createTable(simpleTable, {}, document.body)
  })

  afterEach(function () {
    this.table.remove()
  })

  describe('when an onSort callback function is provided', function () {
    it('it is called after the table has been sorted', function () {
      const cb = { func: function (tableElement, columnIndex, direction) { } }
      const cbSpy = spyOn(cb, 'func')

      const s = new SortMyTable(this.table, { onSort: cb.func })

      s.sort(1, 'ascending')

      expect(
        cbSpy
      ).toHaveBeenCalled()

      expect(
        cb.func.calls.argsFor(0)
      ).toEqual(
        [this.table, 1, 'ascending']
      )
    })
  })
})
