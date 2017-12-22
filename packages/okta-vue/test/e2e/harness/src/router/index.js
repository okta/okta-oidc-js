import Vue from 'vue'
import Router from 'vue-router'
import Protected from '@/components/Protected'
import SessionTokenLogin from '@/components/SessionTokenLogin'

import Auth from '@/../../../../dist/okta-vue.js'

Vue.use(Router)
Vue.use(Auth, {
  issuer: process.env.ISSUER,
  redirect_uri: process.env.REDIRECT_URI,
  client_id: process.env.CLIENT_ID,
  scope: 'openid profile email'
})

const router = new Router({
  mode: 'history',
  base: '/',
  routes: [
    { path: '/implicit/callback', component: Auth.handleCallback() },
    { path: '/protected', component: Protected, meta: { requiresAuth: true } },
    { path: '/sessionToken', component: SessionTokenLogin }
  ]
})

router.beforeEach(Vue.prototype.$auth.authRedirectGuard())

export default router
