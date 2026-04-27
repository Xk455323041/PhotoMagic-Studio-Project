// Cloudflare Worker: PhotoMagic /temp/* Proxy
// 代理 photomagic-studio-project.pages.dev/temp/* 到后端服务器
// 版本: 1.0.0

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, search } = url;
    
    // 只处理 /temp/* 路径
    if (!pathname.startsWith('/temp/')) {
      return new Response('Not Found', { 
        status: 404,
        headers: { 
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store'
        }
      });
    }
    
    try {
      // 提取文件名
      const filename = pathname.substring(6); // 去掉 "/temp/"
      if (!filename || filename.includes('..')) {
        return new Response('Invalid filename', { 
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // 后端服务器地址
      const BACKEND_HOST = '101.32.246.47:3002';
      const backendUrl = `http://${BACKEND_HOST}/temp/${filename}${search}`;
      
      console.log(`[Worker] Proxying: ${pathname} -> ${backendUrl}`);
      
      // 准备请求头
      const headers = new Headers(request.headers);
      
      // 移除Cloudflare特定头部
      const headersToRemove = [
        'cf-connecting-ip',
        'cf-ray',
        'cf-visitor',
        'cf-ipcountry',
        'cf-worker',
        'cf-ew-version'
      ];
      headersToRemove.forEach(h => headers.delete(h));
      
      // 设置代理头部
      headers.set('Host', BACKEND_HOST);
      headers.set('X-Forwarded-For', request.headers.get('cf-connecting-ip') || '');
      headers.set('X-Forwarded-Proto', 'https');
      headers.set('X-Real-IP', request.headers.get('cf-connecting-ip') || '');
      headers.set('X-Forwarded-Host', url.hostname);
      
      // 设置超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      // 转发请求到后端
      const backendRequest = new Request(backendUrl, {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'manual',
        signal: controller.signal
      });
      
      let response;
      try {
        response = await fetch(backendRequest);
      } finally {
        clearTimeout(timeoutId);
      }
      
      // 处理重定向
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          return Response.redirect(location, response.status);
        }
      }
      
      // 创建响应头
      const responseHeaders = new Headers(response.headers);
      
      // 添加安全头部
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Range, Accept');
      responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
      responseHeaders.set('Access-Control-Max-Age', '86400');
      
      // 缓存控制（临时文件不缓存）
      responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      responseHeaders.set('Pragma', 'no-cache');
      responseHeaders.set('Expires', '0');
      responseHeaders.set('Surrogate-Control', 'no-store');
      
      // 安全头部
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Frame-Options', 'DENY');
      responseHeaders.set('X-XSS-Protection', '1; mode=block');
      responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // 记录成功日志
      console.log(`[Worker] Success: ${response.status} ${filename}`);
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
      
    } catch (error) {
      // 错误处理
      console.error(`[Worker] Error: ${error.message}`);
      
      let status = 502;
      let message = 'Bad Gateway';
      
      if (error.name === 'AbortError') {
        status = 504;
        message = 'Gateway Timeout';
      } else if (error.message.includes('fetch failed')) {
        status = 503;
        message = 'Service Unavailable';
      }
      
      return new Response(`${message}: ${error.message}`, {
        status,
        headers: { 
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store'
        }
      });
    }
  }
};

// 健康检查端点（可选）
// 可以添加 /health 路径用于监控
export async function handleHealthCheck(request) {
  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'photomagic-temp-proxy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      proxy: true,
      cors: true,
      caching: false,
      timeout: '10s'
    }
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}