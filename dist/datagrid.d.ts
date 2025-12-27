declare class HTMLDatagridElement extends HTMLElement {
    static observedAttributes: string[];
    private _initialised;
    /** Get active table cell */
    private get _active();
    /** Get view size (visible rows) */
    private get _view();
    /** Get page count */
    private get _max();
    /** Get page index */
    private get _index();
    /** Set page index */
    private set _index(value);
    /** Change visible rows */
    private _paginate;
    private _search;
    private _sort;
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(attribute: string): void;
}

export { HTMLDatagridElement };
