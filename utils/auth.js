/**
 * @name: auth
 * @author: Chuwen
 * @date: 2021-04-15 16:55
 * @description：auth
 * @update: 2021-04-15 16:55
 */
import store from '@/store'
const shopTokenKey = 'sub-shop-token'

export default {
  getShopToken () {
    try {
      return localStorage.getItem(shopTokenKey)
    } catch (error) {
      return store.state.shopDomain
    }
  },
  setShopToken (token) {
    try {
      return localStorage.setItem(shopTokenKey, token)
    } catch (error) {
      return false
    }
  },
  removeAccessToken () {
    try {
      return localStorage.removeItem(shopTokenKey)
    } catch (error) {
      store.commit('setShopDomain', '')
    }
  }
}
