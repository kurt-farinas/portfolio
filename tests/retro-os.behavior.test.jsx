import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ModalProvider, useModal } from '../src/context/ModalContext';
import { DesktopWorkspaceProvider, useDesktopWorkspace } from '../src/context/DesktopWorkspaceContext';
import { RetroOSProvider, useRetroOS } from '../src/context/RetroOSContext';
import DesktopWorkspace from '../src/components/desktop/DesktopWorkspace';
import BootScreen from '../src/components/desktop/BootScreen';
import { createSweeperBoard } from '../src/utils/retroGames';
import { portfolioCommand, portfolioProjects, portfolioProfile } from '../src/data/portfolioFacts';
import { scoreGuess, isWalkable, moveBugPlayer, bugCanBeHit } from '../src/utils/retroGames';

describe('retro portfolio rules', () => {
  it('counts duplicate letters only while matches remain', () => {
    expect(scoreGuess('ARRAY', 'REACT')).toEqual(['present','present','absent','absent','absent']);
    expect(scoreGuess('REACT', 'REACT')).toEqual(Array(5).fill('correct'));
  });
  it('uses canonical projects, ownership, education, and links', () => {
    expect(portfolioProjects.map(project => project.id)).toEqual(['pmpc-pis','pmpc-workforce','pmpc-gen-mdse','hris','gym','job-hunt-ledger']);
    expect(portfolioCommand('education').lines.join(' ')).toContain('STI College San Jose');
    expect(portfolioCommand('experience').lines.join(' ')).toContain('Denver Ballesteros');
    const all = ['education','experience','projects','whoami','skills'].flatMap(command => portfolioCommand(command).lines).join(' ');
    expect(all).not.toMatch(/CLSU|Magna Cum Laude|1\.34|Workout Tracker|https:\/\/pmpc\.ph/);
    expect(all).toContain('342'); expect(all).toContain('98/100');
    expect(portfolioProfile.roleStarted).toBe('September 16, 2026');
    expect(portfolioCommand('resume').app).toBe('resume');
  });
  it('bounds movement and blocks shots through walls', () => {
    expect(isWalkable(-1,100)).toBe(false);
    const player = { x: 1.1, y: 1.5, dir: Math.PI };
    expect(moveBugPlayer(player,'w')).toBe(player);
    expect(bugCanBeHit({ x: 1.5, y: 2.5, dir: 0 }, { x: 3.5, y: 2.5 })).toBe(false);
    expect(bugCanBeHit({ x: 3.5, y: 3.5, dir: 0 }, { x: 6.5, y: 3.5 })).toBe(true);
  });
});

function Harness() {
  const workspace = useDesktopWorkspace(); const modal = useModal(); const retro = useRetroOS();
  return <><button onClick={() => workspace.openApplication('kurtordle')}>Launch word game</button><button onClick={() => workspace.openApplication('bughunter')}>Launch bug game</button><button onClick={() => workspace.openApplication('terminal')}>Launch terminal</button><button onClick={() => workspace.openApplication('about')}>Launch about</button><button onClick={() => modal.openResumeModal()}>Test open modal</button><button onClick={modal.closeResumeModal}>Test close modal</button><button onClick={() => retro.setContactDraft({ name:'Recruiter', email:'recruiter@example.com', message:'A test portfolio inquiry.' })}>Fill test draft</button><button onClick={retro.replayBoot}>Replay test boot</button><DesktopWorkspace presentation="workspace" theme="dark" /><BootScreen /></>;
}

