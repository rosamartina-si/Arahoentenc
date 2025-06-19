export default async function handler(req, res) {
  const { videoid } = req.query

  if (!videoid) {
    return res.status(400).json({ message: 'Falta el paràmetre videoid' })
  }

  try {
    // Primer obtenim les dades bàsiques del vídeo
    const infoResponse = await fetch(`https://api.ccma.cat/videos/${videoid}?version=2.0`)
    const infoData = await infoResponse.json()

    if (!infoResponse.ok) {
      return res.status(infoResponse.status).json({ message: infoData.message || 'Error al obtenir les dades del vídeo' })
    }

    // Obtenim les URLs de descàrrega
    const formats = await getVideoFormats(videoid)

    const videoInfo = {
      title: infoData.video.titol,
      description: infoData.video.descripcio,
      image: infoData.video.imatge,
      duration: infoData.video.durada,
      formats: formats
    }

    res.status(200).json(videoInfo)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Error intern del servidor' })
  }
}

async function getVideoFormats(videoId) {
  try {
    // Aquesta part pot variar segons l'API de TV3
    // En aquest exemple, suposem que podem obtenir les URLs directament
    const response = await fetch(`https://api.ccma.cat/videos/${videoId}/formats`)
    const data = await response.json()

    return data.formats.map(format => ({
      quality: format.quality,
      url: format.url
    }))
  } catch (error) {
    console.error('Error al obtenir formats:', error)
    return []
  }
}
