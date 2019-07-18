import { h } from 'snabbdom';

export function renderClock(ctrl, seat, index) {
  const clock = ctrl.clock;

  if (index !== clock.times.activeIndex) return null;

  const setEl = (el) => {
    clock.elements[index] = el;
  };

  return h('div.timer', [
    h('svg', { attrs: { viewBox: '0 0 40 40' } }, [
      h('circle.border', {
        attrs: { cx: 20, cy: 20, r: 18, fill: 'none' }
      }),
      h('circle.bar', {
        style: {
          'stroke-dasharray': '113px',
        },
        hook: {
          insert: vnode => setEl(vnode.elm),
          postpatch: (_, vnode) => setEl(vnode.elm)
        },
        attrs: { cx: 20, cy: 20, r: 18, fill: 'none' }
      })
    ])
  ]);
}

export function updateElements(clock, els, millis) {
  els.style['stroke-dashoffset'] = clock.timeRatio(millis) * 283 + '%';
  const cl = els.classList;
  if (millis < clock.emergMs) cl.add('emerg');
  else if (cl.contains('emerg')) cl.remove('emerg');
}
