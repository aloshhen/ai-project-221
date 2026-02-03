import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// SafeIcon Component - handles all Lucide icons safely
const SafeIcon = ({ name, size = 24, className, ...props }) => {
  const [Icon, setIcon] = useState(null)
  
  useEffect(() => {
    import('lucide-react').then((icons) => {
      const iconName = name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      const FoundIcon = icons[iconName] || icons.HelpCircle
      setIcon(() => FoundIcon)
    })
  }, [name])
  
  if (!Icon) return <div style={{ width: size, height: size }} className={className} />
  
  return <Icon size={size} className={className} {...props} />
}

// Dust II Map Component
const Dust2Map = () => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  
  // Spawn points for Dust II (approximate coordinates for visualization)
  const spawnPoints = [
    { lng: -10, lat: 5, title: 'T Spawn', type: 't', color: '#ef4444' },
    { lng: 10, lat: -5, title: 'CT Spawn', type: 'ct', color: '#3b82f6' },
    { lng: -5, lat: 8, title: 'A Long', type: 'bombsite', color: '#f59e0b' },
    { lng: 5, lat: -8, title: 'B Site', type: 'bombsite', color: '#f59e0b' },
    { lng: 0, lat: 0, title: 'Mid', type: 'neutral', color: '#10b981' },
    { lng: -8, lat: 2, title: 'Catwalk', type: 'neutral', color: '#6b7280' },
    { lng: 8, lat: -2, title: 'Tunnel', type: 'neutral', color: '#6b7280' },
  ]

  useEffect(() => {
    if (map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [0, 0],
      zoom: 11,
      attributionControl: false,
      interactive: true,
      dragPan: true,
      dragRotate: false,
      touchZoomRotate: false,
      doubleClickZoom: true,
      keyboard: false
    })

    map.current.scrollZoom.disable()

    // Add custom markers for spawn points
    spawnPoints.forEach(point => {
      const el = document.createElement('div')
      el.className = 'custom-map-marker'
      el.style.cssText = `
        width: 28px;
        height: 28px;
        background: ${point.color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 12px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
      `
      el.innerHTML = point.type === 't' ? 'T' : point.type === 'ct' ? 'CT' : '★'

      new maplibregl.Marker({ element: el })
        .setLngLat([point.lng, point.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25, closeButton: false })
            .setHTML(`<div style="color: #111; font-weight: bold; padding: 4px;">${point.title}</div>`)
        )
        .addTo(map.current)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 glass-panel px-4 py-2 rounded-lg">
        <span className="text-sm font-bold text-amber-400">Dust II</span>
        <span className="text-xs text-gray-400 ml-2">Interactive Map</span>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="flex items-center gap-1 glass-panel px-2 py-1 rounded text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-300">T</span>
        </div>
        <div className="flex items-center gap-1 glass-panel px-2 py-1 rounded text-xs">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-300">CT</span>
        </div>
        <div className="flex items-center gap-1 glass-panel px-2 py-1 rounded text-xs">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-300">Site</span>
        </div>
      </div>
    </div>
  )
}

// Match Card Component
const MatchCard = ({ match, index }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-panel rounded-xl p-6 hover:border-amber-500/50 transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{match.tournament}</span>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full",
          match.status === 'LIVE' ? "bg-red-500/20 text-red-400 animate-pulse" :
          match.status === 'UPCOMING' ? "bg-blue-500/20 text-blue-400" :
          "bg-gray-700 text-gray-400"
        )}>
          {match.status}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-400">
            {match.team1.logo}
          </div>
          <div>
            <div className="font-bold text-white">{match.team1.name}</div>
            <div className="text-sm text-gray-500">#{match.team1.rank}</div>
          </div>
        </div>
        
        <div className="text-center px-4">
          <div className="text-2xl font-black text-white">
            {match.score1 !== null ? `${match.score1} - ${match.score2}` : 'VS'}
          </div>
          <div className="text-xs text-gray-500 mt-1">{match.time}</div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold text-white">{match.team2.name}</div>
            <div className="text-sm text-gray-500">#{match.team2.rank}</div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-400">
            {match.team2.logo}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm">
        <span className="text-gray-500 flex items-center gap-1">
          <SafeIcon name="map-pin" size={14} />
          {match.map}
        </span>
        <button className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
          Watch <SafeIcon name="chevron-right" size={16} />
        </button>
      </div>
    </motion.div>
  )
}

