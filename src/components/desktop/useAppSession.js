import { useCallback, useState } from 'react';
import { useDesktopWorkspace } from '../../context/DesktopWorkspaceContext';

export default function useAppSession(key, initial) {
  const { getAppState, setAppState } = useDesktopWorkspace();
  const [state, setState] = useState(() => getAppState(key, typeof initial === 'function' ? initial() : initial));
  const update = useCallback(next => setState(previous => {
    const value = typeof next === 'function' ? next(previous) : next;
    setAppState(key, value);
    return value;
  }), [key, setAppState]);
  return [state, update];
}
