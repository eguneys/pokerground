import { init } from 'snabbdom';
import klass from 'snabbdom/modules/class';
import attributes from 'snabbdom/modules/attributes';
import eventlisteners from 'snabbdom/modules/eventlisteners';
import style from 'snabbdom/modules/style';

export const patch = init([klass, attributes, eventlisteners, style]);

import Loop from './loop';

import start from './api';

import { configure } from './config';
import { defaults } from './state'; 
import makeCtrl from './ctrl';
import view from './view';


export function app(element, config, loop) {

  if (loop === undefined) loop = (fn) => { new Loop(fn).start(); };

  let state = defaults();

  configure(state, config || {});

  let vnode, ctrl;

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  ctrl = new makeCtrl(state);

  const blueprint = view(ctrl);
  vnode = patch(element, blueprint);

  loop((delta) => {
    ctrl.update(delta);
    redraw();
  });

  if (module.hot) {
    module.hot.accept('./ctrl', function() {
      try {
        redraw();
      } catch (e) {
        console.log(e);
      }
    });
    module.hot.accept('./view', function() {
      try {
        redraw();
      } catch (e) {
        console.log(e);
      }
    });
  }

  return start(ctrl, redraw);
}
