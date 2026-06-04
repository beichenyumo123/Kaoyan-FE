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
import VerificationPage from '@/views/VerificationPage.vue'
import ExperienceSquare from '@/views/ExperienceSquare.vue'
import ExperienceDetail from '@/views/ExperienceDetail.vue'
import CreateExperience from '@/views/CreateExperience.vue'
import AiDashboard from '@/views/AiDashboard.vue'
import AiAsk from '@/views/AiAsk.vue'
import AiKnowledge from '@/views/AiKnowledge.vue'
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
      path: '/ai/ask',
      name: 'AiAsk',
      component: AiAsk,
    },
    {
      path: '/ai/knowledge',
      name: 'AiKnowledge',
      component: AiKnowledge,
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: AdminDashboard,
    },
    // ==================== D 模块：上岸认证 + 经验贴 ====================
    {
      path: '/verification',
      name: 'Verification',
      component: VerificationPage,
    },
    {
      path: '/experience',
      name: 'ExperienceSquare',
      component: ExperienceSquare,
    },
    {
      path: '/experience/create',
      name: 'CreateExperience',
      component: CreateExperience,
    },
    {
      path: '/experience/:id',
      name: 'ExperienceDetail',
      component: ExperienceDetail,
    },
    {
      path: '/experience/:id/edit',
      name: 'EditExperience',
      component: CreateExperience,
    },
  ],
})

export default router
