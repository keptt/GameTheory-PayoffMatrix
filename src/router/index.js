import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import UpdateCell from '../views/UpdateCell.vue'
import Config from '../views/Config.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/'
    , name: 'Home'
    , component: Home
  }
  , {
    path: '/update-cell'
    , name: 'UpdateCell'
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    , component: UpdateCell//() => import(/* webpackChunkName: "about" */ '../views/UpdateCell.vue')
  }
  ,   {
    path: '/config'
    , name: 'Config'
    , component: Config//() => import(/* webpackChunkName: "about" */ '../views/UpdateCell.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
