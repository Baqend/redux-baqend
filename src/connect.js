import { db } from 'baqend';

const baqendConnect = () => {
  return next => (reducer, initialState, middleware) => {
    const store = next(reducer, initialState, middleware)
    const {dispatch} = store

    store.connect = (app) => {
      dispatch({ type: 'BAQEND_CONNECTING' })
      db.connect(app, true).then((db) => {
        dispatch({ type: 'BAQEND_CONNECTED' })
      })
    }

    return store
  }
}

export default baqendConnect()
