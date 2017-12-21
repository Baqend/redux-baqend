import middleware from './middleware'
import thunk from './thunk'

import {
  resultToJSON,
  getReference,
} from './util'

const createBaqendMiddleware = (db) => {
  return ({ dispatch, getState }) => next => action => {
    let { BAQEND, BAQEND_DISPATCH } = action;
    if (BAQEND || (BAQEND_DISPATCH && BAQEND_DISPATCH.BAQEND)) {
      BAQEND = BAQEND_DISPATCH && BAQEND_DISPATCH.BAQEND || BAQEND
      if (typeof BAQEND === 'function' || Array.isArray(BAQEND)) {
        return db.then((db) => {
          return thunk({ dispatch, getState, next, action, db, BAQEND })
        })
      }
      return middleware({ dispatch, getState, next, action, db, BAQEND })
    }
    if (BAQEND_DISPATCH && !BAQEND_DISPATCH.BAQEND) {
      return dispatch({
        type: BAQEND_DISPATCH.type,
        payload: resultToJSON(BAQEND_DISPATCH.payload, BAQEND_DISPATCH.options)
      })
    }
    return next(action)
  }
}

// const baqendMiddleware = createBaqendMiddleware();

export default createBaqendMiddleware
