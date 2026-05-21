import { createRouter, createWebHistory } from 'vue-router'
import AuthPage from '../views/AuthPage.vue'
import UserCenter from '@/views/UserCenter.vue'
import CommunityHome from '@/views/CommunityHome.vue'
import PostDetail from '@/views/PostDetail.vue'
import CreatePost from '@/views/CreatePost.vue'
import MessageCenter from '@/views/MessageCenter.vue'
import SearchResult from '@/views/SearchResult.vue'
import UserProfile from '@/views/UserProfile.vue'
import GroupList from '@/views/GroupList.vue'
import GroupChat from '@/views/GroupChat.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import AiDashboard from '@/views/AiDashboard.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'auth',
      component: AuthPage,
    },
    {
      path: '/user_center',
      name: 'userCenter',
      component: UserCenter,
    },
    {
      path: '/community',
      name: 'CommunityHome',
      component: CommunityHome,
    },
    {
      path: '/post/:id',
      name: 'PostDetail',
      component: PostDetail,
    },
    {
      path: '/create_post',
      name: 'CreatePost',
      component: CreatePost,
    },
    {
      path: '/message',
      name: 'Message',
      component: MessageCenter,
    },
    {
      path: '/search',
      name: 'Search',
      component: SearchResult,
    },
    {
      path: '/user/:id',
      name: 'UserProfile',
      component: UserProfile,
    },
    {
      path: '/groups',
      name: 'GroupList',
      component: GroupList,
    },
    {
      path: '/chat/:groupId',
      name: 'GroupChat',
      component: GroupChat,
    },
    {
      path: '/ai',
      name: 'AiDashboard',
      component: AiDashboard,
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: AdminDashboard,
    },
  ],
})

export default router
