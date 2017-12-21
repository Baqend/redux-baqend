const resultToJSON = (res, options = {}) => {
  if (res === undefined)
    return null
  if (res.operation)
    return { ...res, data: res.data.toJSON(options) }
  if (res.length) {
    return res[0]._metadata ? res.map(o => o.toJSON(options)) : res
  } else {
    return res._metadata ? res.toJSON(options) : res
  }
}

const getReference = (db, json, options) => {
  let type = typeof options === 'object' && options.type ? options.type : json.id.split('/')[2];
  return db[type] ? db[type].fromJSON(json) : null;
}

export {
  resultToJSON,
  getReference,
}
