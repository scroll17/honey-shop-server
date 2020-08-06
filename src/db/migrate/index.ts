/*external modules*/
import path from 'path';
import migrate from 'migrate';
import { PoolClient } from 'pg';
import templateGenerator from 'migrate/lib/template-generator';
/*DB*/
import { customStateStorage } from './store';
import { getClient, getClientTransaction } from '../index';
/*other*/
import { config } from '../../config';
import logger from '../../logger';

enum MigrateCommand {
  Up = 'up',
  Down = 'down',
  Create = 'create',
  Drop = 'drop',
}

const migrationsDir = path.join(__dirname, '../migrations');

export function run(cb: (db: PoolClient, schema: string) => Promise<void>): () => Promise<void> {
  return async () => {
    try {
      await getClientTransaction(cb);
    } catch (error) {
      logger.fatal('Cannot run migration', error);
      throw error;
    }
  };
}

export function runMigrations(): Promise<void> {
  return execMigrate(MigrateCommand.Up);
}

export function execMigrate(cmd: MigrateCommand, args: string[] = []): Promise<void> {
  if (cmd === MigrateCommand.Drop) {
    if (config.postgres.disableDrop) {
      throw new Error(
        'DB drop is disabled in current environment. Set postgres.disableDrop to false to enable'
      );
    }

    logger.warn('Dropping current DB. Do you want to continues? [y/n]');

    return new Promise((resolve, reject) => {
      process.stdin.once('data', async (data) => {
        process.stdin.unref();

        if (data.toString('utf8').trim() !== 'y') {
          logger.info('Aborting schema drop');
          return resolve();
        }

        try {
          await getClient(async (client) => {
            await client.query(`DROP SCHEMA ${config.postgres.schema} CASCADE`);
          });

          logger.info(`Schema ${config.postgres.schema} was successfully dropped`);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  return new Promise((resolve, reject) => {
    const options = {
      stateStore: customStateStorage,
      migrationsDirectory: migrationsDir,
    };

    migrate.load(options, async (error, set) => {
      if (error) {
        logger.fatal('Cannot execute migrate cmd:', error);
        reject(error);
      }

      set.on('migration', (migration, direction) => {
        logger.debug(`${direction}: ${migration.title}`);
      });

      logger.info(`Migrate exec '${cmd}'`);

      switch (cmd) {
        case MigrateCommand.Down:
          if (args.length === 0) {
            logger.warn('Down without args drop all tables!. Do you want to continues? [y/n]');

            await new Promise((resolve1, reject1) => {
              process.stdin.once('data', async (data) => {
                process.stdin.unref();

                if (data.toString('utf8').trim() !== 'y') {
                  logger.info('Aborting down DB.');
                  return resolve();
                }

                try {
                  set[cmd](args[0], (cmdError) => {
                    if (cmdError) {
                      logger.fatal('Migration did crashed:', cmdError);
                      reject1(cmdError);
                    } else {
                      resolve1();
                    }
                  });
                } catch (error) {
                  reject1(error);
                }
              });
            });
          } else {
            set[cmd](args[0], (cmdError) => {
              if (cmdError) {
                logger.fatal('Migration did crashed:', cmdError);
                reject(cmdError);
              } else {
                resolve();
              }
            });
          }

          break;
        case MigrateCommand.Up: {
          set[cmd](args[0], (cmdError) => {
            if (cmdError) {
              logger.fatal('Migration did crashed:', cmdError);
              reject(cmdError);
            } else {
              resolve();
            }
          });

          break;
        }
        case MigrateCommand.Create: {
          if (args.length === 0) {
            logger.fatal('Please provide migration name');
            return reject(new Error('Please provide migration name'));
          }

          templateGenerator(
            {
              name: args[0],
              templateFile: path.join(__dirname, 'template.js'),
              migrationsDirectory: migrationsDir,
              extension: '.ts',
            },
            (genError, path) => {
              if (genError) {
                logger.fatal('cannot create migrattion: ', genError);
                reject(genError);
              } else {
                logger.info(`create migration at ${path}`);
                resolve();
              }
            }
          );
          break;
        }
        default: {
          logger.warn(`Command "${cmd}" is not implemented`);
          reject(new Error(`migrate command "${cmd}" not implemented`));
        }
      }
    });
  });
}
