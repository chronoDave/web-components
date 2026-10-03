type ElementOptions = {
	/** Does this element expect to have children? */
	children?: boolean;
};
declare abstract class HTMLAbstractElement extends HTMLElement {
	#private;
	constructor(options?: ElementOptions);
	protected _init(): void;
	connectedCallback(): void;
}
export declare class HTMLDatagridElement extends HTMLAbstractElement {
	#private;
	static observedAttributes: string[];
	constructor();
	protected _init(): void;
	attributeChangedCallback(attribute: string): void;
}

export {};
