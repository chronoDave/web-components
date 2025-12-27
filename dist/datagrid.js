const maybe$1 = (fn) => (x) => {
  if (x === null || x === void 0) return null;
  return fn(x);
};

const setAttributes = (element) => (attributes) => Object.entries(attributes).forEach(([k, v]) => {
  if (typeof v === "string") element.setAttribute(k, v);
  if (typeof v === "number") element.setAttribute(k, `${v}`);
  if (v === true) element.toggleAttribute(k, v);
});
const create = (element) => (attributes) => (children) => {
  maybe$1(setAttributes(element))(attributes);
  element.append(...children);
  return element;
};
const html = (document) => (tag) => (attributes) => (...children) => create(document.createElement(tag))(attributes)(children);
const svg$1 = (document) => (tag) => (attributes) => (...children) => create(document.createElementNS("http://www.w3.org/2000/svg", tag))(attributes)(children);

class Env {
  _document;
  get document() {
    if (!this._document) throw new Error("Missing document");
    return this._document;
  }
  set document(document2) {
    this._document = document2;
  }
  constructor() {
    this._document = typeof document === "undefined" ? null : document;
  }
}

const env = new Env();
var hyper = (tag) => html(env.document)(tag);
const svg = (tag) => svg$1(env.document)(tag);

const uid = /* @__PURE__ */ (() => {
  let n = 0;
  return () => `${Date.now().toString(16)}-${(n++ * 16 ** 4).toString(16).padEnd(4, "0")}`;
})();

const number = (x) => {
  if (x.length === 0) return false;
  return !Number.isNaN(parseFloat(x));
};

const maybe = (fn) => (x) => {
  if (x === null || x === void 0) return null;
  return fn(x);
};

const childIndex = (child) => Array.from(child.parentElement?.children ?? []).indexOf(child);
const wrap = (root) => {
  const wrapper = hyper("div")()();
  root.parentElement?.insertBefore(wrapper, root);
  wrapper.appendChild(root);
  return wrapper;
};

const icon = (attributes) => (state) => svg("svg")({
  "xmlns": "http://www.w3.org/2000/svg",
  "class": "icon",
  "viewBox": attributes.viewbox,
  "width": 16,
  "hidden": state?.hidden,
  "height": 16,
  "aria-hidden": "true",
  "data-icon": attributes.id
})(svg("path")({ d: attributes.d })());
const chevronLeft = icon({
  id: "chevron-left",
  viewbox: "0 0 320 512",
  d: "M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
});
const chevronRight = icon({
  id: "chevron-right",
  viewbox: "0 0 320 512",
  d: "M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
});
const caretUp = icon({
  id: "caret-up",
  viewbox: "0 0 320 512",
  d: "M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8l256 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"
});
const caretDown = icon({
  id: "caret-down",
  viewbox: "0 0 320 512",
  d: "M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"
});
const magnifyingGlass = icon({
  id: "magnifying-glass",
  viewbox: "0 0 512 512",
  d: "M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
});

var buttonIcon = (icon) => (id) => (label) => hyper("button")({
  "type": "button",
  "aria-controls": id
})(icon, hyper("span")({ class: "sr-only" })(label));

