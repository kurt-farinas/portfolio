import { playstationCollection } from '../../data/playstationCollection';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDesktopWorkspace } from '../../context/DesktopWorkspaceContext';
import { useRetroOS } from '../../context/RetroOSContext';
import { useModal } from '../../context/ModalContext';
import { portfolioCommand, portfolioProfile, portfolioProjects, awardsData } from '../../data/portfolioFacts';
import { WORD_BANK, scoreGuess, SWEEPER_LEVELS, newSweeper, revealCell, toggleFlag, chordCell } from '../../utils/retroGames';
import { newHunterGame, stepHunter, fireHunter } from '../../utils/bugHunter';
import { buildHunterPalette, drawHunter } from './bugHunterRender';
import useAppSession from './useAppSession';

export function useAppInteractionReady(appId) {
  const { activeAppId, view } = useDesktopWorkspace();
  const { bootOpen, monitorOn } = useRetroOS();
  const { selectedProjectId, resumeModalOpen, contactModalOpen, commandPaletteOpen, lightbox } = useModal();
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const change = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  return visible && activeAppId === appId && view !== 'desk' && monitorOn && !bootOpen && !selectedProjectId && !resumeModalOpen && !contactModalOpen && !commandPaletteOpen && !lightbox.isOpen;
}

export function KurtOrdleApp() {
  const ready = useAppInteractionReady('kurtordle');
  const { unlock } = useRetroOS();
  const [game, setGame] = useAppSession('kurtordle-game', { target: WORD_BANK[0], guesses: [], input: '', message: 'Guess a five-letter word in six attempts.', result: '' });
  const enter = () => {
    if (!ready || game.result) return;
    if (!/^[A-Z]{5}$/.test(game.input)) { setGame(current => ({ ...current, message: 'Enter exactly five letters.' })); return; }
    const guesses = [...game.guesses, game.input];
    const result = game.input === game.target ? 'win' : guesses.length === 6 ? 'loss' : '';
    if (result === 'win') unlock('wordsmith');
    setGame(current => ({ ...current, guesses, input: '', result, message: result === 'win' ? 'Solved: ' + game.target + '.' : result === 'loss' ? 'The word was ' + game.target + '. Try a new word.' : 'Guess ' + (guesses.length + 1) + ' of 6.' }));
  };
  const type = key => {
    if (!ready || game.result) return;
    if (key === 'Enter') { enter(); return; }
    setGame(current => ({ ...current, input: key === 'Backspace' ? current.input.slice(0, -1) : /^[A-Z]$/.test(key) ? (current.input + key).slice(0, 5) : current.input }));
  };
  const newWord = () => {
    const words = WORD_BANK.filter(word => word !== game.target);
    setGame({ target: words[Math.floor(Math.random() * words.length)], guesses: [], input: '', result: '', message: 'New word. Six attempts available.' });
  };
  // One visually hidden input takes the real keyboard (and brings up the phone keyboard when the board is tapped).
  const captureRef = useRef(null);
  useEffect(() => { if (ready) captureRef.current?.focus({ preventScroll: true }); }, [ready]);
  return <section className="retro-extra-app retro-word-game">
    <p className="desktop-eyebrow">PORTFOLIO MINI-GAME</p>
    <div className="retro-word-header"><h1>KurtOrdle</h1><button type="button" onClick={newWord}>New word</button></div>
    <p className="retro-game-instructions">Type a word · <kbd>Enter</kbd> to guess · <kbd>Backspace</kbd> to delete</p>
    <input ref={captureRef} className="retro-word-capture" aria-label="Five-letter guess" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={5} value={game.input} disabled={Boolean(game.result)}
      onKeyDown={event => {
        if (/^[a-z]$/i.test(event.key) || ['Enter', 'Backspace'].includes(event.key)) { event.preventDefault(); type(event.key.length === 1 ? event.key.toUpperCase() : event.key); }
      }}
      onChange={event => { if (ready && !game.result) setGame(current => ({ ...current, input: event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) })); }} />
    <div className="retro-word-grid" aria-label="Guess history" onClick={() => captureRef.current?.focus({ preventScroll: true })}>
      {Array.from({ length: 6 }, (_, row) => {
        const guess = game.guesses[row];
        const marks = guess ? scoreGuess(guess, game.target) : [];
        const letters = guess || (row === game.guesses.length ? game.input : '');
        return <div className="retro-word-row" key={row}>{Array.from({ length: 5 }, (_, column) => <span className={'retro-word-cell ' + (marks[column] || '')} key={column} aria-label={'Row ' + (row + 1) + ', ' + (letters[column] || 'empty') + (marks[column] ? ', ' + marks[column] : '')}>{letters[column]}</span>)}</div>;
      })}
    </div>
    <p role="status" className="retro-game-message">{game.message}</p>
    <p className="retro-word-legend">Correct: right position. Present: elsewhere in the word. Absent: no remaining match.</p>
  </section>;
}

