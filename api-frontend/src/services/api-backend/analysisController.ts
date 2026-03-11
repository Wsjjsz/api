// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** listTopInvokeInterfaceInfo GET /api/analysis/top/interface/invoke */
export async function listTopInvokeInterfaceInfoUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseListInterfaceInfoVO>('/api/analysis/top/interface/invoke', {
    method: 'GET',
    ...(options || {}),
  });
}

/** getInterfaceInvokeOverview GET /api/analysis/interface/invoke/overview */
export async function getInterfaceInvokeOverviewUsingGET(options?: { [key: string]: any }) {
  return request<API.BaseResponseobject>('/api/analysis/interface/invoke/overview', {
    method: 'GET',
    ...(options || {}),
  });
}
