import MainLayout from "layouts/MainLayout.vue";

const routes = [
  { path: '/', component: () => import('pages/login.vue') },
  {
    path: '/',
    component: MainLayout,
    meta: {requiresAuth: true},
    children: [
      { path: '/dashboard', component: () => import('pages/dashboard.vue'), },
      { path: '/my_profile', component: () => import('pages/my_profile.vue') },
    ]
  },
  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    meta: {requiresAuth: true},
    children: [
      { path: '', component: () => import('pages/users/index.vue') },
    ]
  },
  {
    path: '/roles',
    component: () => import('layouts/MainLayout.vue'),
    meta: {requiresAuth: true},
    children: [
      { path: '', component: () => import('pages/roles/index.vue') },
    ]
  },
  {
    path: '/colors',
    component: () => import('layouts/MainLayout.vue'),
    meta: {requiresAuth: true},
    children: [
      { path: '', component: () => import('pages/colors/index.vue') },
    ]
  },
  {
    path: '/groups',
    component: () => import('layouts/MainLayout.vue'),
    meta: {requiresAuth: true},
    children: [
      { path: '', component: () => import('pages/groups/index.vue') },
    ]
  },
  {
    path: '/ivas',
    component: () => import('layouts/MainLayout.vue'),
    meta: {requiresAuth: true},
    children: [
      { path: '', component: () => import('pages/ivas/index.vue') },
    ]
  },
  {
    path: '/items',
    component: () => import('layouts/MainLayout.vue'),
    meta: {requiresAuth: true},
    children: [
      { path: '', component: () => import('pages/items/index.vue') },
    ]
  },
  {
    path: '/stores',
    component: () => import('layouts/MainLayout.vue'),
    meta: {requiresAuth: true},
    children: [
      { path: '', component: () => import('pages/stores/index.vue') },
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