// Skin Card Component
const SkinCard = ({ skin, index }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass-panel rounded-xl overflow-hidden group hover:border-amber-500/50 transition-all cursor-pointer"
    >
      <div className="relative h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
        <div className="text-5xl transform group-hover:scale-110 transition-transform">{skin.image}</div>
        <div className={cn(
          "absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-bold",
          skin.rarity === 'Covert' ? "bg-red-500/20 text-red-400" :
          skin.rarity === 'Classified' ? "bg-pink-500/20 text-pink-400" :
          skin.rarity === 'Restricted' ? "bg-purple-500/20 text-purple-400" :
          "bg-blue-500/20 text-blue-400"
        )}>
          {skin.rarity}
        </div>
      </div>
      <div className="p-4">
        <div className="font-bold text-white mb-1 truncate">{skin.name}</div>
        <div className="text-sm text-gray-500 mb-3">{skin.weapon}</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-black text-amber-400">${skin.price}</div>
            <div className={cn(
              "text-xs flex items-center gap-1",
              skin.trend > 0 ? "text-green-400" : "text-red-400"
            )}>
              <SafeIcon name={skin.trend > 0 ? "trending-up" : "trending-down"} size={12} />
              {Math.abs(skin.trend)}%
            </div>
          </div>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors">
            Trade
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Team Card Component
const TeamCard = ({ team, index }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-panel rounded-xl p-6 flex items-center gap-4 hover:border-amber-500/50 transition-all group"
    >
      <div className="text-3xl font-black text-gray-700 w-12">#{team.rank}</div>
      <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center text-3xl">
        {team.logo}
      </div>
      <div className="flex-1">
        <div className="font-bold text-white text-lg">{team.name}</div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span className="text-amber-400">{team.region}</span>
          <span>•</span>
          <span>{team.players} players</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-black text-amber-400">{team.rating}</div>
        <div className="text-xs text-gray-500">Rating</div>
      </div>
    </motion.div>
  )
}

// Tournament Card
const TournamentCard = ({ tournament, index }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-panel rounded-xl overflow-hidden hover:border-amber-500/50 transition-all"
    >
      <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div className="text-4xl mb-2">{tournament.logo}</div>
          <div className="font-bold text-xl text-white">{tournament.name}</div>
        </div>
        <div className="absolute top-4 right-4">
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            tournament.status === 'ONGOING' ? "bg-green-500/20 text-green-400" :
            tournament.status === 'UPCOMING' ? "bg-blue-500/20 text-blue-400" :
            "bg-gray-700 text-gray-400"
          )}>
            {tournament.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <SafeIcon name="calendar" size={14} />
            {tournament.dates}
          </span>
          <span className="text-sm text-amber-400 font-semibold">{tournament.prize}</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Teams:</span>
          <div className="flex -space-x-2">
            {tournament.teams.map((team, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs border-2 border-gray-900">
                {team}
              </div>
            ))}
          </div>
        </div>
        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
          View Details <SafeIcon name="arrow-right" size={14} />
        </button>
      </div>
    </motion.div>
  )
}

