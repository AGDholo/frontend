import Vue from 'vue';
import Router from 'vue-router';

import RouterComponent from './components/RouterComponent.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import(/* webpackChunkName: "main" */ './views/main/Main.vue'),
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "main-home" */ './views/main/Home.vue'),
        },
        {
          path: 'sites/',
          component: () => import(/* webpackChunkName: "main-sites" */ './views/main/Sites.vue'),
        },
        {
          path: 'sites/:subdomain',
          component: () => import(/* webpackChunkName: "main-site" */ './views/main/Site.vue'),
        },
        {
          path: 'article-columns/:id',
          component: () => import(/* webpackChunkName: "main-article-columns" */ './views/main/ArticleColumn.vue'),
        },
        {
          path: 'articles/:id',
          component: () => import(/* webpackChunkName: "main-articles" */ './views/main/Article.vue'),
          children: [
            {
              path: 'comments/:article_comment_id',
              component: () => import(/* webpackChunkName: "main-articles" */ './views/main/Article.vue'),
            },
          ],
        },
        {
          path: 'submissions/:id',
          component: () => import(/* webpackChunkName: "main-submissions" */ './views/main/Submission.vue'),
          children: [
            {
              path: 'comments/:submission_comment_id',
              component: () => import(/* webpackChunkName: "main-submissions" */ './views/main/Submission.vue'),
            },
          ],
        },
        {
          path: 'questions/:id',
          component: () => import(/* webpackChunkName: "main-questions" */ './views/main/Question.vue'),
          children: [
            {
              path: 'answers/:aid',
              component: () => import(/* webpackChunkName: "main-questions" */ './views/main/Question.vue'),
              children: [
                {
                  path: 'comments/:acid',
                  component: () => import(/* webpackChunkName: "main-questions" */ './views/main/Question.vue'),
                },
              ],
            },
            {
              path: 'comments/:qcid',
              component: () => import(/* webpackChunkName: "main-questions" */ './views/main/Question.vue'),
            },
          ],
        },
        {
          path: 'article-focus',
          component: () => import(/* webpackChunkName: "main-article-focus" */ './views/main/ArticleFocusMode.vue'),
        },
        {
          path: 'topics/:id',
          component: () => import(/* webpackChunkName: "main-topics" */ './views/main/Topic.vue'),
        },
        {
          path: 'users/:handle',
          component: () => import(/* webpackChunkName: "main-users" */ './views/main/User.vue'),
        },
        {
          path: 'forms/:uuid',
          component: () => import(/* webpackChunkName: "main-forms" */ './views/main/Form.vue'),
        },
        {
          path: 'channels/:id',
          component: () => import(/* webpackChunkName: "main-channels" */ './views/main/Channel.vue'),
        },
        {
          path: 'dashboard',
          component: () => import(/* webpackChunkName: "main-dashboard" */ './views/main/Dashboard.vue'),
        },
        {
          path: 'profile',
          component: RouterComponent,
          children: [
            {
              path: 'edit',
              component: () => import(
                /* webpackChunkName: "main-profile-edit" */ './views/main/profile/UserProfileEdit.vue'),
            },
          ],
        },
        {
          path: 'security',
          component: () => import(/* webpackChunkName: "main-security" */ './views/main/Security.vue'),
        },
        {
          path: 'moderation',
          component: () => import(/* webpackChunkName: "main-moderation" */ './views/main/Moderation.vue'),
        },
      ],
    },
    {
      path: '/login',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "login" */ './views/Login.vue'),
    },
    {
      path: '/signup',
      component: () => import(/* webpackChunkName: "signup" */ './views/Signup.vue'),
    },
    {
      path: '/recover-password',
      component: () => import(/* webpackChunkName: "recover-password" */ './views/PasswordRecovery.vue'),
    },
    {
      path: '/reset-password',
      component: () => import(/* webpackChunkName: "reset-password" */ './views/ResetPassword.vue'),
    },
    {
      path: '/invitation-links/:uuid',
      component: () => import(/* webpackChunkName: "invitation-link" */ './views/InvitationLink.vue'),
    },
    {
      path: '/main/*',
      redirect: (to) => {
        return to.fullPath.substring('/main'.length);
      },
    },
    {
      path: '/*', redirect: '/',
    },
  ],
});
