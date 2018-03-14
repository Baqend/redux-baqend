import { getReference } from '../util'

const handleActionThunk = ({ dispatch, getState, next, action, db }) => {
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
  if (Array.isArray(action)) {
    action.forEach((item) => {
      if (typeof item === 'function') {
        func = item
      } else {
        args.push(getReference(db, item))
      }
    })
  } else {
    func = action
  }
  return func({
    dispatch: baqendDispatch,
    getState,
    db
  }, ...args)
}

export default handleActionThunk
