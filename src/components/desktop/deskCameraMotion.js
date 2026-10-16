// Freeze the rendered pose, not CameraControls.stop(), which jumps to its destination.
export function createDeskCameraMotion(getControls, clock, setFrameloop) {
  let generation = 0;
  const freeze = controls => {
    if (!controls) return;
    const position = controls.getPosition(undefined, false).toArray();
    const target = controls.getTarget(undefined, false).toArray();
    const offset = controls.getFocalOffset(undefined, false).toArray();
    controls.setLookAt(...position, ...target, false);
    controls.setFocalOffset(...offset, false);
  };
  return {
    move(pose, animate, smoothTime = 0.20) {
      const run = ++generation;
      const controls = getControls();
      if (!controls) return Promise.resolve();
      freeze(controls);
      if (!animate) {
        controls.smoothTime = 0.20;
        controls.setLookAt(...pose, false);
        setFrameloop('demand');
        return Promise.resolve();
      }
      controls.smoothTime = smoothTime;
      clock.getDelta();
      setFrameloop('always');
      const current = () => run === generation && controls === getControls();
      return controls.setLookAt(...pose, true).then(() => {
        if (!current()) return;
        // `rest` means almost still, not finished. Drei's update invalidations
        // keep the remaining damping rendering in demand mode until sleep.
        setFrameloop('demand');
      }, error => {
        if (!current()) return;
        setFrameloop('demand');
        throw error;
      });
    },
    dispose() {
      generation += 1;
      freeze(getControls());
      setFrameloop('demand');
    }
  };
}
