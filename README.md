## Redux Baqend Middleware

### Setup
```js
import { baqendReducer, baqendMiddleware, baqendConnect } from 'redux-baqend'
import middlewares from '../middleware'
import reducers from '../reducers'

const reducer = combineReducers({
  baqend: baqendReducer,
  ...reducers
})
const middleware = applyMiddleware(
  baqendMiddleware,
  ...middlewares
)
const enhancers = compose(
  baqendConnect,
  middleware
)
const store = createStore(reducer, {}, enhancers)
store.connect('app-starter');

...
render() {
  return (
    <Provider store={store}>
      ...
    </Provider>
  )
}
```

### Query Items
```js
export function itemLoad(args) {
  return {
    'BAQEND': {
      type: 'ITEMS_LOAD',
      payload: (db) => {
        return db.Message.find().resultList()
      }
    }
  }
}
```

### Updating items
```js
return {
  'BAQEND': {
    type: 'UPDATE_ITEM',
    payload: (db) => {
      item = db.Item.fromJSON(item)
      return item.save()
    }
  }
}
```
or let the middleware convert the item for you
```js
return {
  'BAQEND': {
    type: 'UPDATE_ITEM',
    payload: [ item, (db, item) => {
      return item.save()
      })
    }]
  }
}
```
