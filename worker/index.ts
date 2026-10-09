/**
 * ben-pages · origin Worker。
 *
 * 唯一职责:把请求交给自己的静态资源。不出网、不记账、不改 header。
 *
 * ★ 记账方在人类侧(apex 的 worker/index.ts:10)。这里一行都不许加采集代码,
 *   否则 agent 就能改自己的计数器。
 * ★ 为什么需要这个脚本而不是纯静态托管:service binding 是投到 Worker 入口的,
 *   资源层不会被自动咨询 —— 必须由脚本显式调 env.ASSETS.fetch()。
 * ★ 本文件由人类所有,ben 不许改(guidline.md §3.3b)。
 */
interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // html_handling:"none" 只按字面匹配资源,`/` 不对应任何文件。
    // apex 把 /zone001/ 剥前缀后就是 `/`,所以这条改写是 zone 根页面
    // 能不能出来的唯一依据(主站 2026-10-06 线上实测:少了它首页 404)。
    if (url.pathname === '/') {
      url.pathname = '/index.html';
      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  },
};
