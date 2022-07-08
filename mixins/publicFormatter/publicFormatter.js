export default {
  data: {
    return: {}
  },
  methods: {
    /**
    * 排序
    * @param {Array} array 需要排序的数据
    * @param {String} key 排序的关键值
    * @returns Array
    */
    sortByKey (array, key) {
      return array.sort(function (a, b) {
        var x = a[key]
        var y = b[key]
        return ((x < y) ? -1 : ((x > y) ? 1 : 0))
      })
    },
    /**
    * 用户去重历史数据与新数据 [ 目前通过msgUuid:唯一标识 ]进行过滤
    * @filterKey [String] 筛选数据的唯一标识
    * @list [Array] 聊天中的历史数据
    */
    filterHistorySameData (filterKey, list) {
      var obj = {}
      list = list.reduce((newArr, next) => {
        // eslint-disable-next-line
        obj[next[filterKey]] ? '' : (obj[next[filterKey]] = true && newArr.push(next))
        return newArr
      }, [])
      return list
    },
    updateComputed () {
      const computedWatchers = this._computedWatchers
      if (computedWatchers) {
        Object.keys(computedWatchers).forEach((computed) => {
          computedWatchers[computed].update()
        })
      }
      this.$forceUpdate()
    }
  }
}
