import React from 'react'
import { Link } from 'react-router-dom'

export default function App(){
  console.log('🎨 App.jsx rendering')
  return (
    <header style={{
      padding:'1rem 2rem', 
      background: 'rgba(248, 249, 250, 0.95)',
      borderBottom:'2px solid rgba(0, 123, 255, 0.2)', 
      marginBottom:12,
      backdropFilter: 'blur(4px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      <nav style={{display:'flex', gap:16, alignItems:'center', flexWrap:'wrap', maxWidth:'1200px', margin:'0 auto'}}>
        <Link to="/" style={{fontWeight:'bold', textDecoration:'none', color:'#1a1a1a', fontSize:'16px'}}>👥 Users</Link>
        <Link to="/cars" style={{textDecoration:'none', color:'#333', transition:'color 0.2s'}}>🚗 Cars</Link>
        <Link to="/clients" style={{textDecoration:'none', color:'#333', transition:'color 0.2s'}}>👤 Clients</Link>
        <Link to="/orders" style={{textDecoration:'none', color:'#333', transition:'color 0.2s'}}>📦 Orders</Link>
        <Link to="/work-areas" style={{textDecoration:'none', color:'#333', transition:'color 0.2s'}}>🏢 Work Areas</Link>
        <Link to="/routes" style={{textDecoration:'none', color:'#333', transition:'color 0.2s'}}>🛣️ Routes</Link>
        <Link to="/optimize" style={{marginLeft:'auto', color:'#007bff', textDecoration:'none', fontWeight:'600', transition:'color 0.2s'}}>🗺️ Optimize</Link>
      </nav>
    </header>
  )
}
