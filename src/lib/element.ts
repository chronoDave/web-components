export type ElementOptions = {
  /** Does this element expect to have children? */
  children?: boolean;
};

/**
 * Minimal base class that normalises unintuitive web component lifecycle behaviour
 * 
 * @see https://stackoverflow.com/questions/70949141/web-components-accessing-innerhtml-in-connectedcallback/70952159#70952159
 */
export default abstract class HTMLAbstractElement extends HTMLElement {
  readonly #children: boolean;
  #initialised: boolean;
  #observer?: MutationObserver;

  constructor(options?: ElementOptions) {
    super();

    this.#initialised = false;
    this.#children = options?.children ?? false;
  }

  protected _init() {
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
}