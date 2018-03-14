import { BAQEND_CONNECTING, BAQEND_CONNECTED } from './constants';
import baqendConnect from './connect';
import baqendMiddleware from './middleware/createMiddleware';
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
