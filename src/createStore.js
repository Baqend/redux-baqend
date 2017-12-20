import { applyMiddleware, compose, createStore, combineReducers } from 'redux'
import { createEnhancers } from './index'

const createStoreWithBaqend = (db, reducer, initialState, middleware) => {
  const { baqendConnect, baqendMiddleware } = createEnhancers(db)
  console.log("redux store yo")
  return createStore(reducer, initialState, compose(
    baqendConnect,
    applyMiddleware(baqendMiddleware),
    middleware
  ))
}

export default createStoreWithBaqend
