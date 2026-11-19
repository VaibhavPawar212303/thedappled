import { ImageResponse } from 'next/og'

export const alt = 'TheDappled – Learn programming with courses, books & a C memory visualizer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 90,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -3 }}>TheDappled</div>
        <div style={{ fontSize: 44, marginTop: 24, color: '#cbd5e1', lineHeight: 1.3 }}>
          Learn programming with courses, books & a C memory visualizer
        </div>
        <div style={{ fontSize: 30, marginTop: 48, color: '#93c5fd' }}>thedappled.com</div>
      </div>
    ),
    size,
  )
}
