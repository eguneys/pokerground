export function bind(eventName, f) {
  return {
    insert(vnode) {
      vnode.elm.addEventListener(eventName, e=> {
        const res = f(e);
        return res;
      });
    }
  };
}
