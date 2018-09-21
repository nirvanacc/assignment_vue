import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      // name: 'login',
      component:() => import('@/components/login'),
    },
    {
      path: '/admin',
      // name: 'admin',
      component:() => import('@/components/admin'),
    },
    {
      path: '/consumer',
      // name: 'login',
      component:() => import('@/components/consumer'),
    }
  ]
})
