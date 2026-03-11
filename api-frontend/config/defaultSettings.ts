import { Settings as LayoutSettings } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 主题蓝
  colorPrimary: '#4468ff',
  layout: 'top',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'API接口',
  pwa: false,
  logo: '/suapi_nav_logo_v2.svg',
  iconfontUrl: '',
};

export default Settings;