describe('retro portfolio apps', () => {
  let host, root, originalMedia, originalWidth, originalAudio, oldShow, oldClose;
  const typeGuess=async word=>{const input=host.querySelector('[aria-label="Five-letter guess"]');for(const key of [...word,'Enter']) await act(async()=>input.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true})));};
  const canvas = { fillRect:vi.fn(), beginPath:vi.fn(), arc:vi.fn(), fill:vi.fn(), fillText:vi.fn(), moveTo:vi.fn(), lineTo:vi.fn(), stroke:vi.fn() };
  const audioConstructor = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
    vi.stubGlobal('CSS',{escape:value=>value});
    Element.prototype.scrollIntoView=vi.fn();
    originalMedia=window.matchMedia; originalWidth=window.innerWidth; originalAudio=window.AudioContext;
    Object.defineProperty(window,'innerWidth',{ configurable:true,value:375 });
    window.matchMedia=query=>({matches:false,media:query,addEventListener:vi.fn(),removeEventListener:vi.fn()});
    vi.spyOn(document,'hidden','get').mockReturnValue(false);
    vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(canvas);
    vi.stubGlobal('ResizeObserver',class { observe() {} disconnect() {} });
    oldShow=HTMLDialogElement.prototype.showModal; oldClose=HTMLDialogElement.prototype.close;
    HTMLDialogElement.prototype.showModal=function(){this.open=true;}; HTMLDialogElement.prototype.close=function(){this.open=false;};
    audioConstructor.mockClear();
    window.AudioContext=class { constructor(){audioConstructor();this.currentTime=0;this.destination={};} resume(){return Promise.resolve();} close(){return Promise.resolve();} createOscillator(){return{frequency:{value:0},connect:vi.fn(),disconnect:vi.fn(),start:vi.fn(),stop:vi.fn()};} createGain(){return{gain:{setValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()},connect:vi.fn(),disconnect:vi.fn()};} };
    host=document.createElement('div'); document.body.append(host); root=createRoot(host); sessionStorage.clear();
  });
  afterEach(async()=>{
    await act(async()=>root.unmount());host.remove();
    window.matchMedia=originalMedia; Object.defineProperty(window,'innerWidth',{configurable:true,value:originalWidth});window.AudioContext=originalAudio;
    HTMLDialogElement.prototype.showModal=oldShow;HTMLDialogElement.prototype.close=oldClose;
    vi.restoreAllMocks();vi.unstubAllGlobals();sessionStorage.clear();localStorage.clear();
  });
  const mount=async(path='/#terminal')=>act(async()=>root.render(<MemoryRouter initialEntries={[path]}><ThemeProvider><ModalProvider><DesktopWorkspaceProvider><RetroOSProvider><Harness /></RetroOSProvider></DesktopWorkspaceProvider></ModalProvider></ThemeProvider></MemoryRouter>));
  const click=async text=>act(async()=>{const button=[...host.querySelectorAll('button')].find(element=>element.textContent===text);expect(button,'button '+text).toBeTruthy();button.click();});

  it('bypasses boot on direct routes and starts audio only after explicit opt-in',async()=>{
    await mount('/projects');expect(host.querySelector('.retro-boot').open).toBe(false);expect(audioConstructor).not.toHaveBeenCalled();
    await click('Replay test boot');expect(host.querySelector('.retro-boot').open).toBe(true);
    await click('Sound: Off');expect(audioConstructor).toHaveBeenCalledTimes(1);
    await click('Enter desktop');expect(host.querySelector('.retro-boot').open).toBe(false);expect(sessionStorage.getItem('kurt-os-boot-seen')).toBe('true');
    expect(host.querySelector('.desktop-window.is-active').dataset.appId).toBe('projects');
  });
  it('plays the four-note boot chime when the boot finishes with sound on',async()=>{
    await mount('/');const oscillators=vi.spyOn(window.AudioContext.prototype,'createOscillator');
    await click('Sound: Off');const afterToggle=oscillators.mock.calls.length;
    await click('Enter desktop');expect(oscillators.mock.calls.length-afterToggle).toBe(4);
  });
  it('shows an immediately usable first-visit boot and keeps audio off',async()=>{
    await mount('/');expect(host.querySelector('.retro-boot').open).toBe(true);
    await click('Enter desktop');expect(host.querySelector('.retro-boot').open).toBe(false);expect(audioConstructor).not.toHaveBeenCalled();
  });
  it('unlocks the Wordsmith achievement once, for this session only',async()=>{
    await mount('/#kurtordle');
    await typeGuess('REACT');
    expect(JSON.parse(sessionStorage.getItem('kurt-os-achievements'))).toEqual(['wordsmith']);
  });
  it('unlocks Exterminator after clearing a Bugsweeper board',async()=>{
    await mount('/#bugsweeper');
    const seeded=seed=>()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
    const random=vi.spyOn(Math,'random').mockImplementation(seeded(11));
    const tiles=()=>[...host.querySelectorAll('.retro-sweeper-cell')];
    await act(async()=>tiles()[31].click());
    random.mockRestore();
    const board=createSweeperBoard(9,7,10,31,seeded(11));
    for(const [index,cell] of board.entries()) if(!cell.bug) await act(async()=>tiles()[index].click());
    expect(host.querySelector('.retro-sweeper-counter').textContent).toContain('Board cleared');
    expect(JSON.parse(sessionStorage.getItem('kurt-os-achievements'))).toContain('exterminator');
  });
  it('preserves a solved word game when it is closed and reopened',async()=>{
    await mount('/#kurtordle');
    await typeGuess('REACT');expect(host.querySelector('.retro-game-message').textContent).toContain('Solved: REACT');
    await act(async()=>host.querySelector('[aria-label="Close KurtOrdle window"]').click());await click('Launch word game');
    expect(host.querySelector('.retro-game-message').textContent).toContain('Solved: REACT');
  });
  it('pauses game input behind a modal and when its window is inactive',async()=>{
    await mount('/#bughunter');const arena=host.querySelector('canvas');
    await act(async()=>arena.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true})));
    expect(host.querySelector('[data-app-scroll="bughunter"]').textContent).toContain('Bugs squashed: 1');
    await click('Test open modal');expect(arena.dataset.gameActive).toBe('false');
    await act(async()=>arena.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true})));
    expect(host.querySelector('[data-app-scroll="bughunter"]').textContent).toContain('Bugs squashed: 1');
    await click('Test close modal');await click('Launch about');expect(arena.dataset.gameActive).toBe('false');
  });
  it('renders terminal input as escaped text and retains its history across reopening',async()=>{
    await mount('/#terminal');
    const command=host.querySelector('[aria-label="Portfolio command"]');
    await act(async()=>{
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(command,'<img src=x onerror=alert(1)>');
      command.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await act(async()=>command.closest('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
    expect(host.querySelector('.retro-terminal-output').textContent).toContain('<img src=x onerror=alert(1)>');
    expect(host.querySelector('.retro-terminal-output img')).toBeNull();
    await act(async()=>host.querySelector('[aria-label="Close Terminal window"]').click());await click('Launch terminal');
    expect(host.querySelector('.retro-terminal-output').textContent).toContain('<img src=x onerror=alert(1)>');
  });
  it('keeps contact drafts on server failure and clears them only after success',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce({ok:true,json:async()=>({success:false,message:'Please try again.'})}).mockResolvedValueOnce({ok:true,json:async()=>({success:true})}));
    await mount('/#contact');await click('Fill test draft');
    await act(async()=>host.querySelector('.retro-mail-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
    expect(host.querySelector('.retro-mail-status').textContent).toBe('Please try again.');expect(host.querySelector('input[name="name"]').value).toBe('Recruiter');
    await act(async()=>host.querySelector('.retro-mail-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
    expect(host.querySelector('.retro-mail-status').textContent).toContain('Message sent');expect(host.querySelector('input[name="name"]').value).toBe('');expect(fetch).toHaveBeenCalledTimes(2);
  });
});
