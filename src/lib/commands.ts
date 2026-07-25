export interface Command {
  id: string;
  label: string;
  keywords: string[];
  action: () => void;
}

const commands: Command[] = [];

export function registerCommand(command: Command): void {
  if (!hasCommand(command.id)) {
    commands.push(command);
  }
}

export function getCommands(): readonly Command[] {
  return commands;
}

export function clearCommands(): void {
  commands.length = 0;
}

export function hasCommand(id: string): boolean {
  return commands.some((c) => c.id === id);
}