const HUNTER_KEYS = { w: 'forward', arrowup: 'forward', s: 'back', arrowdown: 'back', a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right', q: 'strafeLeft', e: 'strafeRight' };
const HUNTER_SOUNDS = { fire: 'zap', kill: 'squish', hurt: 'hurt', wave: 'wave' };
const HUNTER_TOUCH = [['left', 'Turn left', '◀'], ['forward', 'Move forward', '▲'], ['back', 'Move back', '▼'], ['right', 'Turn right', '▶']];
// Only these fields drive the HUD and the status line, so React re-renders on them and not on every animation frame.
const hunterHud = state => [state.status, state.player.hp, state.score, state.squashed, state.wave, state.best, state.banner > 0].join('|');

export function BugHunterApp() {
  const ready = useAppInteractionReady('bughunter');
  const { theme, playSound } = useRetroOS();
  const { reducedMotion } = useDesktopWorkspace();
  const [game, setGame] = useAppSession('bughunter-v2', () => newHunterGame());
  const [size, setSize] = useState({ width: 490, height: 310 });
  const [showMap, setShowMap] = useState(false);
  const canvasRef = useRef(null);
  const gameRef = useRef(game);
  const keys = useRef(new Set());
  const palette = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return undefined;
    // Fill the (maximized) window: as wide as the arena allows, but short enough that the title, HUD and instructions stay in view.
    const scrollRoot = canvas.closest('[data-app-scroll]');
    const section = canvas.closest('.retro-extra-app');
    const fit = () => {
      const style = getComputedStyle(section);
      const byWidth = section.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 4;
      const byHeight = scrollRoot ? (scrollRoot.clientHeight - 320) / 0.63 : byWidth;
      const width = Math.max(220, Math.floor(Math.min(byWidth, byHeight)));
      setSize(current => current.width === width ? current : { width, height: Math.round(width * 0.63) });
    };
    const observer = new ResizeObserver(fit);
    observer.observe(section);
    if (scrollRoot) observer.observe(scrollRoot);
    fit();
    return () => observer.disconnect();
  }, [ready]);
  useEffect(() => {
    if (ready) canvasRef.current?.focus({ preventScroll: true });
    else keys.current.clear();
  }, [ready]);
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    palette.current = buildHunterPalette(name => css.getPropertyValue(name).trim());
  }, [theme]);
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !palette.current) return;
    drawHunter(context, gameRef.current, { width: canvas.width, height: canvas.height, palette: palette.current, time: gameRef.current.time, still: reducedMotion, showMap });
  }, [reducedMotion, showMap]);
  const commit = useCallback((state, events = []) => {
    const previous = gameRef.current;
    gameRef.current = state;
    events.forEach(event => HUNTER_SOUNDS[event] && playSound(HUNTER_SOUNDS[event]));
    if (hunterHud(previous) !== hunterHud(state)) setGame(state);
  }, [playSound, setGame]);
  useEffect(() => { draw(); }, [draw, size, theme, game]);
  // The game loop runs only while the window is focused and unobstructed, and only during play; it stops entirely otherwise.
  useEffect(() => {
    if (!ready || game.status !== 'playing' || typeof window.requestAnimationFrame !== 'function') return undefined;
    let frame = 0, last = performance.now();
    const tick = now => {
      const input = {};
      keys.current.forEach(action => { input[action] = true; });
      const { state, events } = stepHunter(gameRef.current, input, (now - last) / 1000);
      last = now;
      commit(state, events);
      draw();
      if (state.status === 'playing') frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); setGame(gameRef.current); };
  }, [ready, game.status, commit, draw, setGame]);
  const fire = () => {
    if (!ready) return;
    const { state, events } = fireHunter(gameRef.current);
    if (state !== gameRef.current) { commit(state, events); draw(); }
  };
  const restart = () => {
    keys.current.clear();
    const fresh = newHunterGame(gameRef.current.best);
    gameRef.current = fresh; setGame(fresh);
    canvasRef.current?.focus({ preventScroll: true });
  };
  const hold = (action, down) => { if (down && ready) keys.current.add(action); else keys.current.delete(action); };
  const hp = game.player.hp;
  return <section className="retro-extra-app retro-bughunter"><p className="desktop-eyebrow">PORTFOLIO MINI-GAME · FICTIONAL ARENA</p><h1>BugHunter 3D</h1>
    <p className="retro-game-instructions"><strong>Move:</strong> <kbd>W</kbd> <kbd>S</kbd> · <strong>Turn:</strong> <kbd>A</kbd> <kbd>D</kbd> · <strong>Strafe:</strong> <kbd>Q</kbd> <kbd>E</kbd> · <strong>Shoot:</strong> <kbd>Space</kbd> or click · <strong>Map:</strong> <kbd>M</kbd></p>
    <div className="retro-bug-hud" style={{ width: size.width }}>
      <span className="retro-bug-hp" role="meter" aria-label="Health" aria-valuemin={0} aria-valuemax={100} aria-valuenow={hp}><span>HP</span><span className="retro-bug-hp-track"><span className={'retro-bug-hp-fill' + (hp <= 30 ? ' is-low' : '')} style={{ width: hp + '%' }} /></span></span>
      <span>Wave {Math.max(1, game.wave)}</span><span>Score {game.score}</span><span>Best {game.best}</span>
    </div>
    <p role="status" className="retro-bug-status">Bugs squashed: {game.squashed}. {ready ? 'Ready.' : 'Paused.'}</p>
    <div className="retro-bug-arena" style={{ width: size.width }}>
      <canvas ref={canvasRef} width={size.width} height={size.height} style={{ width: size.width }} tabIndex={0} role="img"
        aria-label="BugHunter game arena. W and S move, A and D turn, Q and E strafe, Space shoots, M toggles the map." data-game-active={ready} data-game-status={game.status}
        onPointerDown={event => { event.currentTarget.focus(); fire(); }}
        onBlur={() => keys.current.clear()}
        onKeyUp={event => keys.current.delete(HUNTER_KEYS[event.key.toLowerCase()])}
        onKeyDown={event => {
          if (!ready) return;
          const key = event.key.toLowerCase();
          if (HUNTER_KEYS[key]) { event.preventDefault(); keys.current.add(HUNTER_KEYS[key]); }
          else if (key === ' ') { event.preventDefault(); fire(); }
          else if (key === 'm') { event.preventDefault(); setShowMap(value => !value); }
          else if ((key === 'r' || key === 'enter') && game.status === 'over') { event.preventDefault(); restart(); }
        }} />
      {game.status === 'ready' && <p className="retro-bug-banner is-top">A bug is napping straight ahead. Squash it to wake the swarm.</p>}
      {game.status === 'playing' && game.banner > 0 && <p className="retro-bug-banner">Wave {game.wave}</p>}
      {game.status === 'playing' && !ready && <p className="retro-bug-banner">Paused</p>}
      {game.status === 'over' && <div className="retro-bug-banner is-over"><p>Game over</p><p>Score {game.score} · Wave {game.wave}</p><button type="button" onClick={restart}>Play again</button></div>}
    </div>
    <div className="retro-bug-touch" role="group" aria-label="Touch controls">
      {HUNTER_TOUCH.map(([action, label, glyph]) => <button key={action} type="button" aria-label={label}
        onPointerDown={event => { event.preventDefault(); hold(action, true); }} onPointerUp={() => hold(action, false)} onPointerLeave={() => hold(action, false)} onPointerCancel={() => hold(action, false)}
        onContextMenu={event => event.preventDefault()}>{glyph}</button>)}
      <button type="button" className="retro-bug-fire" onPointerDown={event => { event.preventDefault(); fire(); }}>Fire</button>
    </div>
  </section>;
}

