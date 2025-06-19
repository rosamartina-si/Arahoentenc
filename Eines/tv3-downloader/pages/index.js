import { useState } from 'react'
import styles from '../styles/Search.module.css'

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const extractVideoId = (url) => {
    try {
      const match = url.match(/\/video\/(\d+)\//)
      return match ? match[1] : null
    } catch (e) {
      return null
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    setVideoInfo(null)

    try {
      const videoId = extractVideoId(videoUrl)
      if (!videoId) {
        throw new Error('URL no vàlida. Si us plau, introdueix una URL de vídeo de TV3 vàlida.')
      }

      // Fem la crida a través d'una API route de Next.js per evitar problemes de CORS
      const response = await fetch(`/api/tv3?videoid=${videoId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtenir les dades del vídeo')
      }

      setVideoInfo(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (url, quality) => {
    window.open(url, '_blank')
  }

  return (
    <div className={styles.container}>
      <main>
        <h1 className={styles.title}>Descarrega vídeos de TV3</h1>
        <div className={styles.search}>
          <label htmlFor="video-code" className={styles.description}>
            Introduïu l'adreça del vídeo
          </label>
          <div>
            <input
              id="video-code"
              type="text"
              placeholder="https://www.ccma.cat/tv3/alacarta/les-de-lhoquei/anna/video/5851449/"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={styles.input}
            />
            <button
              id="video-code-button"
              type="button"
              className={styles.button}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Carregant...' : 'Buscar'}
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {videoInfo && (
          <div className={styles.results}>
            <h2>{videoInfo.title}</h2>
            <img src={videoInfo.image} alt={videoInfo.title} className={styles.thumbnail} />
            <p>{videoInfo.description}</p>
            
            <h3>Opcions de descàrrega:</h3>
            <ul className={styles.downloadOptions}>
              {videoInfo.formats.map((format, index) => (
                <li key={index}>
                  <button 
                    onClick={() => handleDownload(format.url, format.quality)}
                    className={styles.downloadButton}
                  >
                    Descarregar {format.quality}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <footer>
        RB · <a href="http://twitter.com/RB">@</a> ·{' '}
        <a href="http://github.com/RB/getTV3Videos">GitHub</a>
      </footer>
    </div>
  )
}
