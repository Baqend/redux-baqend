import {
  getReference
} from './util'

const thunk = ({ dispatch, getState, next, action, db, BAQEND }) => {
  // monkeypatch the redux dispatch function
  const baqendDispatch = (obj, options) => {
    return dispatch({
      'BAQEND_DISPATCH': {
        ...obj,
        options
      }
    })
  }

  let func
  let args = []
  if (Array.isArray(BAQEND)) {
    BAQEND.forEach((item) => {
      if (typeof item === 'function') {
        func = item
      } else {
        args.push(getReference(db, item))
      }
    })
  } else {
    func = BAQEND
  }

  return func({
    dispatch: baqendDispatch,
    getState,
    db
  }, ...args)
}

export default thunk
