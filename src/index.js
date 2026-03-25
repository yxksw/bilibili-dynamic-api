// Bilibili Dynamic API for Cloudflare Worker
// 参考: https://nemo2011.github.io/bilibili-api/#/modules/dynamic

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // 设置CORS头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let result

    switch (path) {
      case '/':
        return new Response(JSON.stringify({
          message: 'Bilibili Dynamic API',
          endpoints: {
            '/dynamic/detail?dynamic_id={id}': '获取指定动态详情',
            '/user/dynamics?host_mid={uid}': '获取用户动态列表',
            '/user/space?host_uid={uid}': '获取用户空间动态(旧版)',
            '/dynamic/likes?dynamic_id={id}': '获取动态点赞列表',
            '/dynamic/reposts?dynamic_id={id}': '获取动态转发列表',
            '/dynamic/comments?dynamic_id={id}': '获取动态评论列表',
            '/live/users': '获取正在直播的用户列表',
            '/new/users': '获取最新动态用户列表'
          },
          docs: 'https://nemo2011.github.io/bilibili-api/#/modules/dynamic'
        }, null, 2), { headers: corsHeaders })

      case '/dynamic/detail':
        result = await getDynamicDetail(url.searchParams)
        break

      case '/user/dynamics':
        result = await getUserDynamics(url.searchParams)
        break

      case '/user/space':
        result = await getUserSpaceDynamics(url.searchParams)
        break

      case '/dynamic/likes':
        result = await getDynamicLikes(url.searchParams)
        break

      case '/dynamic/reposts':
        result = await getDynamicReposts(url.searchParams)
        break

      case '/dynamic/comments':
        result = await getDynamicComments(url.searchParams)
        break

      case '/live/users':
        result = await getLiveUsers(url.searchParams)
        break

      case '/new/users':
        result = await getNewDynamicUsers(url.searchParams)
        break

      default:
        return new Response(JSON.stringify({
          error: 'Not Found',
          message: 'Endpoint not found',
          available: '/'
        }, null, 2), { 
          status: 404, 
          headers: corsHeaders 
        })
    }

    return new Response(JSON.stringify(result, null, 2), { headers: corsHeaders })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error.message
    }, null, 2), { 
      status: 500, 
      headers: corsHeaders 
    })
  }
}

// 获取动态详情
// API: https://api.bilibili.com/x/polymer/web-dynamic/v1/detail
async function getDynamicDetail(params) {
  const dynamicId = params.get('dynamic_id')
  if (!dynamicId) {
    throw new Error('Missing required parameter: dynamic_id')
  }

  const url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id=${dynamicId}`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://t.bilibili.com/'
    }
  })

  const data = await response.json()
  return {
    success: data.code === 0,
    code: data.code,
    message: data.message,
    data: data.data
  }
}

// 获取用户动态列表
// API: https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space
async function getUserDynamics(params) {
  const hostMid = params.get('host_mid') || params.get('uid')
  if (!hostMid) {
    throw new Error('Missing required parameter: host_mid or uid')
  }

  const offset = params.get('offset') || ''
  const page = params.get('page') || '1'
  const pageSize = Math.min(parseInt(params.get('page_size') || '20'), 20)

  let url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${hostMid}&page=${page}&page_size=${pageSize}`
  if (offset) {
    url += `&offset=${offset}`
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `https://space.bilibili.com/${hostMid}/dynamic`
    }
  })

  const data = await response.json()
  return {
    success: data.code === 0,
    code: data.code,
    message: data.message,
    data: data.data
  }
}

