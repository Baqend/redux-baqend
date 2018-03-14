const baqendObject = (json) => ({
  ...json,
  _metadata: {
    id: json.id
  },
  save: () => Promise.resolve(json),
  toJSON: () => json
})

const baqendList = [baqendObject({ id: "/db/Type/1" }), baqendObject({ id: "2" }), { id: "3" }]

const db = {
  then: (cb) => new Promise(resolve => resolve(cb(db))),
  singleResult: () => Promise.resolve(baqendObject),
  resultList: () => Promise.resolve(baqendList),
  resultListRejected: () => Promise.reject("Some Error"),
  Type: {
    fromJSON: (json) => baqendObject(json)
  }
}

export {
  baqendObject,
  baqendList,
  db
}
