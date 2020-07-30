/*external modules*/
import fs from 'fs';
import path from 'path';
import { Application } from 'express';
/*@core*/
import { IClass } from '../core/decorators';
import { applyControllers } from '../core';
/*controllers*/

export default class ServiceController {
  private static controllers: Array<IClass> = [];

  private static async load(): Promise<Record<string, unknown>[]> {
    return new Promise(async (resolve) => {
      const files = fs.readdirSync(__dirname);

      Promise.all(
        files.map(async (fileName) => {
          if (!fileName.startsWith('index')) {
            const fullPath = path.join(__dirname, fileName);
            const { default: controller } = await import(fullPath);

            ServiceController.registerController(controller);
          }
        })
      );

      resolve();
    });
  }

  static registerController<TController extends IClass>(controller: TController) {
    this.controllers.push(controller);
  }

  static async setupControllers(app: Application) {
    await this.load();
    applyControllers(app, this.controllers);
  }
}
