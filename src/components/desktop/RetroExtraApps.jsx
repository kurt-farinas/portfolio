import { playstationCollection } from '../../data/playstationCollection';
import React, { useEffect, useRef, useState } from 'react';
import { useDesktopWorkspace } from '../../context/DesktopWorkspaceContext';
import { useRetroOS } from '../../context/RetroOSContext';
import { useModal } from '../../context/ModalContext';
import { portfolioCommand, portfolioProfile, portfolioProjects, awardsData } from '../../data/portfolioFacts';
import { WORD_BANK, scoreGuess, INITIAL_BUG_GAME, moveBugPlayer, bugCanBeHit, nextBugTarget, rayDistance, newSweeper, revealCell, toggleFlag } from '../../utils/retroGames';
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

export function BugHunterApp() {
  const ready = useAppInteractionReady('bughunter');
  const { theme, playSound } = useRetroOS();
  const { reducedMotion } = useDesktopWorkspace();
  const [game, setGame] = useAppSession('bughunter-game', INITIAL_BUG_GAME);
  const [flash, setFlash] = useState(false);
  const [size, setSize] = useState({ width: 490, height: 310 });
  const canvasRef = useRef(null);
  const flashTimer = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return undefined;
    // Fill the (maximized) window: as wide as the arena allows, but short enough that the title and instructions stay in view.
    const scrollRoot = canvas.closest('[data-app-scroll]');
    const section = canvas.closest('.retro-extra-app');
    const fit = () => {
      const style = getComputedStyle(section);
      const byWidth = section.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 4;
      const byHeight = scrollRoot ? (scrollRoot.clientHeight - 170) / 0.63 : byWidth;
      const width = Math.max(220, Math.floor(Math.min(byWidth, byHeight)));
      setSize(current => current.width === width ? current : { width, height: Math.round(width * 0.63) });
    };
    const observer = new ResizeObserver(fit);
    observer.observe(section);
    if (scrollRoot) observer.observe(scrollRoot);
    fit();
    return () => observer.disconnect();
  }, [ready]);
  // Opening the app hands keyboard focus straight to the arena so WASD and Space work immediately.
  useEffect(() => {
    if (ready) canvasRef.current?.focus({ preventScroll: true });
  }, [ready]);
  useEffect(() => {
    if (!ready) { clearTimeout(flashTimer.current); setFlash(false); }
    return () => clearTimeout(flashTimer.current);
  }, [ready]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const css = getComputedStyle(document.documentElement);
    const color = name => css.getPropertyValue('--game-' + name).trim();
    const { width, height } = size;
    const fov = Math.PI / 3;
    context.fillStyle = color('ceiling'); context.fillRect(0, 0, width, height / 2);
    context.fillStyle = color('floor'); context.fillRect(0, height / 2, width, height / 2);
    const depths = [];
    for (let column = 0; column < width; column += 3) {
      const relative = (column / width - 0.5) * fov;
      const distance = rayDistance(game.player, game.player.dir + relative);
      depths[Math.floor(column / 3)] = distance;
      const wallHeight = Math.min(height, height * 0.72 / Math.max(0.2, distance * Math.cos(relative)));
      context.fillStyle = color('wall'); context.globalAlpha = Math.max(0.3, 1 - distance / 12);
      context.fillRect(column, (height - wallHeight) / 2, 3, wallHeight);
    }
    context.globalAlpha = 1;
    const angle = Math.atan2(game.target.y - game.player.y, game.target.x - game.player.x);
    const relative = Math.atan2(Math.sin(angle - game.player.dir), Math.cos(angle - game.player.dir));
    const distance = Math.hypot(game.target.x - game.player.x, game.target.y - game.player.y);
    const x = (0.5 + relative / fov) * width;
    if (Math.abs(relative) < fov / 2 && distance <= (depths[Math.floor(x / 3)] || 0) + 0.06) {
      const radius = Math.max(10, Math.min(35, 38 / distance));
      context.fillStyle = color('target'); context.beginPath(); context.arc(x, height / 2, radius, 0, Math.PI * 2); context.fill();
      context.fillStyle = color('ink'); context.font = '700 13px monospace'; context.textAlign = 'center'; context.fillText('BUG', x, height / 2 + 4);
    }
    context.strokeStyle = color('crosshair'); context.lineWidth = 2; context.beginPath();
    context.moveTo(width / 2 - 8, height / 2); context.lineTo(width / 2 + 8, height / 2);
    context.moveTo(width / 2, height / 2 - 8); context.lineTo(width / 2, height / 2 + 8); context.stroke();
    if (flash && !reducedMotion) { context.fillStyle = color('crosshair'); context.fillRect(width / 2 - 18, height - 25, 36, 25); }
  }, [game, size, ready, flash, theme, reducedMotion]);
  const input = key => {
    if (!ready) return;
    if (key === 'fire') {
      playSound('key');
      if (!reducedMotion) { clearTimeout(flashTimer.current); setFlash(true); flashTimer.current = setTimeout(() => setFlash(false), 100); }
      setGame(current => bugCanBeHit(current.player, current.target) ? { ...current, score: current.score + 1, target: nextBugTarget(current.player) } : current);
    } else setGame(current => ({ ...current, player: moveBugPlayer(current.player, key) }));
  };
  return <section className="retro-extra-app"><p className="desktop-eyebrow">PORTFOLIO MINI-GAME · FICTIONAL ARENA</p><h1>BugHunter 3D</h1>
    <p className="retro-game-instructions"><strong>Move:</strong> <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> · <strong>Shoot:</strong> <kbd>Space</kbd></p>
    <p role="status">Bugs squashed: {game.score}. {ready ? 'Ready.' : 'Paused.'}</p>
    <div className="retro-bug-arena"><canvas ref={canvasRef} width={size.width} height={size.height} style={{ width: size.width }} tabIndex={0} role="img" aria-label="BugHunter game arena. W A S D to move; Space to shoot." data-game-active={ready} onPointerDown={event => { event.currentTarget.focus(); input('fire'); }} onKeyDown={event => {
      if (!ready) return;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d','W','A','S','D',' '].includes(event.key)) { event.preventDefault(); input(event.key === ' ' ? 'fire' : event.key.length === 1 ? event.key.toLowerCase() : event.key); }
    }} /></div>
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

