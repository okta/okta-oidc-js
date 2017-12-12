import Vue from 'vue'
import Router from 'vue-router'
import Protected from '@/components/Protected'

import { Auth } from '@/../../../../src/'

Vue.use(Router)
Vue.use(Auth, {
  issuer: 'https://jordandemo.oktapreview.com',
  redirect_uri: 'http://localhost:8080/implicit/callback',
  client_id: '0oab8olsehwF1x7bM0h7',
  scopes: ['openid', 'profile', 'email']
})

const router = new Router({
  mode: 'history',
  base: '/',
  routes: [
    { path: '/implicit/callback', component: Auth.handleCallback() },
    { path: '/protected', component: Protected, meta: { requiresAuth: true } }
  ]
})

// router.beforeEach((from, to, next) => {
//   if (from.matched.some(record => record.meta.requiresAuth) && !Vue.prototype.$auth.isAuthenticated()) {
//     localStorage.setItem('referrerPath', from.path || '/')
//     Vue.prototype.$auth.loginRedirect()
//   } else {
//     next()
//   }
// })

router.beforeEach(Vue.prototype.$auth.authRedirectGuard())

export default router