export function TerminalApp() {
  const { openApplication } = useDesktopWorkspace();
  const ready = useAppInteractionReady('terminal');
  const [history, setHistory] = useAppSession('terminal-history', []);
  const [command, setCommand] = useAppSession('terminal-command', '');
  return <section className="retro-terminal-app"><p>Simulated portfolio terminal. No commands run on your computer. Type help.</p>
    <div className="retro-terminal-output" role="log" aria-live="polite">{history.map((entry, index) => <div className="retro-terminal-entry" key={index}><p>KURT&gt; {entry.command}</p>{entry.lines.map((line, lineIndex) => <p key={lineIndex}>{line}</p>)}</div>)}</div>
    <form onSubmit={event => {
      event.preventDefault(); if (!ready || !command.trim()) return;
      const result = portfolioCommand(command);
      setHistory(current => result.clear ? [] : [...current.slice(-99), { command, lines: result.lines }]);
      setCommand(''); if (result.app) openApplication(result.app);
    }}><label>Command<input aria-label="Portfolio command" autoComplete="off" spellCheck={false} maxLength={200} value={command} onChange={event => setCommand(event.target.value)} /></label><button type="submit">Run</button></form>
  </section>;
}

export function CreditsApp() {
  const p = portfolioProfile;
  return <section className="retro-extra-app retro-credits"><p className="desktop-eyebrow">CREDITS.TXT</p><h1>Kurt-OS</h1><p>A playful portfolio interface built with React, Vite, Three.js, React Three Fiber, and Drei.</p>
    <p><strong>{p.name}</strong><br />{p.role} at {p.employer} since {p.roleStarted}.</p>
    <p>{p.education}<br />{p.educationDates}</p>
    <p>The retro desk, terminal, and mini-game arena are fictional visual themes. Gear & Collections shows the actual supplied equipment and photographs.</p>
    <p>{portfolioProjects.find(project => project.id === 'hris').caseStudy.decision}</p>
    <p>Project contribution and release details:</p><ul>{portfolioProjects.slice(0,3).map(project => <li key={project.id}>{project.title}: {project.cardSummary}</li>)}</ul>
    <ul>{awardsData.map(award => <li key={award.id}>{award.title} · {award.issuer}</li>)}</ul>
    <h2>PlayStation cover artwork</h2><p>Original North American PS1 covers, sourced from the Libretro thumbnails archive. Artwork and trademarks belong to their respective owners; the shelf is a stylized scene.</p>
    <ul>{playstationCollection.map(game => <li key={game.id}><a href={game.source} target="_blank" rel="noopener noreferrer">{game.title} cover source</a></li>)}</ul>
    <p>3D portfolio concept inspiration: <a href="https://henryheffernan.com/" target="_blank" rel="noopener noreferrer">Henry Heffernan</a>.</p>
    <a href={p.resume} target="_blank" rel="noopener noreferrer">Open actual résumé PDF</a>
  </section>;
}

