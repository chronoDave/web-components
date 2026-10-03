// src/lib/is.ts
var number = (x) => {
  if (x.length === 0) return false;
  return !Number.isNaN(parseFloat(x));
};

// src/lib/fn.ts
var maybe = (fn) => (x) => {
  if (x === null || x === void 0) return null;
  return fn(x);
};

// src/lib/dom.ts
var childIndex = (child) => Array.from(child.parentElement?.children ?? []).indexOf(child);

// src/lib/element.ts
var HTMLAbstractElement = class extends HTMLElement {
  #children;
  #initialised;
  #observer;
  constructor(options) {
    super();
    this.#initialised = false;
    this.#children = options?.children ?? false;
  }
  _init() {
    if (this.#initialised) return;
    this.#observer?.disconnect();
    this.#initialised = true;
  }
  connectedCallback() {
    if (this.#initialised || this.#observer) return;
    if (this.childElementCount === 0 && this.#children) {
      this.#observer = new MutationObserver(() => this._init());
      this.#observer.observe(this, { childList: true });
      return;
    }
    this._init();
  }
};

// src/components/datagrid/components/toolbar.ts
import h from "@chronocide/dom";
var view = (id) => (values) => h("fieldset")({ name: "view" })(
  h("label")({ for: `${id}-view` })("Show entries"),
  h("select")({ id: `${id}-view` })(
    h("option")({ value: 0 })("All"),
    ...values.map((value) => h("option")({ value })(`${value}`))
  )
);
var search = (id) => h("fieldset")({ name: "search" })(
  h("label")({ for: `${id}-search` })("Search"),
  h("input")({ id: `${id}-search`, type: "search" })(),
  h("button")({ type: "submit" })("Search")
);
var output = (id) => h("output")({
  "aria-live": "polite",
  "hidden": true,
  "for": `${id}-view ${id}-search`
})();
var navigation = (id) => h("nav")({ "aria-label": "Pagination" })(
  h("button")({
    "type": "button",
    "aria-controls": id,
    "data-action": "previous"
  })("Previous"),
  h("button")({
    "type": "button",
    "aria-controls": id,
    "data-action": "next"
  })("Next")
);
var toolbar_default = (options) => {
  const hidden = (options.views ?? []).length === 0 && !options.search;
  return h("div")({
    "role": "toolbar",
    "aria-label": "Table actions",
    hidden
  })(
    view(options.id.root)(options.views ?? []),
    search(options.id.root),
    navigation(options.id.body),
    output(options.id.root)
  );
};

// src/components/datagrid/components/th.ts
import h2 from "@chronocide/dom";
var th_default = (options) => (th) => {
  th.setAttribute("aria-sort", "none");
  th.setAttribute("data-type", options.type);
  th.replaceChildren(h2("button")({
    "type": "button",
    "data-action": "sort",
    "tabindex": options.tabindex
  })(
    h2("span")({ "hidden": true, "data-sort": "ascending" })("\u2191"),
    h2("span")({ "hidden": true, "data-sort": "descending" })("\u2193"),
    ...th.childNodes
  ));
};

// src/components/datagrid/datagrid.ts
var HTMLDatagridElement = class extends HTMLAbstractElement {
  static observedAttributes = ["data-index"];
  constructor() {
    super({ children: true });
  }
  /** Get active table cell */
  get #active() {
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
  get #view() {
    const select = document.getElementById(`${this.id}-view`);
    return +(select?.value ?? 0);
  }
  /** Get page count */
  get #max() {
    const rows = this.querySelectorAll("tbody tr:not([data-ignored])");
    return Math.ceil(rows.length / this.#view);
  }
  /** Get page index */
  get #index() {
    return +(this.dataset.index ?? 0);
  }
  /** Set page index */
  set #index(n) {
    if (n >= 0 && n < this.#max) this.dataset.index = `${n}`;
  }
  /** Change visible rows */
  #paginate(i) {
    const min = this.#view * i;
    const max = this.#view * (i + 1);
    const rows = this.querySelectorAll("tbody tr:not([data-ignored])");
    rows.forEach((tr, i2) => {
      const hidden = max === 0 ? false : i2 < min || i2 >= max;
      tr.toggleAttribute("hidden", hidden);
    });
    const status = this.querySelector('[role="toolbar"] output');
    if (status) status.textContent = `Showing ${min + 1} to ${Math.min(max, rows.length)} of ${rows.length} entries`;
  }
  #search(query) {
    this.querySelectorAll("tbody tr").forEach((tr) => {
      const matches = Array.from(tr.querySelectorAll("td")).some((td) => td.textContent.toLocaleLowerCase().includes(query));
      tr.toggleAttribute("data-ignored", !matches);
      tr.toggleAttribute("hidden", true);
    });
  }
  #sort(i) {
    const buttons = this.querySelectorAll("th > button");
    buttons.forEach((button) => {
      button.setAttribute("aria-sort", "none");
      button.querySelectorAll("[data-sort]").forEach((icon) => icon.toggleAttribute("hidden", true));
    });
    const cell = this.querySelectorAll("th").item(i);
    const descending = cell.getAttribute("aria-sort") === "descending";
    cell.setAttribute("aria-sort", descending ? "ascending" : "descending");
    cell.querySelector('[data-sort="ascending"]')?.toggleAttribute("hidden", descending);
    cell.querySelector('[data-sort="descending"]')?.toggleAttribute("hidden", !descending);
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
  _init() {
    super._init();
    this.id ||= crypto.randomUUID();
    const rows = this.querySelectorAll("tr");
    rows.forEach((tr, i) => tr.setAttribute("aria-rowindex", `${i + 1}`));
    const table = this.querySelector("table");
    table?.setAttribute("role", "grid");
    table?.setAttribute("aria-rowcount", `${rows.length + 1}`);
    const tbody = this.querySelector("tbody");
    tbody?.setAttribute("id", `${this.id}-container`);
    this.querySelectorAll("th").forEach((cell, i) => th_default({
      type: Array.from(this.querySelectorAll(`td:nth-child(${i + 1})`)).some((cell2) => maybe(number)(cell2.textContent)) ? "number" : "string",
      tabindex: i === 0 ? 0 : -1
    })(cell));
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
          this.#sort(i);
          this.#index = 0;
        }
      }
    }, { passive: true });
    const createFocus = (event) => (cell) => {
      const root = cell.querySelector("[tabindex]") ?? cell;
      event.preventDefault();
      document.activeElement?.setAttribute("tabindex", "-1");
      root.setAttribute("tabindex", "0");
      root.focus();
    };
    table?.addEventListener("keydown", (event) => {
      const rows2 = this.querySelectorAll("tr:not([hidden])");
      const { row, x, y } = this.#active;
      const focus = maybe(createFocus(event));
      if (event.key === "ArrowLeft" && x !== 0) focus(row?.children.item(x - 1));
      if (event.key === "ArrowRight" && x < (row?.children.length ?? 0)) focus(row?.children.item(x + 1));
      if (event.key === "ArrowUp" && y > 0) focus(rows2.item(y - 1).children.item(x));
      if (event.key === "ArrowDown" && y < rows2.length - 1) focus(rows2.item(y + 1).children.item(x));
      if (event.key === "PageUp" && this.#index > 0) {
        this.#index -= 1;
        const rows3 = this.querySelectorAll("tr:not([hidden])");
        focus(rows3.item(Math.min(rows3.length - 1, y)).children.item(x));
      }
      if (event.key === "PageDown" && this.#index < this.#max - 1) {
        this.#index += 1;
        const rows3 = this.querySelectorAll("tr:not([hidden])");
        focus(rows3.item(Math.min(rows3.length - 1, y)).children.item(x));
      }
      if (event.key === "Home") {
        if (event.ctrlKey) {
          this.#index = 0;
          focus(rows2.item(0).children.item(0));
        } else {
          focus(row?.children.item(0));
        }
      }
      if (event.key === "End") {
        if (event.ctrlKey) {
          this.#index = this.#max - 1;
          const rows3 = this.querySelectorAll("tr:not([hidden])");
          const row2 = rows3.item(rows3.length - 1);
          focus(row2.children.item(row2.children.length - 1));
        } else {
          focus(row?.children.item(row.children.length - 1));
        }
      }
    });
    this.prepend(toolbar_default({
      id: {
        root: this.id,
        body: `${this.id}-body`
      },
      views: [10, 25, 50],
      search: true
    }));
    this.querySelectorAll("option").item(2).setAttribute("selected", "true");
    document.getElementById(`${this.id}-view`)?.addEventListener("change", () => {
      this.#paginate(Math.min(this.#index, this.#max));
      if (this.querySelector('table [tabindex="0"]')?.closest("tr")?.hidden) {
        this.querySelector("table th button")?.setAttribute("tabindex", "0");
      }
    }, { passive: true });
    const inputSearch = document.querySelector('[role="toolbar"] [name="search"] input');
    inputSearch?.addEventListener("change", () => {
      this.#search(inputSearch.value.toLocaleLowerCase());
      this.#index = 0;
    }, { passive: true });
    document.querySelector('[role="toolbar"] [name="search"] button')?.addEventListener("click", () => {
      this.#search(inputSearch?.value.toLocaleLowerCase() ?? "");
      this.#index = 0;
    }, { passive: true });
    this.querySelector('[role="toolbar"] nav button[data-action="previous"]')?.addEventListener("click", () => {
      this.#index -= 1;
    }, { passive: true });
    this.querySelector('[role="toolbar"] nav button[data-action="next"]')?.addEventListener("click", () => {
      this.#index += 1;
    }, { passive: true });
    this.#paginate(0);
  }
  attributeChangedCallback(attribute) {
    if (attribute === "data-index") this.#paginate(this.#index);
  }
};
export {
  HTMLDatagridElement
};
