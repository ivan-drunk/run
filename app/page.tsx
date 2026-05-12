'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [totalListeners, setTotalListeners] = useState(0)
  const [displayListeners, setDisplayListeners] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()

        const total = data.total_listeners || 0
        const yesterday = data.yesterday_listeners || 0

        const delta = total - yesterday

        setTotalListeners(total)
        setDisplayListeners(yesterday)

        // плавное "донаращивание"
        if (delta > 0) {
          let current = yesterday
          const step = Math.max(1, Math.floor(delta / 50))

          interval = setInterval(() => {
            current += step

            if (current >= total) {
              current = total
              clearInterval(interval)
            }

            setDisplayListeners(current)
          }, 100)
        } else {
          setDisplayListeners(total)
        }
      } catch (e) {
        console.error('Ошибка загрузки статистики', e)
      }
    }

    fetchStats()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  return (
    <main style={styles.container}>
      {/* Заголовок */}
      <h1 style={styles.title}>
        С Сашей бежит уже
      </h1>

      {/* Счетчик */}
      <div style={styles.counter}>
        {displayListeners.toLocaleString('ru-RU')}
      </div>

      <div style={styles.sub}>
        слушателей
      </div>

      {/* CTA */}
      <a
        href="https://music.yandex.ru"
        target="_blank"
        style={styles.button}
      >
        Присоединяйся
      </a>

      {/* Видео */}
      <div style={styles.videoWrapper}>
        <iframe
          width="100%"
          height="315"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="Видео"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>

      {/* Telegram */}
      <a
        href="https://t.me/your_channel"
        target="_blank"
        style={styles.telegram}
      >
        <p className="text-[18px] font-semibold"> Подробнее о том, как это работает рассказали в видео <br /> Ну и конечно, ты можешь подписаться на наш Telegram - новый релиз уже совсем скоро </p>
      </a>
    </main>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#000',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    padding: '20px',
    gap: '20px',
  },

  title: {
    fontSize: '28px',
    opacity: 0.8,
  },

  counter: {
    fontSize: '72px',
    fontWeight: 'bold',
  },

  sub: {
    fontSize: '18px',
    opacity: 0.7,
  },

  button: {
    marginTop: '20px',
    padding: '14px 28px',
    background: '#fff',
    color: '#000',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },

  videoWrapper: {
    marginTop: '40px',
    width: '100%',
    maxWidth: '560px',
  },

  telegram: {
    marginTop: '20px',
    color: '#1DA1F2',
    textDecoration: 'none',
    fontSize: '16px',
  },
}