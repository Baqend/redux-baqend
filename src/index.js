import { BAQEND_CONNECTING, BAQEND_CONNECTED } from './types';
import baqendConnect from './connect';
import baqendMiddleware from './createMiddleware';
import baqendReducer from './reducer';
import createStoreWithBaqend from './createStore'

const createEnhancers = (db) => {
  return { baqendConnect: baqendConnect(db), baqendMiddleware: baqendMiddleware(db) }
}

export {
  BAQEND_CONNECTING,
  BAQEND_CONNECTED,
  baqendConnect,
  baqendMiddleware,
  baqendReducer,
  createStoreWithBaqend,
  createEnhancers
};
