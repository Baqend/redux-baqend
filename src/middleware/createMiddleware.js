import handleActionObject from './handleActionObject'
import handleActionThunk from './handleActionThunk'

import { resultToJSON, getReference } from '../util'

const shouldHandle = (action) => {
  const { BAQEND, BAQEND_DISPATCH } = action
  return BAQEND || BAQEND_DISPATCH
}

const getActionObject = (action) => {
  const { BAQEND, BAQEND_DISPATCH } = action
  return BAQEND_DISPATCH && (BAQEND_DISPATCH && BAQEND_DISPATCH.BAQEND || BAQEND_DISPATCH) || BAQEND
}

const isBaqendActionObject = (actionObject) => {
  if (actionObject.payload) {
    if (typeof actionObject.payload === 'function') {
      return true
    } else if (Array.isArray(actionObject.payload)) {
      if (actionObject.payload[1] && typeof actionObject.payload[1] === 'function') {
        return true
      }
    }
  }
  return false
}

const isBaqendActionThunk = (actionObject) => {
  return typeof actionObject === 'function' || Array.isArray(actionObject)
}

const createBaqendMiddleware = (db) => {
  return ({ dispatch, getState }) => next => action => {
    if (shouldHandle(action)) {
      // console.log("should Handle")
      const actionObject = getActionObject(action)
      return db.then(db => {
        if (isBaqendActionObject(actionObject)) {
          // console.log("object")
          return handleActionObject({ dispatch, getState, next, db, action: actionObject })
        } else if (isBaqendActionThunk(actionObject)) {
          // console.log("thunk")
          return handleActionThunk({ dispatch, getState, next, db, action: actionObject })
        } else {
          // console.log("else")
          const { type, payload, options } = actionObject
          return next({
            type: type,
            payload: resultToJSON(payload, options)
          })
        }
      })
    }
    return next(action)
  }
}

// const baqendMiddleware = createBaqendMiddleware();
export default createBaqendMiddleware
