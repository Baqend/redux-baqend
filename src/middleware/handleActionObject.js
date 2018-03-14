import { resultToJSON, getReference } from '../util'

const handleActionObject = ({ dispatch, getState, next, action, db }) => {
  const { payload, options } = action;
  const actionTypes = getActionTypes(action)
  const { PENDING } = actionTypes

  if (PENDING) {
    if(typeof PENDING === 'string') {
      next({ type: PENDING })
    } else {
      next(PENDING);
    }
  }

  return db.then((db) => {
    const processedPayload = processPayload(db, payload, options)
    if (isObservable(processedPayload)) {
      return handleObservable({ processedPayload, next, dispatch, actionTypes, options })
    } else if (isPromise(processedPayload)) {
      return handlePromise({ processedPayload, next, dispatch, actionTypes, options })
    }
  })
}

const getActionTypes = (action) => {
  const { type, types } = action
  const PENDING = types && types[0] ? types[0] : undefined;
  const SUCCESS = types && types[1] ? types[1] : type;
  const FAILURE = types && types[2] ? types[2] : undefined;
  return { PENDING, SUCCESS, FAILURE }
}

const processPayload = (db, payload, options) => {
  let ref, func;
  if (Array.isArray(payload)) {
    ref = typeof payload[0] === 'object' ? getReference(db, payload[0], options) : null
    func = payload[1]
  } else {
    func = payload
  }
  return func(db, ref)
}

const isObservable = (payload) => {
  return payload && payload.subscribe
}

const isPromise = (payload) => {
  return payload && payload.then
}

const handleObservable = ({ processedPayload, next, dispatch, actionTypes, options }) => {
  const { SUCCESS } = actionTypes
  const callback = (r) => {
    let res
    let action
    if (Array.isArray(r)) {
      res = resultToJSON(r, options)
    } else {
      res = {
        date: r.date,
        data: resultToJSON(r.data, options),
        matchType: r.matchType,
        operation: r.operation
      }
    }
    action = {
      type: SUCCESS,
      payload: res
    }
    next(action);
  }

  const subscription = processedPayload.subscribe(callback)
  dispatch({
    type: `${SUCCESS}_SUBSCRIPTION`,
    payload: subscription
  })
  return subscription
}

const handlePromise = ({ processedPayload, next, dispatch, actionTypes, options }) => {
  const { SUCCESS, FAILURE } = actionTypes
  const handleSuccess = (r) => {
    let action;
    let res = resultToJSON(r, options)
    if(typeof SUCCESS === 'string') {
      action = {
        type: SUCCESS,
        payload: res
      }
    } else {
      const { type, payload, ...rest } = SUCCESS;
      action = {
        type: type,
        payload: (payload && payload(res)) || res,
        ...rest
      }
    }
    next(action)
  }
  const handleFailure = (e) => {
    let action;
    if(typeof FAILURE === 'string') {
      action = {
        type: FAILURE,
        payload: e
      }
    } else {
      const { type, payload, ...rest } = FAILURE;
      action = {
        type: type,
        payload: (payload && payload(e)) || e,
        ...rest
      }
    }
    next(action)
  }
  return new Promise((resolve, reject) => processedPayload.then((r) => {
    handleSuccess(r)
    resolve(r)
  }, (e) => {
    FAILURE && handleFailure(e)
    reject(e)
  }))
}

export default handleActionObject
