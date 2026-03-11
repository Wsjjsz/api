export default [
  { path: '/', name: '主页', icon: 'home', component: './Index' },
  {
    path: '/interface_info/:id',
    name: '查看接口',
    icon: 'fileText',
    component: './InterfaceInfo',
    hideInMenu: true,
  },
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' }],
  },
  {
    path: '/admin',
    name: '管理页',
    icon: 'appstore',
    access: 'canAdmin',
    routes: [
      {
        name: '接口管理',
        icon: 'api',
        path: '/admin/interface_info',
        component: './Admin/InterfaceInfo',
      },
      {
        name: '接口分析',
        icon: 'barChart',
        path: '/admin/interface_analysis',
        component: './Admin/InterfaceAnalysis',
      },
      {
        name: '用户管理',
        icon: 'team',
        path: '/admin/user_manage',
        component: './Admin/UserManagement',
      },
    ],
  },

  // { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
