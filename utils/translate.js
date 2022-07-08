// 翻译助手函数

/** 递归获取对象的字符串内容到数组
 * @param object obj 要遍历的对象
 * @param array arr 用来存储结果的数组
 */
export function getObjString (obj, arr) {
  for (const i in obj) {
    if (typeof obj[i] === 'object') {
      getObjString(obj[i], arr)
    } else {
      if (typeof obj[i] === 'string') arr.push(obj[i])
    }
  }
}

/** 递归将对象内容重新赋值回去
 * @param object obj 要遍历的对象
 * @param array arr 存储有结果的数组
 */
export function setObjString (obj, arr) {
  for (const i in obj) {
    if (typeof obj[i] === 'object') {
      getObjString(obj[i], arr)
    } else {
      if (typeof obj[i] === 'string') obj[i] = arr.shift()
    }
  }
}

// 合并对象数组为一个数组
/* 对象形如
{
key: ['val1','val2','val3' ...]
key2: ['val1','val2','val3' ...]
....
}
*/
export function mergeObjArr (obj) {
  let arr = []
  for (const i in obj) {
    if (Array.isArray(obj[i])) arr = arr.concat(obj[i])
  }
  return arr
}

// 拆分数组合并回原有对象格式
/* 对象格式形如
{
key: ['val1','val2','val3' ...]
key2: ['val1','val2','val3' ...]
....
}
*/
export function arrToObj (obj, arr) {
  for (const i in obj) {
    for (const j in obj[i]) {
      obj[i][j] = arr.shift()
    }
  }
  return obj
}
