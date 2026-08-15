// api/download.js
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { url } = req.body;

  // التحقق من وجود الرابط
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'URL is required' });
  }

  // التحقق من صحة الرابط
  const supportedPlatforms = [
    'tiktok.com', 'youtube.com', 'youtu.be', 
    'instagram.com', 'facebook.com', 'fb.watch'
  ];
  
  const isValidUrl = supportedPlatforms.some(platform => url.includes(platform));
  
  if (!isValidUrl) {
    return res.status(400).json({ 
      success: false, 
      error: 'Unsupported platform. Supported: TikTok, YouTube, Instagram, Facebook' 
    });
  }

  // التحقق من وجود مفتاح API
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.warn('RAPIDAPI_KEY not set, returning mock data');
    return res.status(200).json({ 
      success: true, 
      demo: true, 
      message: 'Running in demo mode - add RAPIDAPI_KEY to .env',
      data: generateMockData(url) 
    });
  }

  try {
    const response = await fetch('https://social-media-video-downloader.p.rapidapi.com/v1/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'social-media-video-downloader.p.rapidapi.com',
        'x-rapidapi-key': apiKey
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    // في حالة فشل الـ API، نرجع mock data مع توضيح
    return res.status(200).json({ 
      success: true, 
      demo: true,
      message: 'API temporarily unavailable, showing demo data',
      data: generateMockData(url)
    });
  }
}

function generateMockData(url) {
  let platform = 'TikTok';
  if (url.includes('youtube') || url.includes('youtu.be')) platform = 'YouTube';
  else if (url.includes('instagram')) platform = 'Instagram';
  else if (url.includes('facebook') || url.includes('fb.watch')) platform = 'Facebook';

  const mockData = {
    TikTok: {
      title: 'فيديو TikTok - بدون علامة مائية',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
      duration: '00:45',
      platform: 'TikTok',
      formats: [
        { quality: 'HD', ext: 'mp4', size: '8.5 MB', type: 'video', url: '#' },
        { quality: 'SD', ext: 'mp4', size: '4.2 MB', type: 'video', url: '#' },
        { quality: '128kbps', ext: 'mp3', size: '1.8 MB', type: 'audio', url: '#' }
      ]
    },
    YouTube: {
      title: 'فيديو YouTube - عالي الجودة',
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop',
      duration: '05:23',
      platform: 'YouTube',
      formats: [
        { quality: '1080p', ext: 'mp4', size: '45.2 MB', type: 'video', url: '#' },
        { quality: '720p', ext: 'mp4', size: '28.5 MB', type: 'video', url: '#' },
        { quality: '480p', ext: 'mp4', size: '15.1 MB', type: 'video', url: '#' },
        { quality: '128kbps', ext: 'mp3', size: '5.2 MB', type: 'audio', url: '#' }
      ]
    },
    Instagram: {
      title: 'Reel Instagram',
      thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600&h=400&fit=crop',
      duration: '00:30',
      platform: 'Instagram',
      formats: [
        { quality: '1080p', ext: 'mp4', size: '12.5 MB', type: 'video', url: '#' },
        { quality: '720p', ext: 'mp4', size: '8.2 MB', type: 'video', url: '#' }
      ]
    },
    Facebook: {
      title: 'فيديو Facebook',
      thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop',
      duration: '02:15',
      platform: 'Facebook',
      formats: [
        { quality: 'HD', ext: 'mp4', size: '35.8 MB', type: 'video', url: '#' },
        { quality: 'SD', ext: 'mp4', size: '18.2 MB', type: 'video', url: '#' }
      ]
    }
  };

  return mockData[platform] || mockData.TikTok;
}