function sweeperCellName(cell, row, col) {
  const place = 'Row ' + (row + 1) + ', column ' + (col + 1) + ', ';
  if (cell.flag) return place + 'flagged';
  if (!cell.open) return place + 'hidden';
  if (cell.bug) return place + 'bug';
  return place + (cell.adjacent ? cell.adjacent + (cell.adjacent === 1 ? ' bug' : ' bugs') + ' nearby' : 'empty');
}

const SWEEPER_TILE = 44;
const lcd = value => (value < 0 ? '-' + String(Math.min(99, -value)).padStart(2, '0') : String(Math.min(999, value)).padStart(3, '0'));

export function BugsweeperApp() {
  const ready = useAppInteractionReady('bugsweeper');
  const { unlock, playSound } = useRetroOS();
  const [game, setGame] = useAppSession('bugsweeper-game', () => newSweeper());
  const [bestTimes, setBestTimes] = useAppSession('bugsweeper-best', {});
  const [flagMode, setFlagMode] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [room, setRoom] = useState(0);
  const sectionRef = useRef(null);
  const cells = useRef([]);
  const flags = game.cells.filter(cell => cell.flag).length;
  // Larger boards are offered only when their 44px tiles fit the window without sideways scrolling.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const fit = () => {
      const style = getComputedStyle(section);
      setRoom(section.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0));
    };
    fit();
    if (typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(fit);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  const fits = level => level === 'easy' || !(room > 0) || SWEEPER_LEVELS[level].cols * SWEEPER_TILE + 14 <= room;
  // The clock only runs while the board is in play and the window can take input.
  useEffect(() => {
    if (!ready || !game.started || game.status !== 'playing') return undefined;
    const timer = setInterval(() => setGame(current => current.started && current.status === 'playing' ? { ...current, elapsed: Math.min(999, current.elapsed + 1) } : current), 1000);
    return () => clearInterval(timer);
  }, [ready, game.started, game.status, setGame]);
  useEffect(() => {
    if (!pressing) return undefined;
    const release = () => setPressing(false);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => { window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); };
  }, [pressing]);
  const startBoard = (level = game.level) => { setGame(newSweeper(SWEEPER_LEVELS[level] ? level : 'easy')); setFocusIndex(0); };
  const act = (index, flag = flagMode) => {
    if (!ready) return;
    const cell = game.cells[index];
    const next = flag && !cell.open ? toggleFlag(game, index) : cell.open ? chordCell(game, index) : revealCell(game, index);
    if (next === game) return;
    if (next.status === 'won' && game.status !== 'won') {
      unlock('exterminator');
      setBestTimes(best => best[game.level] === undefined || next.elapsed < best[game.level] ? { ...best, [game.level]: next.elapsed } : best);
    }
    if (next.status === 'lost') playSound('hurt');
    setGame(next);
  };
  // Opening the game puts keyboard focus on the current tile so arrows, Enter and F work immediately.
  useEffect(() => { if (ready) cells.current[focusIndex]?.focus({ preventScroll: true }); }, [ready]);
  // Roving focus: arrow keys move between tiles, Enter/Space reveal (native button), F flags.
  const move = (event, index) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -game.cols, ArrowDown: game.cols }[event.key];
    if (step !== undefined) {
      event.preventDefault();
      const next = index + step;
      const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
      if (next >= 0 && next < game.cells.length && (!horizontal || Math.floor(next / game.cols) === Math.floor(index / game.cols))) { setFocusIndex(next); cells.current[next]?.focus(); }
    } else if (event.key.toLowerCase() === 'f') { event.preventDefault(); act(index, true); }
  };
  const bugsLeft = game.bugs - flags;
  const status = game.status === 'won' ? 'Board cleared in ' + game.elapsed + 's. Every bug found.' : game.status === 'lost' ? 'A bug got loose. Start a new board.' : bugsLeft + ' bugs left';
  const face = game.status === 'lost' ? 'x_x' : game.status === 'won' ? 'B-)' : pressing ? ':-O' : ':-)';
  const best = bestTimes[game.level];
  return <section ref={sectionRef} className="retro-extra-app retro-sweeper"><p className="desktop-eyebrow">BUGSWEEPER</p><h1>Bugsweeper</h1>
    <p>Clear every safe tile; numbers count nearby bugs. Right-click, press F, or use Flag mode to flag. Click a fully flagged number to clear around it.</p>
    <div className="retro-sweeper-levels" role="group" aria-label="Difficulty">
      {Object.entries(SWEEPER_LEVELS).map(([key, level]) => <button key={key} type="button" aria-pressed={game.level === key} disabled={!fits(key)} onClick={() => startBoard(key)}
        title={fits(key) ? undefined : 'Widen the window for this board'}>{level.label} <span className="retro-sweeper-size">{level.cols}×{level.rows}</span></button>)}
    </div>
    <div className="retro-sweeper-frame">
      <div className="retro-sweeper-bar">
        <span className="retro-sweeper-lcd" role="img" aria-label={bugsLeft + ' bugs left'}>{lcd(bugsLeft)}</span>
        <button type="button" className="retro-sweeper-face" onClick={() => startBoard()} aria-label="New Bugsweeper board">{face}</button>
        <span className="retro-sweeper-lcd" role="img" aria-label={'Time ' + game.elapsed + ' seconds'}>{lcd(game.elapsed)}</span>
      </div>
      <div className="retro-sweeper-board" role="grid" aria-label="Bugsweeper board" style={{ gridTemplateColumns: 'repeat(' + game.cols + ', ' + SWEEPER_TILE + 'px)' }}
        onPointerDown={event => { if (event.button === 0 && game.status === 'playing') setPressing(true); }}>
        {game.cells.map((cell, index) => {
          const row = Math.floor(index / game.cols), col = index % game.cols;
          const wrongFlag = game.status === 'lost' && cell.flag && !cell.bug;
          const className = 'retro-sweeper-cell' + (cell.open ? ' is-open' : '') + (cell.open && cell.bug ? ' is-bug' : '') + (index === game.exploded ? ' is-exploded' : '') + (wrongFlag ? ' is-wrong' : '') + (cell.open && !cell.bug && cell.adjacent ? ' n' + cell.adjacent : '');
          return <button key={index} ref={node => { cells.current[index] = node; }} type="button" role="gridcell" tabIndex={index === focusIndex ? 0 : -1} className={className}
            aria-label={sweeperCellName(cell, row, col) + (wrongFlag ? ', no bug here' : '')} onFocus={() => setFocusIndex(index)}
            onClick={() => act(index)} onContextMenu={event => { event.preventDefault(); act(index, true); }} onKeyDown={event => move(event, index)}>
            {wrongFlag ? '✕' : cell.flag ? '⚑' : cell.open ? (cell.bug ? '✱' : cell.adjacent || '') : ''}
          </button>;
        })}
      </div>
    </div>
    <div className="retro-sweeper-footer">
      <span className="retro-sweeper-counter" aria-live="polite">{status}</span>
      <button type="button" aria-pressed={flagMode} onClick={() => setFlagMode(value => !value)}>Flag mode: {flagMode ? 'On' : 'Off'}</button>
      <span className="retro-sweeper-best">Best {SWEEPER_LEVELS[game.level]?.label || ''}: {best === undefined ? '—' : best + 's'}</span>
    </div>
  </section>;
}
