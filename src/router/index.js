import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/admin',
      name: 'admin',
      component:() => import('@/components/admin'),
    },
    {
      path: '/',
      name: 'login',
      component:() => import('@/components/login'),
    }
  ]
})
