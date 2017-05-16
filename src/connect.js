const baqendConnect = (db) => {
  return next => (reducer, initialState, middleware) => {
    const store = next(reducer, initialState, middleware)
    const {dispatch} = store

    dispatch({ type: 'BAQEND_CONNECTING' })
    db.then((db) => {
      dispatch({
        type: 'BAQEND_CONNECTED',
        user: (db.User.me && db.User.me.toJSON()) || null
      })
    })

    return store
  }
}

export default baqendConnect