export function BugsweeperApp() {
  const ready = useAppInteractionReady('bugsweeper');
  const { unlock } = useRetroOS();
  const [game, setGame] = useAppSession('bugsweeper-game', () => newSweeper());
  const [flagMode, setFlagMode] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const cells = useRef([]);
  const flags = game.cells.filter(cell => cell.flag).length;
  const act = (index, flag = flagMode) => {
    if (!ready) return;
    const next = flag ? toggleFlag(game, index) : revealCell(game, index);
    if (next.status === 'won' && game.status !== 'won') unlock('exterminator');
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
  const status = game.status === 'won' ? 'Board cleared. Every bug found.' : game.status === 'lost' ? 'A bug got loose. Start a new board.' : (game.bugs - flags) + ' bugs left';
  return <section className="retro-extra-app retro-sweeper"><p className="desktop-eyebrow">BUGSWEEPER</p><h1>Bugsweeper</h1>
    <p>Reveal every safe tile. Numbers count the bugs around a tile. Right-click, press F, or turn on Flag mode to mark a bug.</p>
    <div className="retro-sweeper-bar">
      <span className="retro-sweeper-counter" aria-live="polite">{status}</span>
      <button type="button" onClick={() => { setGame(newSweeper()); setFocusIndex(0); }} aria-label="New Bugsweeper board">{game.status === 'lost' ? 'x_x' : game.status === 'won' ? 'B-)' : ':-)'}</button>
      <button type="button" aria-pressed={flagMode} onClick={() => setFlagMode(value => !value)}>Flag mode: {flagMode ? 'On' : 'Off'}</button>
    </div>
    <div className="retro-sweeper-board" role="grid" aria-label="Bugsweeper board" style={{ gridTemplateColumns: 'repeat(' + game.cols + ', 44px)' }}>
      {game.cells.map((cell, index) => {
        const row = Math.floor(index / game.cols), col = index % game.cols;
        return <button key={index} ref={node => { cells.current[index] = node; }} type="button" role="gridcell" tabIndex={index === focusIndex ? 0 : -1}
          className={'retro-sweeper-cell' + (cell.open ? ' is-open' : '') + (cell.open && cell.bug ? ' is-bug' : '')}
          aria-label={sweeperCellName(cell, row, col)} onFocus={() => setFocusIndex(index)}
          onClick={() => act(index)} onContextMenu={event => { event.preventDefault(); act(index, true); }} onKeyDown={event => move(event, index)}>
          {cell.flag ? '⚑' : cell.open ? (cell.bug ? '✱' : cell.adjacent || '') : ''}
        </button>;
      })}
    </div>
  </section>;
}
