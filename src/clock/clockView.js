import { h } from 'snabbdom';

export function renderClock(ctrl, seat, index) {
  const clock = ctrl.clock;

  if (index !== clock.times.activeIndex) return null;

  const update = (el) => {
    clock.elements[index] = el;
    el.style['stroke-dashoffset'] = clock.timeRatio(clock.millisOf(index)) * 283 + '%';
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
          insert: vnode => update(vnode.elm),
          postpatch: (_, vnode) => update(vnode.elm)
        },
        attrs: { cx: 20, cy: 20, r: 18, fill: 'none' }
      })
    ])
  ]);
}

export function updateElements(clock, els, millis) {
  els.style['stroke-dashoffset'] = clock.timeRatio(millis) * 283 + '%';
}
