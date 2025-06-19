import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import '../styles/globals.css'

// Component per gestionar el Google Analytics
const GoogleAnalytics = () => {
  useEffect(() => {
    const handleRouteChange = (url) => {
      window.gtag('config', 'UA-47659013-1', {
        page_path: url,
      })
    }
    
    const router = useRouter()
    router.events.on('routeChangeComplete', handleRouteChange)
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])
  
  return null
}

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Aplicació per descarregar vídeos de TV3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Component de Google Analytics */}
      <GoogleAnalytics />
      
      {/* Component principal */}
      <Component {...pageProps} />
      
      {/* Script de Google Analytics */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-47659013-1', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

export default MyApp
