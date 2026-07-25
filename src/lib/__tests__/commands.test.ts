import { registerCommand, getCommands, clearCommands, hasCommand, type Command } from '../commands';

beforeEach(() => {
  clearCommands();
});

describe('commands registry', () => {
  it('starts empty', () => {
    expect(getCommands()).toHaveLength(0);
  });

  it('registers a command', () => {
    const cmd: Command = {
      id: 'test',
      label: 'Test Command',
      keywords: ['test'],
      action: jest.fn(),
    };
    registerCommand(cmd);
    expect(getCommands()).toHaveLength(1);
    expect(getCommands()[0].id).toBe('test');
  });

  it('does not register duplicate commands', () => {
    const cmd: Command = {
      id: 'dup',
      label: 'Dup',
      keywords: [],
      action: jest.fn(),
    };
    registerCommand(cmd);
    registerCommand(cmd);
    expect(getCommands()).toHaveLength(1);
  });

  it('registers multiple distinct commands', () => {
    registerCommand({ id: 'a', label: 'A', keywords: [], action: jest.fn() });
    registerCommand({ id: 'b', label: 'B', keywords: [], action: jest.fn() });
    expect(getCommands()).toHaveLength(2);
  });

  it('hasCommand returns true for registered command', () => {
    registerCommand({ id: 'x', label: 'X', keywords: [], action: jest.fn() });
    expect(hasCommand('x')).toBe(true);
  });

  it('hasCommand returns false for unregistered command', () => {
    expect(hasCommand('missing')).toBe(false);
  });

  it('clearCommands empties the registry', () => {
    registerCommand({ id: 'a', label: 'A', keywords: [], action: jest.fn() });
    registerCommand({ id: 'b', label: 'B', keywords: [], action: jest.fn() });
    clearCommands();
    expect(getCommands()).toHaveLength(0);
  });

  it('returns a readonly array', () => {
    const cmds = getCommands();
    expect(Object.isFrozen(cmds)).toBe(false);
  });
});
