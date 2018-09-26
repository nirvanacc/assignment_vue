import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component:() => import('@/components/login'),
    },
    {
      path: '/serverInfo',
      component:() => import('@/components/serverInfo'),
    },
    {
      path: '/applicant',
      component:() => import('@/components/applicant'),
    },
    {
      path: '/userManager',
      component:() => import('@/components/userManager'),
    },
    {
      path: '/consumer',
      component:() => import('@/components/consumer'),
    },
    {
      path: '/mock',
      component:() => import('@/components/addadmin'),
    }
  ]
})
