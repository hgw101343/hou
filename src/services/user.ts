import request from '@/utils/request';
import { config } from '@/utils/config'



export async function queryMenu(): Promise<any> {
  return request( {
    fullUrl: config.SECURITY_REQ_URL + '/api/sys/sysmenu/list_for_tree',
    method:'POST',
    data: {
      id: PROCESS_ENV.APP_API_SUBSYSTEMID
    }
  });
}

export async function queryCurrent(): Promise<any> {
  return request('/api/currentUser');
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}
