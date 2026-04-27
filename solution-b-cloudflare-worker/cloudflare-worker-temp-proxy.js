// Cloudflare Worker for PhotoMagic /temp/* proxy
// Deploy this worker to handle /temp/* requests and proxy to backend

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    console.log(`[Worker] Request: ${request.method} ${pathname}`);
    
    // Only handle /temp/* paths
    if (pathname.startsWith('/temp/')) {
      try {
        // Extract the filename from path
        const filename = pathname.split('/temp/')[1];
        if (!filename) {
          return new Response('Missing filename', { status: 400 });
        }
        
        // Backend server URL
        const backendUrl = `http://101.32.246.47:3002/temp/${filename}`;
        console.log(`[Worker] Proxying to: ${backendUrl}`);
        
        // Prepare request headers for backend
        const headers = new Headers(request.headers);
        
        // Remove Cloudflare-specific headers that might cause issues
        headers.delete('cf-connecting-ip');
        headers.delete('cf-ray');
        headers.delete('cf-visitor');
        headers.delete('cf-ipcountry');
        
        // Add necessary headers
        headers.set('Host', '101.32.246.47:3002');
        headers.set('X-Forwarded-For', request.headers.get('cf-connecting-ip') || '');
        headers.set('X-Forwarded-Proto', 'https');
        headers.set('X-Real-IP', request.headers.get('cf-connecting-ip') || '');
        
        // Forward the request to backend
        const backendRequest = new Request(backendUrl, {
          method: request.method,
          headers: headers,
          body: request.body,
          redirect: 'manual'
        });
        
        const response = await fetch(backendRequest);
        
        // Create response headers
        const responseHeaders = new Headers(response.headers);
        
        // Add CORS headers
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Range');
        
        // Cache control for temp files
        responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        responseHeaders.set('Pragma', 'no-cache');
        responseHeaders.set('Expires', '0');
        
        // Copy status from backend
        const status = response.status;
        const statusText = response.statusText;
        
        console.log(`[Worker] Backend response: ${status} ${statusText}`);
        
        return new Response(response.body, {
          status,
          statusText,
          headers: responseHeaders
        });
        
      } catch (error) {
        console.error(`[Worker] Error: ${error.message}`);
        return new Response(`Proxy error: ${error.message}`, { 
          status: 502,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
    
    // For all other paths, return 404 or pass through
    return new Response('Not Found', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

// Optional: Add a route handler for the worker
// In Cloudflare Dashboard, add route: photomagic-studio-project.pages.dev/temp/*