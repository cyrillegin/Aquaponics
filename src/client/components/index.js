import titlebar from './titlebar';
import tree from './tree';
import graph from './graph';
import modal from './modal';
import docTree from './docTree';

export function defineComponents() {
  window.customElements.define('titlebar-component', titlebar);
  window.customElements.define('tree-component', tree);
  window.customElements.define('graph-component', graph);
  window.customElements.define('modal-component', modal);
  window.customElements.define('doctree-component', docTree);
}