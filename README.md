<div align="center">
  <h1>@chronocide/web-components</h1>
  <p>Accessible web components</p>
</div>

<div align="center">
  <a href="/LICENSE">
    <img alt="License AGPLv3" src="https://img.shields.io/badge/license-AGPLv3-blue.svg" />
  </a>
  <a href="https://www.npmjs.com/package/@chronocide/web-components">
    <img alt="NPM" src="https://img.shields.io/npm/v/@chronocide/web-components?label=npm">
  </a>
</div>

---

`web-components` is a collection of minimal, accessible [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).

- [Data Grid](#data-grid)

## Installation

```sh
npm i @chronocide/web-components
```

## Usage

### Data Grid

Implements [APG Data Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/), features:

- Full keyboard navigation
- Aria roles
- Pagination
- Sorting
- Searching

```ts
import { HTMLDatagridElement } from '@chronocide/web-components';

customElements.define('chrono-datagrid', HTMLDatagridElement);
```

```html
<chrono-datagrid>
  <table>
    <thead>
      <tr>
        <th>name</th>
        <th>id</th>
        <th>nametype</th>
        <th>recclass</th>
        <th>mass (g)</th>
        <th>fall</th>
        <th>year</th>
        <th>reclat</th>
        <th>reclong</th>
        <th>GeoLocation</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Aachen</td>
        <td>1</td>
        <td>Valid</td>
        <td>L5</td>
        <td>21</td>
        <td>Fell</td>
        <td>1880</td>
        <td>50.775000</td>
        <td>6.083330</td>
        <td>(50.775, 6.08333)</td>
      </tr>
    </tbody>
  </table>
<chrono-datagrid>
```
