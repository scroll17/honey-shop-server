declare module 'migrate' {
  import { EventEmitter } from 'events';

  export interface MigrationSet extends EventEmitter {
    migrations: any[];
    lastRun?: any;
    up(name: string | undefined, cb: (error: Error | null) => void): void;
    down(name: string | undefined, cb: (error: Error | null) => void): void;
  }

  export interface MigrationStore {
    save(set: MigrationSet, cb: () => void): void;
    load(cb: (error: Error | null, data: any) => void): void;
  }

  export interface MigrationLoadOptions {
    stateStore?: MigrationStore;
    migrationsDirectory?: string;
  }

  export function load(
    options: MigrationLoadOptions,
    cb: (error: Error | null, set: MigrationSet) => void
  ): void;
}
