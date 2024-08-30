import Vue from 'vue'
import Router from 'vue-router'
import {
  Message
} from 'element-ui';


import Login from '../components/Login.vue'
import Register from '../components/Register.vue'

import UserInfo from '../components/UserInfo.vue'
import MyInfo from '../components/UserInfo/MyInfo.vue'
import Account from '../components/UserInfo/Account.vue'

import Chatting from '../components/Chatting.vue'

import ChattingRoomNew from '../components/ChattingRoomNew.vue'
// import ChatRoom from '../components/ChatRoom.vue'

//解决vue重复点击路由报错
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: Login,
    meta: {
      requireAuth: false
    }
  },
  {
    path: '/register',
    component: Register,
    meta: {
      requireAuth: false
    }
  },
  {
    path: '/chat',
    component: Chatting,
    meta: {
      requireAuth: true  // 聊天室需要登录
    }
  },
  {
    path: '/userinfo',
    component: UserInfo,
    meta: {
      requireAuth: true
    },
    children: [{
      path: '/userinfo/1',
      component: MyInfo,
      meta: {
        requireAuth: true
      },
    }, {
      path: '/userinfo/2',
      component: Account,
      meta: {
        requireAuth: true
      },
    }]
  },
]

const router = new Router({
  routes
})

router.beforeEach((to, form, next) => {
  if (to.path === '/login' || to.path === '/register') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr && to.meta.requireAuth) {
    Message.warning('请先登录')
    next('/login')
  } else {
    next()
  }
})

export default router