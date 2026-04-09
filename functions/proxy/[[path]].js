/**
 * 图片代理函数 - 类似 KANetflix 的实现
 * 将外部图片 URL 通过本代理转发，解决跨域和防盗链问题
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 获取要代理的图片 URL
  const imageUrl = url.searchParams.get('url');
  
  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  try {
    // 解码 URL（支持编码和未编码的 URL）
    const decodedUrl = decodeURIComponent(imageUrl);
    
    // 使用相同的请求头转发，模拟浏览器请求
    const response = await fetch(decodedUrl, {
      headers: {
        'Referer': 'https://movie.douban.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return new Response(`Image fetch failed: ${response.status}`, { status: response.status });
    }

    // 获取原始响应头
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const cacheControl = response.headers.get('cache-control') || 'public, max-age=86400';

    // 创建新的响应，保留原始内容类型
    // 关键：使用 response.arrayBuffer() 而不是 response.text() 来保持二进制数据
    const arrayBuffer = await response.arrayBuffer();
    
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
