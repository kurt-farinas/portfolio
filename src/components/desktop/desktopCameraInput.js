// Native capture runs before CameraControls' container listeners without
// consuming the event that React and native scrolling still need.
export function computeDesktopScenePointer(event, state, previous, compute) {
  // A view-changing button can detach before the click reaches the canvas listener.
  // Keep its original event path; a keyboard click has no scene pointer coordinates.
  const path = (event.nativeEvent || event).composedPath?.() || [];
  const keyboardClick = event.type === 'click' && event.detail === 0;
  if (keyboardClick || event.target?.closest?.('.desk-projection-frame') || path.some(node => node?.classList?.contains('desk-projection-frame'))) {
    state.raycaster.camera = null;
    return;
  }
  compute(event, state, previous);
}

export function bindDesktopCameraInput(frame, controls) {
  const doc = frame.ownerDocument;
  const win = doc.defaultView;
  let hovered = frame.matches(':hover');
  let focused = frame.contains(doc.activeElement);
  let manualMotion = false;
  const pointers = new Set();
  const originalEnabled = controls.enabled;

  const sync = () => {
    const locked = hovered || focused || pointers.size > 0;
    if (locked && manualMotion) {
      manualMotion = false;
      const position = controls.getPosition(undefined, false);
      const target = controls.getTarget(undefined, false);
      const offset = controls.getFocalOffset(undefined, false);
      controls.setLookAt(...position.toArray(), ...target.toArray(), false);
      controls.setFocalOffset(...offset.toArray(), false);
    }
    if (controls.enabled !== (originalEnabled && !locked)) controls.enabled = originalEnabled && !locked;
  };
  const enter = () => { hovered = true; sync(); };
  const leave = () => { hovered = false; sync(); };
  const focusIn = () => { focused = true; sync(); };
  const focusOut = event => { focused = frame.contains(event.relatedTarget); sync(); };
  const down = event => { pointers.add(event.pointerId); enter(); };
  const outsideDown = event => {
    if (!frame.contains(event.target) && pointers.size === 0) {
      hovered = false; focused = false; sync();
    }
  };
  const release = event => {
    if (!pointers.delete(event.pointerId)) return;
    hovered = frame.matches(':hover');
    focused = frame.contains(doc.activeElement);
    sync();
  };
  const blur = () => { pointers.clear(); hovered = false; focused = false; sync(); };
  const focus = () => { hovered = frame.matches(':hover'); focused = frame.contains(doc.activeElement); sync(); };
  const controlStart = () => { manualMotion = true; };
  const rest = () => { manualMotion = false; };
  const listeners = [
    [frame,'pointerenter',enter], [frame,'pointerleave',leave],
    [frame,'focusin',focusIn], [frame,'focusout',focusOut],
    [frame,'pointerdown',down,true], [frame,'wheel',enter,{capture:true,passive:true}],
    [doc,'pointerdown',outsideDown,true],
    [doc,'pointerup',release,true], [doc,'pointercancel',release,true],
    [win,'blur',blur], [win,'focus',focus]
  ];
  for (const [node,type,listener,options] of listeners) node.addEventListener(type,listener,options);
  controls.addEventListener('controlstart',controlStart);
  controls.addEventListener('rest',rest);
  sync();
  return () => {
    for (const [node,type,listener,options] of listeners) node.removeEventListener(type,listener,options);
    controls.removeEventListener('controlstart',controlStart);
    controls.removeEventListener('rest',rest);
    pointers.clear();
    controls.enabled = originalEnabled;
  };
}
