import Mocha from 'mocha';
import fs from 'fs';
import path from 'path';
import logger from '../logger';
import { setup, teardown } from './setup';

/**
 * Run tests from './test' directory
 */
export async function runTests(pattern?: RegExp) {
  const mocha = new Mocha();

  try {
    logger.info('Setup tests');

    await Promise.all([setup(), collectTestFiles((file) => mocha.addFile(file), __dirname, pattern)]);

    const failures = await new Promise<number>((resolve) => mocha.run(resolve));
    if (failures) throw new Error('Tests are failed');
  } catch (error) {
    logger.fatal(error, 'tests did crashed');
    throw error;
  } finally {
    logger.info('Teardown tests');
    await teardown();
  }
}

/**
 * Recursively traverse specified directory and collect all *.test.ts files
 */
function collectTestFiles(addFileCallback: (filename: string) => void, dir: string, pattern?: RegExp) {
  logger.debug('Collect tests: %s', dir);

  return new Promise((resolve, reject) => {
    const promises: Promise<any>[] = [];

    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
      if (err) return reject(err);

      for (const file of files) {
        const filepath = path.join(dir, file.name);

        if (file.isDirectory()) {
          promises.push(collectTestFiles(addFileCallback, filepath, pattern));
        } else if (filepath.endsWith('.test.ts')) {
          if (pattern && !pattern.test(filepath)) continue;
          addFileCallback(filepath);
        }
      }

      Promise.all(promises).then(resolve);
    });
  });
}
