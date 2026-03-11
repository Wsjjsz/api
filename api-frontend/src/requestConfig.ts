import type { RequestConfig } from '@umijs/max';

// 与后端约定的响应数据格式
interface ResponseStructure {
  code: number;
  data: any;
  message?: string;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const requestConfig: RequestConfig = {
  // 使用同源 /api，通过 umi dev proxy 转发到网关，避免跨域导致的登录态丢失
  baseURL: '',
  withCredentials: true,
  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as { data: ResponseStructure };
      console.log('data', data);
      if (!data) {
        throw new Error('服务异常，请稍后重试');
      }
      // 未登录：只抛出错误，不自动跳转，避免“看起来像被退出登录”
      if (data.code === 40100) {
        throw new Error(data.message || '未登录');
      }
      // 其他业务错误，统一抛出错误信息，交给调用方用 message.error 展示
      if (data.code !== 0) {
        throw new Error(data.message || '请求失败');
      }
      return response;
    },
  ],
};
