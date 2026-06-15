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
import WrongQuestionBook from '@/views/WrongQuestionBook.vue'
import AddWrongQuestion from '@/views/AddWrongQuestion.vue'
import WrongQuestionDetail from '@/views/WrongQuestionDetail.vue'
import EbbinghausReview from '@/views/EbbinghausReview.vue'
import InterviewPage from '@/views/InterviewPage.vue'
import SchoolSelect from '@/views/SchoolSelect.vue'
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
    {
      path: '/school-select',
      name: 'SchoolSelect',
      component: SchoolSelect,
    },
    // ═══════════════════════════════════════════
    //  付费页面
    // ═══════════════════════════════════════════
    {
      path: '/pricing',
      name: 'Pricing',
      component: () => import('@/views/PricingPage.vue'),
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
    {
      path: '/questions',
      name: 'WrongQuestionBook',
      component: WrongQuestionBook,
      meta: { requiresAuth: true },
    },
    {
      path: '/questions/add',
      name: 'AddWrongQuestion',
      component: AddWrongQuestion,
      meta: { requiresAuth: true },
    },
    {
      path: '/questions/:id',
      name: 'WrongQuestionDetail',
      component: WrongQuestionDetail,
      meta: { requiresAuth: true },
    },
    {
      path: '/review',
      name: 'EbbinghausReview',
      component: EbbinghausReview,
      meta: { requiresAuth: true },
    },
    {
      path: '/interview',
      name: 'Interview',
      component: InterviewPage,
      meta: { requiresAuth: true },
    },
  ],
})

// 声明路由 meta 扩展
declare module 'vue-router' {
  interface RouteMeta {
    /** 需要登录 */
    requiresAuth?: boolean
    /** 需要付费会员 */
    requiresMembership?: boolean
    /** 关联的功能标识（用于升级提示上下文） */
    featureKey?: string
  }
}

// 路由守卫
router.beforeEach(async (to, _from) => {
  const token = localStorage.getItem('token')

  // 1. 登录检查
  if (to.meta.requiresAuth && !token) {
    return { path: '/', query: { redirect: to.fullPath } }
  }

  // 2. 已登录时懒加载用户信息与会员状态（不阻塞导航，避免 API 失败导致白屏）
  if (token && to.name !== 'auth') {
    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()

    if (!auth.membership) {
      auth.fetchProfile() // fire-and-forget，不 await，导航不被阻塞
    }
  }

  // 3. 会员检查（仅在已登录且路由要求时生效）
  if (to.meta.requiresMembership && token) {
    try {
      const { useAuthStore } = await import('@/stores/auth')
      const auth = useAuthStore()

      // 非会员 → 跳转到定价页
      if (!auth.isPremium) {
        return {
          path: '/pricing',
          query: {
            redirect: to.fullPath,
            feature: (to.meta.featureKey as string) ?? '',
          },
        }
      }
    } catch {
      // 检查失败不阻塞
    }
  }
})

export default router
