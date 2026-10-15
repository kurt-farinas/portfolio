import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindDesktopCameraInput, computeDesktopScenePointer } from '../src/components/desktop/desktopCameraInput';

describe('projected desktop input ownership', () => {
  let container, frame, field, outside, controls, cleanup, hovering;
  const pointer = (node,type,id=1) => {
    const event = new Event(type,{bubbles:true,cancelable:true});
    Object.defineProperty(event,'pointerId',{value:id});node.dispatchEvent(event);return event;
  };
  beforeEach(() => {
    container=document.createElement('div');frame=document.createElement('div');field=document.createElement('input');outside=document.createElement('button');
    frame.className='desk-projection-frame';frame.append(field);container.append(frame,outside);document.body.append(container);hovering=false;
    vi.spyOn(frame,'matches').mockImplementation(selector=>selector===':hover' && hovering);
    const vector=values=>({toArray:()=>values});
    const events=new EventTarget();
    controls={enabled:true,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events),getPosition:vi.fn(()=>vector([1,2,3])),getTarget:vi.fn(()=>vector([0,1,0])),getFocalOffset:vi.fn(()=>vector([0,0,0])),setLookAt:vi.fn(),setFocalOffset:vi.fn()};
    cleanup=bindDesktopCameraInput(frame,controls);
  });
  afterEach(()=>{cleanup();container.remove();vi.restoreAllMocks();});
  it('retains desktop ownership when a view change detaches the click target', () => {
    frame.removeChild(field);
    const compute = vi.fn(); const state = { raycaster: { camera: {} } };
    computeDesktopScenePointer({ target: field, type: 'click', detail: 1, composedPath: () => [field, frame, container] }, state, null, compute);
    expect(state.raycaster.camera).toBeNull(); expect(compute).not.toHaveBeenCalled();
  });
  it('does not reuse stale pointer coordinates for keyboard clicks, while retaining scene pointer clicks', () => {
    const compute = vi.fn(); const state = { raycaster: { camera: {} } };
    computeDesktopScenePointer({ target: outside, type: 'click', detail: 0 }, state, null, compute);
    expect(compute).not.toHaveBeenCalled();
    computeDesktopScenePointer({ target: outside, type: 'click', detail: 1 }, state, null, compute);
    expect(compute).toHaveBeenCalledOnce();
  });
  it('locks on hover and restores camera input outside',()=>{
    pointer(frame,'pointerenter');expect(controls.enabled).toBe(false);
    pointer(frame,'pointerleave');expect(controls.enabled).toBe(true);
  });
  it('does not raycast through desktop buttons to the monitor beneath them',()=>{
    const compute=vi.fn();const state={raycaster:{camera:{}}};
    computeDesktopScenePointer({target:field},state,undefined,compute);
    expect(state.raycaster.camera).toBeNull();expect(compute).not.toHaveBeenCalled();
    computeDesktopScenePointer({target:outside},state,undefined,compute);
    expect(compute).toHaveBeenCalledWith({target:outside},state,undefined);
  });
  it('guards native camera listeners without cancelling scrolling or clicks',()=>{
    const camera=vi.fn();const desktop=vi.fn();
    container.addEventListener('wheel',()=>{if(controls.enabled) camera();});
    container.addEventListener('pointerdown',()=>{if(controls.enabled) camera();});
    field.addEventListener('pointerdown',desktop);
    const wheel=new Event('wheel',{bubbles:true,cancelable:true});field.dispatchEvent(wheel);
    const down=pointer(field,'pointerdown');
    expect(camera).not.toHaveBeenCalled();expect(desktop).toHaveBeenCalledOnce();
    expect(wheel.defaultPrevented).toBe(false);expect(down.defaultPrevented).toBe(false);
  });
  it('keeps keyboard focus locked after pointer exit until focus leaves',()=>{
    field.focus();pointer(frame,'pointerleave');expect(controls.enabled).toBe(false);
    outside.focus();expect(controls.enabled).toBe(true);
  });
  it('permits the first outside camera gesture to release desktop focus ownership',()=>{
    field.focus();pointer(outside,'pointerdown');expect(controls.enabled).toBe(true);
  });
  it('keeps an escaping drag locked until every pointer is released',()=>{
    pointer(field,'pointerdown',1);pointer(field,'pointerdown',2);pointer(frame,'pointerleave');
    pointer(outside,'pointerup',1);expect(controls.enabled).toBe(false);
    pointer(outside,'pointercancel',2);expect(controls.enabled).toBe(true);
  });
  it('stops manual inertia at the current camera pose on desktop entry',()=>{
    controls.dispatchEvent(new Event('controlstart'));pointer(frame,'pointerenter');
    expect(controls.getPosition).toHaveBeenCalledWith(undefined,false);
    expect(controls.setLookAt).toHaveBeenCalledWith(1,2,3,0,1,0,false);
    expect(controls.setFocalOffset).toHaveBeenCalledWith(0,0,0,false);
  });
  it('leaves programmatic view transitions running while locking manual input',()=>{
    pointer(frame,'pointerenter');expect(controls.setLookAt).not.toHaveBeenCalled();
    controls.dispatchEvent(new Event('controlstart'));controls.dispatchEvent(new Event('rest'));
    pointer(frame,'pointerleave');pointer(frame,'pointerenter');expect(controls.setLookAt).not.toHaveBeenCalled();
  });
  it('clears abandoned drags on blur and removes guards on unmount',()=>{
    pointer(field,'pointerdown');window.dispatchEvent(new Event('blur'));expect(controls.enabled).toBe(true);
    pointer(frame,'pointerenter');cleanup();expect(controls.enabled).toBe(true);
    pointer(field,'pointerdown');expect(controls.enabled).toBe(true);
  });
});