// 获取用户空间动态 (旧版API)
// API: https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history
async function getUserSpaceDynamics(params) {
  const hostUid = params.get('host_uid') || params.get('uid')
  if (!hostUid) {
    throw new Error('Missing required parameter: host_uid or uid')
  }

  const offsetDynamicId = params.get('offset_dynamic_id') || '0'
  const needTop = params.get('need_top') || '1'

  const url = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${hostUid}&offset_dynamic_id=${offsetDynamicId}&need_top=${needTop}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `https://space.bilibili.com/${hostUid}/dynamic`
    }
  })

  const data = await response.json()
  return {
    success: data.code === 0,
    code: data.code,
    message: data.message,
    data: data.data
  }
}

// 获取动态点赞列表
// API: https://api.bilibili.com/x/polymer/web-dynamic/v1/detail/like_list
async function getDynamicLikes(params) {
  const dynamicId = params.get('dynamic_id') || params.get('id')
  if (!dynamicId) {
    throw new Error('Missing required parameter: dynamic_id')
  }

  const offset = params.get('offset') || ''
  const page = params.get('page') || '1'
  const pageSize = Math.min(parseInt(params.get('page_size') || '20'), 50)

  let url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/detail/like_list?id=${dynamicId}&page=${page}&page_size=${pageSize}`
  if (offset) {
    url += `&offset=${offset}`
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://t.bilibili.com/'
    }
  })

  const data = await response.json()
  return {
    success: data.code === 0,
    code: data.code,
    message: data.message,
    data: data.data
  }
}

// 获取动态转发列表
// API: https://api.bilibili.com/x/polymer/web-dynamic/v1/detail/repost_list
async function getDynamicReposts(params) {
  const dynamicId = params.get('dynamic_id') || params.get('id')
  if (!dynamicId) {
    throw new Error('Missing required parameter: dynamic_id')
  }

  const offset = params.get('offset') || ''
  const page = params.get('page') || '1'
  const pageSize = Math.min(parseInt(params.get('page_size') || '20'), 20)

  let url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/detail/repost_list?id=${dynamicId}&page=${page}&page_size=${pageSize}`
  if (offset) {
    url += `&offset=${offset}`
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://t.bilibili.com/'
    }
  })

  const data = await response.json()
  return {
    success: data.code === 0,
    code: data.code,
    message: data.message,
    data: data.data
  }
}

// 获取动态评论列表
// API: https://api.bilibili.com/x/v2/reply
async function getDynamicComments(params) {
  const dynamicId = params.get('dynamic_id') || params.get('oid')
  if (!dynamicId) {
    throw new Error('Missing required parameter: dynamic_id or oid')
  }

  const type = params.get('type') || '11' // 11 = 动态
  const page = params.get('page') || '1'
  const pageSize = Math.min(parseInt(params.get('page_size') || '20'), 20)
  const sort = params.get('sort') || '0' // 0 = 按时间, 2 = 按热度

  const url = `https://api.bilibili.com/x/v2/reply?oid=${dynamicId}&type=${type}&pn=${page}&ps=${pageSize}&sort=${sort}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://t.bilibili.com/'
    }
  })

  const data = await response.json()
  return {
    success: data.code === 0,
    code: data.code,
    message: data.message,
    data: data.data
  }
}

// 获取正在直播的用户列表
// API: https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/live_users
async function getLiveUsers(params) {
  const page = params.get('page') || '1'
  const pageSize = Math.min(parseInt(params.get('page_size') || '20'), 50)

  const url = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/live_users?page=${page}&pagesize=${pageSize}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://t.bilibili.com/'
    }
  })

  const data = await response.json()
  return {
    success: data.code === 0,
    code: data.code,
    message: data.message,
    data: data.data
  }
}

// 获取最新动态用户列表
// API: https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/new_users
async function getNewDynamicUsers(params) {
  const page = params.get('page') || '1'
  const pageSize = Math.min(parseInt(params.get('page_size') || '20'), 50)

  const url = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/new_users?page=${page}&pagesize=${pageSize}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://t.bilibili.com/'
    }
  })

  const data = await response.json()
  return {
    success: data.code === 0,
    code: data.code,
    message: data.message,
    data: data.data
  }
}
