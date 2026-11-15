/* Portal catalogue browsing. DOM-only: no network, storage, or catalogue writes. */
(() => {
  'use strict';
  let widgetId = 0;
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const text = node => (node?.textContent || '').replace(/\s+/g, ' ').trim();
  const node = (tag, className, value) => {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (value !== undefined) result.textContent = value;
    return result;
  };
  function button(label, className = '') {
    const result = node('button', `pw-table-button ${className}`, label);
    result.type = 'button';
    return result;
  }
  function dropdown(options, value) {
    const result = node('select');
    for (const [key, label] of options) {
      const option = node('option', '', label);
      option.value = key;
      result.append(option);
    }
    result.value = value;
    return result;
  }
  function field(label, control, parent, id) {
    control.id = id;
    const wrapper = node('div', 'pw-table-field');
    const caption = node('label', '', label);
    caption.htmlFor = id;
    wrapper.append(caption, control);
    parent.append(wrapper);
    return control;
  }
  function enhance(table) {
    if (table.dataset.pwEnhanced || !table.tHead || !table.tBodies.length) return;
    const headers = Array.from(table.tHead.rows[0].cells, text);
    const parts = headers.length === 9 && headers[1].toLowerCase() === 'item code';
    const suppliers = headers.length === 4 && headers[0].toLowerCase() === 'code';
    if (!parts && !suppliers) return;
    const entries = Array.from(table.tBodies[0].rows)
      .filter(row => row.cells.length === headers.length && (!parts || row.querySelector('input[name="label_codes[]"]')))
      .map((row, index) => {
        const cells = Array.from(row.cells, text);
        const check = parts ? row.querySelector('input[name="label_codes[]"]') : null;
        for (let column = 0; column < row.cells.length; column++) row.cells[column].dataset.label = headers[column];
        if (check) {
          const label = node('label', 'pw-item-check');
          check.parentNode.insertBefore(label, check);
          label.append(check);
        }
        return { row, index, cells, check, search: cells.join(' ').toLocaleLowerCase(), supplier: parts ? text(row.cells[3].firstChild) : '' };
      });
    if (!entries.length) return;
    table.dataset.pwEnhanced = '1';
    table.dataset.pwKind = parts ? 'parts' : 'suppliers';
    table.classList.add('pw-data-table');
    const noun = parts ? 'parts' : 'suppliers';
    const prefix = `pw-table-${++widgetId}`;
    const mobile = window.matchMedia('(max-width: 700px)');
    const state = { page: 1, size: mobile.matches ? 10 : 25, column: parts ? 1 : 0, direction: 'asc' };
    const widget = node('section', 'pw-data-browser');
    widget.dataset.pwKind = parts ? 'parts' : 'suppliers';
    widget.setAttribute('aria-label', `${parts ? 'Parts' : 'Supplier'} catalogue browser`);
    table.before(widget);
    const toolbar = node('div', 'pw-table-toolbar');
    const search = node('input');
    search.type = 'search'; search.autocomplete = 'off';
    search.placeholder = parts ? 'Item code, part, supplier or shelf' : 'Supplier code, name or email';
    field('Search', search, toolbar, `${prefix}-search`);
    toolbar.firstChild.classList.add('pw-table-search');
    let supplier, status, unit;
    if (parts) {
      const values = key => Array.from(new Set(entries.map(key).filter(Boolean))).sort(collator.compare);
      supplier = field('Supplier', dropdown([['', 'All suppliers'], ...values(e => e.supplier).map(s => [s, s])], ''), toolbar, `${prefix}-supplier`);
      status = field('Status', dropdown([['', 'All statuses'], ['Enabled', 'Enabled'], ['Draft / disabled', 'Draft / disabled']], ''), toolbar, `${prefix}-status`);
      unit = field('Order unit', dropdown([['', 'All units'], ...values(e => e.cells[4]).map(s => [s, s])], ''), toolbar, `${prefix}-unit`);
    }
    const sortColumns = parts ? [1, 2, 3, 4, 5, 6] : [0, 1, 2, 3];
    const sortOptions = sortColumns.flatMap(column => ['asc', 'desc'].map(direction => [`${column}:${direction}`, `${headers[column]} ${direction === 'asc' ? '↑' : '↓'}`]));
    const sorting = field('Sort by', dropdown(sortOptions, `${state.column}:${state.direction}`), toolbar, `${prefix}-sort`);
    const tools = node('div', 'pw-table-tools');
    const reset = button('Clear filters');
    const size = field('Per page', dropdown([['10', '10'], ['25', '25'], ['50', '50']], String(state.size)), tools, `${prefix}-size`);
    tools.append(reset);
    const summary = node('p', 'pw-table-summary');
    summary.id = `${prefix}-summary`;
    summary.setAttribute('role', 'status');
    summary.setAttribute('aria-live', 'polite');
    const selection = node('div', 'pw-table-selection');
    let pageSelection, allResults, clearSelection;
    if (parts) {
      pageSelection = node('input'); pageSelection.type = 'checkbox';
      const pageLabel = node('label', 'pw-page-check');
      pageLabel.append(pageSelection, node('span', '', 'Select this page'));
      allResults = button('Select matching parts');
      clearSelection = button('Clear selection');
      selection.append(pageLabel, allResults, clearSelection);
    }
    const scroll = node('div', 'pw-table-scroll');
    scroll.tabIndex = 0;
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', `${parts ? 'Parts' : 'Suppliers'} — scroll to see more`);
    scroll.setAttribute('aria-describedby', summary.id);
    const footer = node('div', 'pw-table-pagination');
    const previous = button('Previous'), next = button('Next');
    const pageNumber = node('span');
    pageNumber.setAttribute('aria-live', 'polite');
    footer.append(previous, pageNumber, next);
    widget.append(toolbar, tools, summary);
    if (parts) widget.append(selection);
    widget.append(scroll, footer);
    scroll.append(table);
    const emptyRow = table.tBodies[0].insertRow();
    emptyRow.className = 'pw-table-empty';
    const emptyCell = emptyRow.insertCell();
    emptyCell.colSpan = headers.length;
    emptyCell.textContent = `No ${noun} match these filters.`;
    emptyRow.hidden = true;
    if (parts) {
      const note = node('p', 'pw-table-note', 'Selections stay checked across pages and filters. With no parts checked, the existing print action uses all enabled parts.');
      widget.append(note);
    }
    const sortButtons = [];
    for (const column of sortColumns) {
      const heading = table.tHead.rows[0].cells[column];
      const toggle = button(headers[column], 'pw-sort-button');
      heading.replaceChildren(toggle);
      sortButtons.push(toggle);
      toggle.addEventListener('click', () => {
        state.direction = state.column === column && state.direction === 'asc' ? 'desc' : 'asc';
        state.column = column; state.page = 1;
        sorting.value = `${column}:${state.direction}`;
        paint();
      });
    }
    function filtered() {
      const query = search.value.trim().toLocaleLowerCase();
      const terms = query.split(/\s+/).filter(Boolean);
      return entries.filter(entry => terms.every(term => entry.search.includes(term)) &&
        (!supplier?.value || entry.supplier === supplier.value) &&
        (!status?.value || entry.cells[6] === status.value) &&
        (!unit?.value || entry.cells[4] === unit.value))
        .sort((a, b) => (collator.compare(a.cells[state.column], b.cells[state.column]) * (state.direction === 'asc' ? 1 : -1)) || a.index - b.index);
    }
    function paint() {
      const focused = document.activeElement;
      const matching = filtered();
      const pages = Math.max(1, Math.ceil(matching.length / state.size));
      state.page = Math.min(state.page, pages);
      const visible = matching.slice((state.page - 1) * state.size, state.page * state.size);
      for (const entry of entries) entry.row.hidden = true;
      // Move existing rows, preserving native input names, checks, links and nonces.
      const fragment = document.createDocumentFragment();
      for (const entry of matching) fragment.append(entry.row);
      table.tBodies[0].insertBefore(fragment, emptyRow);
      for (const entry of visible) entry.row.hidden = false;
      emptyRow.hidden = matching.length !== 0;
      const selected = parts ? entries.filter(entry => entry.check.checked).length : 0;
      const start = matching.length ? (state.page - 1) * state.size + 1 : 0;
      summary.textContent = `Showing ${start}–${matching.length ? start + visible.length - 1 : 0} of ${matching.length} ${noun}` + (matching.length !== entries.length ? ` (${entries.length} total)` : '') + (parts ? ` · ${selected} selected across all pages` : '');
      pageNumber.textContent = `Page ${state.page} of ${pages}`;
      previous.disabled = state.page === 1;
      next.disabled = state.page === pages;
      if (parts) {
        const count = visible.filter(entry => entry.check.checked).length;
        pageSelection.checked = visible.length > 0 && count === visible.length;
        pageSelection.indeterminate = count > 0 && count < visible.length;
        pageSelection.disabled = !visible.length;
        allResults.disabled = !matching.length;
        allResults.textContent = `Select ${matching.length} matching parts`;
        clearSelection.disabled = selected === 0;
      }
      sortColumns.forEach(column => {
        const heading = table.tHead.rows[0].cells[column];
        heading.setAttribute('aria-sort', column === state.column ? (state.direction === 'asc' ? 'ascending' : 'descending') : 'none');
        heading.firstChild.textContent = headers[column] + (column === state.column ? (state.direction === 'asc' ? ' ↑' : ' ↓') : '');
      });
      if (focused instanceof HTMLElement && table.contains(focused) && !focused.closest('[hidden]')) focused.focus({ preventScroll: true });
    }
    const refilter = () => { state.page = 1; paint(); scroll.scrollTop = 0; };
    search.addEventListener('input', refilter);
    [supplier, status, unit].filter(Boolean).forEach(control => control.addEventListener('change', refilter));
    sorting.addEventListener('change', () => {
      const [column, direction] = sorting.value.split(':');
      state.column = Number(column); state.direction = direction; refilter();
    });
    size.addEventListener('change', () => { state.size = Number(size.value); refilter(); });
    reset.addEventListener('click', () => {
      search.value = '';
      [supplier, status, unit].filter(Boolean).forEach(control => { control.value = ''; });
      refilter();
    });
    previous.addEventListener('click', () => { state.page--; paint(); scroll.scrollTop = 0; });
    next.addEventListener('click', () => { state.page++; paint(); scroll.scrollTop = 0; });
    if (parts) {
      pageSelection.addEventListener('change', () => {
        filtered().slice((state.page - 1) * state.size, state.page * state.size).forEach(entry => { entry.check.checked = pageSelection.checked; });
        paint();
      });
      allResults.addEventListener('click', () => { filtered().forEach(entry => { entry.check.checked = true; }); paint(); });
      clearSelection.addEventListener('click', () => { entries.forEach(entry => { entry.check.checked = false; }); paint(); });
      table.addEventListener('change', event => { if (event.target.matches('input[name="label_codes[]"]')) paint(); });
    }
    const syncHeaderFocus = () => sortButtons.forEach(control => { control.tabIndex = mobile.matches ? -1 : 0; });
    mobile.addEventListener('change', syncHeaderFocus);
    syncHeaderFocus();
    paint();
  }
  function start() { document.querySelectorAll('.pwqr-catalog table.widefat').forEach(enhance); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
