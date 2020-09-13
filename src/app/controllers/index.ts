/*external modules*/
import fs from 'fs';
import path from 'path';
import { Application } from 'express';
/*@core*/
import { IClass } from '../core/decorators';
import { applyControllers } from '../core';
/*other*/
import { ServerError } from '../error';

export default class ServiceController {
  private static controllers: Array<IClass> = [];
  public static buildStatistic = false;

  private static async load(): Promise<Record<string, unknown>[]> {
    return new Promise(async (resolve) => {
      const files = fs.readdirSync(__dirname);

      Promise.all(
        files.map(async (fileName) => {
          const fullPath = path.join(__dirname, fileName);

          if (fs.statSync(fullPath).isDirectory()) {
            const controllerPath = path.join(fullPath, 'index.ts');
            const pathExist = fs.existsSync(controllerPath);

            if (pathExist) {
              const { default: controller } = await import(controllerPath);

              if (!controller) {
                throw new ServerError(`${controllerPath} not exported class by default.`);
              }

              ServiceController.registerController(controller);
            } else {
              throw new ServerError(`index file by path: "${fullPath}" not exist.`);
            }
          } else {
            return;
          }
        })
      );

      resolve();
    });
  }

  static registerController<TController extends IClass>(controller: TController) {
    this.controllers.push(controller);
  }

  static createStatistic(status: boolean) {
    this.buildStatistic = status;
  }

  static async setupControllers(app: Application) {
    await this.load();
    applyControllers(app, this.controllers, this.buildStatistic);
  }
}
