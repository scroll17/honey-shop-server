import _ from 'lodash';
import { STATUS_CODES } from 'http';

export class ServerError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super();
  }

  static unauthorized() {
    return new ServerError(STATUS_CODES[401]!, 401);
  }

  static forbidden() {
    return new ServerError(STATUS_CODES[403]!, 403);
  }

  static notFound(prefix = '') {
    prefix = prefix.trim();
    if (prefix) {
      prefix = `${_.capitalize(prefix)} `;
    }
    return new ServerError(prefix + STATUS_CODES[404]!, 404);
  }
}
