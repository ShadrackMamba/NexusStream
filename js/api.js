// ============================================================
// NexusStream API Engine — YouTube Data Layer
// ============================================================

const API = (() => {
  const API_KEY = 'AIzaSyBAWpsTe1by5NhDicIh31Ktnxash3JDtL8'; // Replace with real key
  const BASE = 'https://www.googleapis.com/youtube/v3';

  // Mock data for demo mode (when no API key)
  const MOCK = {
    trending: [
      { id: 'dQw4w9WgXcQ', title: 'Neural Interface: The Future of Computing', channel: 'TechVision', views: '12M', thumb: 'https://picsum.photos/seed/v1/480/270', duration: '12:34', category: 'Tech' },
      { id: 'jNQXAC9IVRw', title: 'Quantum AI Breaks Speed Records', channel: 'AIFrontier', views: '8.2M', thumb: 'https://picsum.photos/seed/v2/480/270', duration: '8:15', category: 'AI' },
      { id: 'oHg5SJYRHA0', title: 'Cyberpunk Gaming: Next-Gen Review', channel: 'GameNexus', views: '22M', thumb: 'https://picsum.photos/seed/v3/480/270', duration: '18:45', category: 'Gaming' },
      { id: 'kffacxfA7G4', title: 'Learn Machine Learning in 30 Days', channel: 'EduCore', views: '5.1M', thumb: 'https://picsum.photos/seed/v4/480/270', duration: '25:00', category: 'Education' },
      { id: 'XqZsoesa55w', title: 'Holographic Displays Are Here', channel: 'TechVision', views: '9.7M', thumb: 'https://picsum.photos/seed/v5/480/270', duration: '10:22', category: 'AI' },
      { id: 'fJ9rUzIMcZQ', title: 'Speed Run World Record Broken', channel: 'GameNexus', views: '31M', thumb: 'https://picsum.photos/seed/v6/480/270', duration: '6:08', category: 'Gaming' },
      { id: 'YykjpeuMNEk', title: 'Deep Space Exploration Guide', channel: 'CosmosEdu', views: '4.5M', thumb: 'https://picsum.photos/seed/v7/480/270', duration: '33:10', category: 'Education' },
      { id: 'wyx6JDQCslE', title: 'GPT-6 Capabilities Revealed', channel: 'AIFrontier', views: '18M', thumb: 'https://picsum.photos/seed/v8/480/270', duration: '14:55', category: 'AI' },
      { id: 'hY7m5jjJ9mM', title: 'Ultimate PC Build 2025', channel: 'TechVision', views: '7.3M', thumb: 'https://picsum.photos/seed/v9/480/270', duration: '21:30', category: 'Tech' },
      { id: 'tPEE9ZwImy0', title: 'Consciousness Upload: Fact or Fiction?', channel: 'FutureCast', views: '11M', thumb: 'https://picsum.photos/seed/v10/480/270', duration: '16:40', category: 'AI' },
    ],
    channels: [
      { id: 'ch1', name: 'TechVision', subs: '4.2M', avatar: 'https://picsum.photos/seed/ch1/100/100', banner: 'https://picsum.photos/seed/b1/1200/300' },
      { id: 'ch2', name: 'AIFrontier', subs: '2.8M', avatar: 'https://picsum.photos/seed/ch2/100/100', banner: 'https://picsum.photos/seed/b2/1200/300' },
      { id: 'ch3', name: 'GameNexus', subs: '8.1M', avatar: 'https://picsum.photos/seed/ch3/100/100', banner: 'https://picsum.photos/seed/b3/1200/300' },
      { id: 'ch4', name: 'EduCore', subs: '1.5M', avatar: 'https://picsum.photos/seed/ch4/100/100', banner: 'https://picsum.photos/seed/b4/1200/300' },
      { id: 'ch5', name: 'FutureCast', subs: '3.3M', avatar: 'https://picsum.photos/seed/ch5/100/100', banner: 'https://picsum.photos/seed/b5/1200/300' },
    ],
    categories: ['Gaming', 'Tech', 'Education', 'AI / Futuristic'],
  };

  const isMock = () => API_KEY === 'YOUR_YOUTUBE_API_KEY';

  async function fetchYT(endpoint, params) {
    const url = new URL(`${BASE}/${endpoint}`);
    url.searchParams.set('key', API_KEY);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
    return res.json();
  }

  return {
    async getTrending(maxResults = 10) {
      if (isMock()) return { items: MOCK.trending };
      const data = await fetchYT('videos', {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        maxResults,
        regionCode: 'US',
      });
      return {
        items: data.items.map(v => ({
          id: v.id,
          title: v.snippet.title,
          channel: v.snippet.channelTitle,
          views: formatViews(v.statistics?.viewCount),
          thumb: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url,
          duration: formatDuration(v.contentDetails?.duration),
          category: v.snippet.categoryId,
        }))
      };
    },

    async search(query, maxResults = 12) {
      if (isMock()) {
        const filtered = MOCK.trending.filter(v =>
          v.title.toLowerCase().includes(query.toLowerCase()) ||
          v.channel.toLowerCase().includes(query.toLowerCase())
        );
        return { items: filtered.length ? filtered : MOCK.trending.slice(0, 6) };
      }
      const data = await fetchYT('search', {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
      });
      return {
        items: data.items.map(v => ({
          id: v.id.videoId,
          title: v.snippet.title,
          channel: v.snippet.channelTitle,
          thumb: v.snippet.thumbnails?.high?.url,
          views: '—',
          duration: '—',
        }))
      };
    },

    async getVideoDetails(videoId) {
      if (isMock()) {
        return MOCK.trending.find(v => v.id === videoId) || MOCK.trending[0];
      }
      const data = await fetchYT('videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
      });
      const v = data.items[0];
      return {
        id: v.id,
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        views: formatViews(v.statistics?.viewCount),
        likes: formatViews(v.statistics?.likeCount),
        description: v.snippet.description,
        thumb: v.snippet.thumbnails?.maxres?.url || v.snippet.thumbnails?.high?.url,
        duration: formatDuration(v.contentDetails?.duration),
        publishedAt: new Date(v.snippet.publishedAt).toLocaleDateString(),
      };
    },

    async getChannelData(channelId) {
      if (isMock()) return MOCK.channels.find(c => c.id === channelId) || MOCK.channels[0];
      const data = await fetchYT('channels', {
        part: 'snippet,statistics,brandingSettings',
        id: channelId,
      });
      const c = data.items[0];
      return {
        id: c.id,
        name: c.snippet.title,
        subs: formatViews(c.statistics?.subscriberCount),
        avatar: c.snippet.thumbnails?.high?.url,
        banner: c.brandingSettings?.image?.bannerExternalUrl,
        description: c.snippet.description,
        videoCount: c.statistics?.videoCount,
      };
    },

    getMockData: () => MOCK,
  };

  function formatViews(n) {
    if (!n) return '0';
    const num = parseInt(n);
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return String(num);
  }

  function formatDuration(iso) {
    if (!iso) return '0:00';
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const h = parseInt(match[1] || 0);
    const m = parseInt(match[2] || 0);
    const s = parseInt(match[3] || 0);
    if (h) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
  }
})();