// News Card
const NewsCard = ({ news, index }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-panel rounded-xl overflow-hidden hover:border-amber-500/50 transition-all group cursor-pointer"
    >
      <div className="h-48 bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800" />
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-50 group-hover:scale-110 transition-transform">
          {news.image}
        </div>
        <div className="absolute top-4 left-4">
          <span className="bg-amber-600 text-white text-xs px-3 py-1 rounded-full font-bold">
            {news.category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <SafeIcon name="clock" size={14} />
          {news.date}
          <span>•</span>
          <span className="text-amber-400">{news.readTime}</span>
        </div>
        <h3 className="font-bold text-xl text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
          {news.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {news.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
              {news.author[0]}
            </div>
            <span className="text-sm text-gray-400">{news.author}</span>
          </div>
          <SafeIcon name="arrow-up-right" size={18} className="text-gray-500 group-hover:text-amber-400 transition-colors" />
        </div>
      </div>
    </motion.article>
  )
}

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Sample data
  const matches = [
    {
      id: 1,
      tournament: 'Blast Premier',
      status: 'LIVE',
      team1: { name: 'NAVI', logo: '🔷', rank: 1 },
      team2: { name: 'FaZe', logo: '🔴', rank: 3 },
      score1: 14,
      score2: 12,
      map: 'Mirage',
      time: 'Round 27/30'
    },
    {
      id: 2,
      tournament: 'ESL Pro League',
      status: 'UPCOMING',
      team1: { name: 'G2', logo: '⚫', rank: 2 },
      team2: { name: 'Vitality', logo: '🟡', rank: 4 },
      score1: null,
      score2: null,
      map: 'Dust II',
      time: 'Today, 18:00 CET'
    },
    {
      id: 3,
      tournament: 'IEM Katowice',
      status: 'FINISHED',
      team1: { name: 'Spirit', logo: '🟢', rank: 5 },
      team2: { name: 'MOUZ', logo: '⚪', rank: 6 },
      score1: 2,
      score2: 0,
      map: 'Inferno',
      time: 'Yesterday'
    }
  ]

  const skins = [
    { id: 1, name: 'Dragon Lore', weapon: 'AWP', price: '12,450', trend: 5.2, rarity: 'Covert', image: '🐉' },
    { id: 2, name: 'Howl', weapon: 'M4A4', price: '8,900', trend: -2.1, rarity: 'Covert', image: '🐺' },
    { id: 3, name: 'Fade', weapon: 'Glock-18', price: '1,250', trend: 3.5, rarity: 'Restricted', image: '🌈' },
    { id: 4, name: 'Crimson Web', weapon: 'Karambit', price: '3,800', trend: 1.8, rarity: 'Covert', image: '🕷️' },
    { id: 5, name: 'Doppler', weapon: 'Butterfly', price: '2,100', trend: 8.4, rarity: 'Classified', image: '💎' },
    { id: 6, name: 'Tiger Tooth', weapon: 'M9 Bayonet', price: '1,650', trend: -0.5, rarity: 'Restricted', image: '🐯' },
    { id: 7, name: 'Asiimov', weapon: 'AK-47', price: '180', trend: 2.3, rarity: 'Classified', image: '🤖' },
    { id: 8, name: 'Hyper Beast', weapon: 'AWP', price: '95', trend: -1.2, rarity: 'Classified', image: '🦁' },
  ]

  const teams = [
    { rank: 1, name: 'Natus Vincere', logo: '🔷', region: 'EU', players: 5, rating: 965 },
    { rank: 2, name: 'G2 Esports', logo: '⚫', region: 'EU', players: 5, rating: 892 },
    { rank: 3, name: 'FaZe Clan', logo: '🔴', region: 'EU', players: 5, rating: 879 },
    { rank: 4, name: 'Team Vitality', logo: '🟡', region: 'EU', players: 5, rating: 856 },
    { rank: 5, name: 'Spirit', logo: '🟢', region: 'CIS', players: 5, rating: 834 },
    { rank: 6, name: 'MOUZ', logo: '⚪', region: 'EU', players: 5, rating: 812 },
  ]

  const tournaments = [
    {
      id: 1,
      name: 'Blast Premier',
      logo: '💥',
      status: 'ONGOING',
      dates: 'Jan 15 - Mar 30',
      prize: '$1,000,000',
      teams: ['NAVI', 'G2', 'FaZe', 'Vitality']
    },
    {
      id: 2,
      name: 'ESL Pro League',
      logo: '🏆',
      status: 'UPCOMING',
      dates: 'Mar 1 - May 15',
      prize: '$850,000',
      teams: ['Spirit', 'MOUZ', 'C9', 'EF']
    },
    {
      id: 3,
      name: 'IEM Katowice',
      logo: '🇵🇱',
      status: 'FINISHED',
      dates: 'Jan 29 - Feb 11',
      prize: '$1,000,000',
      teams: ['FaZe', 'NAVI', 'G2', 'Spirit']
    }
  ]

  const news = [
    {
      id: 1,
      title: 'CS2 Update: New Operation "Frost" Leaked - What to Expect',
      excerpt: 'Data miners have discovered new files suggesting a winter-themed operation coming next month...',
      category: 'Update',
      date: '2 hours ago',
      readTime: '5 min read',
      author: 'Mike Johnson',
      image: '❄️'
    },
    {
      id: 2,
      title: 's1mple Returns: "I\'m Ready to Dominate Again"',
      excerpt: 'The Ukrainian superstar breaks silence about his comeback and new team dynamics...',
      category: 'Interview',
      date: '5 hours ago',
      readTime: '8 min read',
      author: 'Sarah Chen',
      image: '👑'
    },
    {
      id: 3,
      title: 'Major Changes Coming to Competitive Map Pool in 2025',
      excerpt: 'Valve hints at significant rotations with new maps entering the active duty pool...',
      category: 'Esports',
      date: '1 day ago',
      readTime: '6 min read',
      author: 'Alex Turner',
      image: '🗺️'
    }
  ]

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-950/90 backdrop-blur-xl z-50 border-b border-gray-800/50">
        <nav className="container mx-auto max-w-7xl px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-xl font-black text-white">
                CS
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                CS<span className="text-amber-500">GO</span> Hub
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('matches')} className="text-gray-400 hover:text-amber-400 transition-colors font-medium">Matches</button>
              <button onClick={() => scrollToSection('map')} className="text-gray-400 hover:text-amber-400 transition-colors font-medium">Maps</button>
              <button onClick={() => scrollToSection('skins')} className="text-gray-400 hover:text-amber-400 transition-colors font-medium">Skins</button>
              <button onClick={() => scrollToSection('teams')} className="text-gray-400 hover:text-amber-400 transition-colors font-medium">Teams</button>
              <button onClick={() => scrollToSection('tournaments')} className="text-gray-400 hover:text-amber-400 transition-colors font-medium">Tournaments</button>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <SafeIcon name="search" size={20} />
              </button>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all hover:scale-105 flex items-center gap-2">
                <SafeIcon name="steam" size={18} />
                Connect
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <SafeIcon name={mobileMenuOpen ? "x" : "menu"} size={24} />
            </button>
          </div>
          
          {/* Mobile Nav */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-gray-800"
              >
                <div className="flex flex-col gap-4">
                  <button onClick={() => scrollToSection('matches')} className="text-gray-400 hover:text-amber-400 transition-colors text-left py-2">Matches</button>
                  <button onClick={() => scrollToSection('map')} className="text-gray-400 hover:text-amber-400 transition-colors text-left py-2">Maps</button>
                  <button onClick={() => scrollToSection('skins')} className="text-gray-400 hover:text-amber-400 transition-colors text-left py-2">Skins</button>
                  <button onClick={() => scrollToSection('teams')} className="text-gray-400 hover:text-amber-400 transition-colors text-left py-2">Teams</button>
                  <button onClick={() => scrollToSection('tournaments')} className="text-gray-400 hover:text-amber-400 transition-colors text-left py-2">Tournaments</button>
                  <button className="bg-amber-600 text-white px-5 py-3 rounded-lg font-bold mt-2">
                    Connect Steam
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-gray-950 to-gray-950" />
        <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 text-sm font-semibold">Blast Premier Finals Live Now</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight">
              Master the <span className="text-gradient">Game</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Your ultimate destination for CS2 esports. Live matches, skin trading, pro stats, and tournament coverage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => scrollToSection('matches')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25"
              >
                <SafeIcon name="play" size={20} />
                Watch Live
              </button>
              <button 
                onClick={() => scrollToSection('skins')}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 border border-gray-700"
              >
                <SafeIcon name="shopping-bag" size={20} />
                Browse Skins
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Matches Section */}
      <section id="matches" className="py-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                Live <span className="text-amber-500">Matches</span>
              </h2>
              <p className="text-gray-400">Track ongoing and upcoming pro matches</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              View All <SafeIcon name="arrow-right" size={18} />
            </button>
          </div>
          <div className="grid gap-4">
            {matches.map((match, index) => (
              <MatchCard key={match.id} match={match} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section id="map" className="py-20 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Interactive <span className="text-amber-500">Map</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore Dust II spawn points, bomb sites, and key positions. Click markers for details.
            </p>
          </div>
          <Dust2Map />
        </div>
      </section>

      {/* Skins Market Section */}
      <section id="skins" className="py-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                Skin <span className="text-amber-500">Market</span>
              </h2>
              <p className="text-gray-400">Real-time prices and trading</p>
            </div>
            <div className="flex gap-2">
              {['all', 'knives', 'rifles', 'pistols'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-semibold transition-all capitalize",
                    activeTab === tab 
                      ? "bg-amber-600 text-white" 
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skins.map((skin, index) => (
              <SkinCard key={skin.id} skin={skin} index={index} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2">
              View All Skins <SafeIcon name="chevron-right" size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Top Teams Section */}
      <section id="teams" className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Top <span className="text-amber-500">Teams</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Current HLTV rankings and team statistics. Updated weekly based on tournament performance.
              </p>
              <div className="space-y-4">
                {teams.map((team, index) => (
                  <TeamCard key={team.rank} team={team} index={index} />
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <SafeIcon name="trending-up" className="text-amber-500" />
                Ranking Changes
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                      <SafeIcon name="arrow-up" size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-white">Spirit</div>
                      <div className="text-sm text-gray-500">+2 positions</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">#5</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                      <SafeIcon name="arrow-down" size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-white">FaZe Clan</div>
                      <div className="text-sm text-gray-500">-1 position</div>
                    </div>
                  </div>
                  <div className="text-red-400 font-bold">#3</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-gray-400">
                      <SafeIcon name="minus" size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-white">NAVI</div>
                      <div className="text-sm text-gray-500">No change</div>
                    </div>
                  </div>
                  <div className="text-amber-400 font-bold">#1</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last updated</span>
                  <span className="text-gray-400">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      <section id="tournaments" className="py-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Major <span className="text-amber-500">Tournaments</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              ESL, Blast Premier, IEM and more. Track schedules, prizes, and participating teams.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tournaments.map((tournament, index) => (
              <TournamentCard key={tournament.id} tournament={tournament} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                Latest <span className="text-amber-500">News</span>
              </h2>
              <p className="text-gray-400">Updates, interviews, and esports coverage</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              All News <SafeIcon name="arrow-right" size={18} />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <NewsCard key={item.id} news={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="glass-panel rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                Ready to <span className="text-amber-400">Compete?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join millions of players worldwide. Connect your Steam account to track your stats, inventory, and match history.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <SafeIcon name="steam" size={20} />
                  Connect Steam
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 border border-gray-700">
                  <SafeIcon name="user-plus" size={20} />
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-sm font-black text-white">
                  CS
                </div>
                <span className="text-xl font-black text-white">
                  CS<span className="text-amber-500">GO</span> Hub
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                The ultimate Counter-Strike 2 companion. Stats, skins, matches, and esports coverage.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('matches')} className="text-gray-500 hover:text-amber-400 transition-colors">Matches</button></li>
                <li><button onClick={() => scrollToSection('skins')} className="text-gray-500 hover:text-amber-400 transition-colors">Skin Market</button></li>
                <li><button onClick={() => scrollToSection('teams')} className="text-gray-500 hover:text-amber-400 transition-colors">Teams</button></li>
                <li><button onClick={() => scrollToSection('tournaments')} className="text-gray-500 hover:text-amber-400 transition-colors">Tournaments</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">Steam Integration</a></li>
                <li><a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">Trading Guide</a></li>
                <li><a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Connect</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-amber-600 hover:text-white transition-all">
                  <SafeIcon name="twitter" size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-amber-600 hover:text-white transition-all">
                  <SafeIcon name="twitch" size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-amber-600 hover:text-white transition-all">
                  <SafeIcon name="youtube" size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-amber-600 hover:text-white transition-all">
                  <SafeIcon name="discord" size={18} />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2025 CS:GO Hub. Not affiliated with Valve Corporation.
            </p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App