class HTMLDatagridElement extends HTMLElement {
  static observedAttributes = ["data-index"];
  _initialised;
  /** Get active table cell */
  get _active() {
    const rows = this.querySelectorAll("tr:not([hidden])");
    const row = document.activeElement?.closest("tr") ?? null;
    const col = document.activeElement?.closest("td") ?? // Link
    document.activeElement?.closest("th") ?? // Button
    document.activeElement;
    const x = maybe(childIndex)(col) ?? 0;
    const y = row ? Math.max(0, Array.from(rows).indexOf(row)) : 0;
    return { row, col, x, y };
  }
  /** Get view size (visible rows) */
  get _view() {
    const select = document.getElementById(`${this.id}-view`);
    return +(select?.value ?? 0);
  }
  /** Get page count */
  get _max() {
    const rows = this.querySelectorAll("tbody tr:not([data-ignored])");
    return Math.ceil(rows.length / this._view);
  }
  /** Get page index */
  get _index() {
    return +(this.dataset.index ?? 0);
  }
  /** Set page index */
  set _index(n) {
    if (n >= 0 && n < this._max) this.dataset.index = `${n}`;
  }
  /** Change visible rows */
  _paginate(i) {
    const min = this._view * i;
    const max = this._view * (i + 1);
    const rows = this.querySelectorAll("tbody tr:not([data-ignored])");
    rows.forEach((tr, i2) => {
      const hidden = max === 0 ? false : i2 < min || i2 >= max;
      tr.toggleAttribute("hidden", hidden);
    });
    const status = this.querySelector(".status");
    if (status) status.textContent = `Showing ${min + 1} to ${Math.min(max, rows.length)} of ${rows.length} entries`;
  }
  _search(query) {
    this.querySelectorAll("tbody tr").forEach((tr) => {
      const matches = Array.from(tr.querySelectorAll("td")).some((td) => td.textContent.toLocaleLowerCase().includes(query));
      tr.toggleAttribute("data-ignored", !matches);
      tr.toggleAttribute("hidden", true);
    });
  }
  _sort(i) {
    const buttons = this.querySelectorAll("th > button");
    buttons.forEach((button) => {
      button.setAttribute("aria-sort", "none");
      button.querySelectorAll("[data-icon]").forEach((icon2) => icon2.toggleAttribute("hidden", true));
    });
    const cell = this.querySelectorAll("th").item(i);
    const descending = cell.getAttribute("aria-sort") === "descending";
    cell.setAttribute("aria-sort", descending ? "ascending" : "descending");
    cell.querySelector('[data-icon="caret-up"]')?.toggleAttribute("hidden", descending);
    cell.querySelector('[data-icon="caret-down"]')?.toggleAttribute("hidden", !descending);
    const type = cell.getAttribute("data-type");
    const text = (row) => row.children.item(i)?.textContent ?? "";
    const rows = Array.from(this.querySelectorAll("tbody tr")).sort((a, b) => {
      if (type === "number") {
        if (descending) return +text(b) - +text(a);
        return +text(a) - +text(b);
      }
      if (type === "string") {
        if (descending) return text(b).localeCompare(text(a));
        return text(a).localeCompare(text(b));
      }
      return 0;
    });
    rows.forEach((tr, i2) => {
      tr.setAttribute("aria-rowindex", `${i2 + 2}`);
    });
    const tbody = this.querySelector("tbody");
    tbody?.replaceChildren(...rows);
  }
  constructor() {
    super();
    this._initialised = false;
  }
  connectedCallback() {
    if (this._initialised) return;
    this._initialised = true;
    if (this.id === "") this.id = uid();
    const rows = this.querySelectorAll("tr");
    rows.forEach((tr, i) => tr.setAttribute("aria-rowindex", `${i + 1}`));
    const table = this.querySelector("table");
    table?.setAttribute("role", "grid");
    table?.setAttribute("aria-rowcount", `${rows.length + 1}`);
    if (table?.getAttribute("aria-label") === null) table.setAttribute("aria-labelledby", `${this.id}-label`);
    const tbody = this.querySelector("tbody");
    tbody?.setAttribute("id", `${this.id}-container`);
    const ths = this.querySelectorAll("th");
    ths.forEach((th, i) => {
      th.setAttribute("aria-sort", "none");
      const cells2 = Array.from(this.querySelectorAll(`td:nth-child(${i + 1})`));
      th.setAttribute("data-type", cells2.some((cell) => maybe(number)(cell.textContent)) ? "number" : "string");
      th.replaceChildren(hyper("button")({
        "type": "button",
        "data-action": "sort",
        "tabindex": i === 0 ? "0" : "-1"
      })(
        caretUp({ hidden: true }),
        caretDown({ hidden: true }),
        ...th.childNodes
      ));
    });
    const cells = this.querySelectorAll("td");
    cells.forEach((td) => {
      (td.querySelector("a") ?? td).setAttribute("tabindex", "-1");
    });
    const thead = this.querySelector("thead");
    thead?.addEventListener("click", (event) => {
      const target = event.target;
      const button = target?.closest("button") ?? target;
      if (button?.dataset.action === "sort") {
        const i = maybe(childIndex)(button.closest("th"));
        if (typeof i === "number") {
          this._sort(i);
          this._index = 0;
        }
      }
    }, { passive: true });
    const wrapper = maybe(wrap)(table);
    wrapper?.classList.add("datagrid");
    if (wrapper) this.append(wrapper);
    const createFocus = (event) => (cell) => {
      const root = cell.querySelector("[tabindex]") ?? cell;
      event.preventDefault();
      document.activeElement?.setAttribute("tabindex", "-1");
      root.setAttribute("tabindex", "0");
      root.focus();
    };
    table?.addEventListener("keydown", (event) => {
      const rows2 = this.querySelectorAll("tr:not([hidden])");
      const { row, x, y } = this._active;
      const focus = maybe(createFocus(event));
      if (event.key === "ArrowLeft" && x !== 0) focus(row?.children.item(x - 1));
      if (event.key === "ArrowRight" && x < (row?.children.length ?? 0)) focus(row?.children.item(x + 1));
      if (event.key === "ArrowUp" && y > 0) focus(rows2.item(y - 1).children.item(x));
      if (event.key === "ArrowDown" && y < rows2.length - 1) focus(rows2.item(y + 1).children.item(x));
      if (event.key === "PageUp" && this._index > 0) {
        this._index -= 1;
        const rows3 = this.querySelectorAll("tr:not([hidden])");
        focus(rows3.item(Math.min(rows3.length - 1, y)).children.item(x));
      }
      if (event.key === "PageDown" && this._index < this._max - 1) {
        this._index += 1;
        const rows3 = this.querySelectorAll("tr:not([hidden])");
        focus(rows3.item(Math.min(rows3.length - 1, y)).children.item(x));
      }
      if (event.key === "Home") {
        if (event.ctrlKey) {
          this._index = 0;
          focus(rows2.item(0).children.item(0));
        } else {
          focus(row?.children.item(0));
        }
      }
      if (event.key === "End") {
        if (event.ctrlKey) {
          this._index = this._max - 1;
          const rows3 = this.querySelectorAll("tr:not([hidden])");
          const row2 = rows3.item(rows3.length - 1);
          focus(row2.children.item(row2.children.length - 1));
        } else {
          focus(row?.children.item(row.children.length - 1));
        }
      }
    });
    const inputSearch = hyper("input")({ type: "search", id: `${this.id}-search` })();
    const buttonSearch = buttonIcon(magnifyingGlass())(`${this.id}-search`)("Search");
    const search = () => {
      this._search(inputSearch.value.toLocaleLowerCase());
      this._index = 0;
    };
    inputSearch.addEventListener("change", search, { passive: true });
    buttonSearch.addEventListener("click", search, { passive: true });
    const selectView = hyper("select")({ id: `${this.id}-view` })(
      hyper("option")({ value: 10 })("10"),
      hyper("option")({ value: 25, selected: true })("25"),
      hyper("option")({ value: 50 })("50"),
      hyper("option")({ value: 0 })("All")
    );
    selectView.addEventListener("change", () => {
      this._paginate(Math.min(this._index, this._max));
      if (this.querySelector('table [tabindex="0"]')?.closest("tr")?.hidden) {
        this.querySelector("table th button")?.setAttribute("tabindex", "0");
      }
    }, { passive: true });
    this.prepend(hyper("div")({ class: "toolbar" })(
      hyper("div")({ class: "view" })(
        hyper("label")({ for: `${this.id}-view` })("Show entries"),
        selectView
      ),
      hyper("div")({ class: "search" })(
        hyper("label")({ for: `${this.id}-search` })("Search"),
        inputSearch,
        buttonSearch
      )
    ));
    const buttonPrevious = buttonIcon(chevronLeft())(`${this.id}-container`)("Previous");
    buttonPrevious.addEventListener("click", () => {
      this._index -= 1;
    }, { passive: true });
    const buttonNext = buttonIcon(chevronRight())(`${this.id}-container`)("Next");
    buttonNext.addEventListener("click", () => {
      this._index += 1;
    }, { passive: true });
    this.appendChild(hyper("div")({ class: "footer" })(
      hyper("p")({ class: "status" })(),
      hyper("div")({ class: "controls" })(buttonPrevious, buttonNext)
    ));
    this._paginate(0);
  }
  attributeChangedCallback(attribute) {
    if (attribute === "data-index") this._paginate(this._index);
  }
}

export { HTMLDatagridElement };
