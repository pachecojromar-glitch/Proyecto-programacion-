db.likes.ensureIndex({ fieldName: 'userId' });
db.likes.ensureIndex({ fieldName: 'pinId' });
db.pins.ensureIndex({ fieldName: 'userId' });
db.comments.ensureIndex({ fieldName: 'pinId' });
 
// NeDB es callback-based; estos helpers devuelven Promises para async/await
const wrap = {
  find:    (col, query, sort = {})   => new Promise((res, rej) => col.find(query).sort(sort).exec((e, d) => e ? rej(e) : res(d))),
  findOne: (col, query)              => new Promise((res, rej) => col.findOne(query, (e, d) => e ? rej(e) : res(d))),
  insert:  (col, doc)                => new Promise((res, rej) => col.insert(doc, (e, d) => e ? rej(e) : res(d))),
  update:  (col, query, update, opt) => new Promise((res, rej) => col.update(query, update, opt || {}, (e, n) => e ? rej(e) : res(n))),
  remove:  (col, query, opt)         => new Promise((res, rej) => col.remove(query, opt || {}, (e, n) => e ? rej(e) : res(n))),
  count:   (col, query)              => new Promise((res, rej) => col.count(query, (e, n) => e ? rej(e) : res(n))),
};
 
module.exports = { db, wrap };