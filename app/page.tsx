"use client";

import { useEffect, useMemo, useState } from "react";

type Stats = {
  total_streams: number;
  yesterday_streams: number;
  total_clicks: number;
  track_url: string;
  hero_image: string;
  planet_image: string;
  yandex_image: string;
  video_url: string;
  updated_at: string;
};

const TOTAL_DISTANCE = 40075;
const KM_PER_STREAM = 0.608;
const DAY_MS = 24 * 60 * 60 * 1000;
const UPDATE_INTERVAL_MS = 10 * 60 * 1000;

export default function Home() {
  const [data, setData] = useState<Stats | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((res) => setData(res));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, UPDATE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  const handleClick = async () => {
    try {
      const res = await fetch("/api/click", {
        method: "POST",
        keepalive: true,
        cache: "no-store",
      });

      if (!res.ok) return;

      const json = await res.json();

      if (typeof json.total_clicks === "number") {
        setData((prev) =>
          prev
            ? {
                ...prev,
                total_clicks: json.total_clicks,
              }
            : prev
        );
      } else {
        setData((prev) =>
          prev
            ? {
                ...prev,
                total_clicks: prev.total_clicks + 1,
              }
            : prev
        );
      }
    } catch (e) {
      console.error("Click error", e);
    }
  };

  const interpolatedStreams = useMemo(() => {
    if (!data) return 0;

    const updatedAtMs = data.updated_at
      ? new Date(data.updated_at).getTime()
      : now;

    const safeUpdatedAtMs = Number.isFinite(updatedAtMs) ? updatedAtMs : now;
    const elapsedMs = Math.max(0, now - safeUpdatedAtMs);
    const progressInDay = Math.min(1, elapsedMs / DAY_MS);

    const deltaStreams = Math.max(
      0,
      Number(data.total_streams || 0) - Number(data.yesterday_streams || 0)
    );

    const streams =
      Number(data.yesterday_streams || 0) + deltaStreams * progressInDay;

    return Math.floor(streams);
  }, [data, now]);

  const currentDistanceKm = Math.floor(interpolatedStreams * KM_PER_STREAM);

  const progress = useMemo(() => {
    const value = (currentDistanceKm / TOTAL_DISTANCE) * 100;
    return Number(Math.min(100, value).toFixed(1));
  }, [currentDistanceKm]);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-[#0d4b6b]">
        <div className="text-xl tracking-wide animate-pulse">Loading...</div>
      </main>
    );
  }

  const remainingKm = Math.max(0, TOTAL_DISTANCE - currentDistanceKm);

  const orbitRadius = 150;
  const orbitCirc = 2 * Math.PI * orbitRadius;
  const orbitOffset = orbitCirc * (1 - progress / 100);

  const gaugeLength = 251;
  const gaugeOffset = gaugeLength * (1 - progress / 100);

  return (
    <main className="min-h-screen bg-white text-[#0c4b6a]">
      <div className="max-w-[760px] mx-auto px-4 sm:px-5 pt-4 pb-16">
        {/* HERO */}
        <section className="rounded-[34px] overflow-hidden shadow-[0_10px_35px_rgba(79,115,136,0.22)] border border-white/30">
          <div className="relative bg-[#B6DAEB]">
            <img
              src={data.hero_image}
              alt="drunk band"
              className="w-full h-[320px] sm:h-[500px] object-contain md:object-cover object-center"
            />
          </div>

          <div className="bg-white pt-0 pb-6">
            <div className="relative -mt-20 sm:-mt-24 mx-4 sm:mx-8 rounded-[24px] border border-white bg-[#B6DAEB] backdrop-blur-md shadow-[0_8px_25px_rgba(73,107,127,0.15)] px-6 sm:px-8 py-6 sm:py-7">
              <div className="space-y-4 text-[13px] sm:text-[15px] leading-[1.4] text-[#0c4b6a] font-semibold">
                <p>
                  Привет! Это группа “друнк” и мы отправили нашего барабанщика
                  Сашу пробежать вокруг света.
                </p>
                <p>
                  Недавно у нас вышел сингл “Навсегда к тебе”, о том, что
                  каждый может прийти к своему счастью.
                </p>
                <p>
                  И чтобы подчеркнуть это, мы предлагаем тебе бежать вместе с
                  нами.
                </p>
                <p>Каждое прослушивание — дополнительные 608 метров.</p>
              </div>

              <div className="flex justify-end mt-6">
                <a
                  href="#details"
                  className="bg-[#f5f4f2] hover:bg-white text-[#0c4b6a] text-[15px] font-bold px-7 py-3 rounded-[16px] border border-[#d8e6ee]"
                >
                  Узнать подробности
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* PLANET */}
        <section className="mt-6 rounded-[26px] border border-white/40 bg-[#B6DAEB] px-4 sm:px-6 py-6 shadow-[0_8px_30px_rgba(79,115,136,0.10)]">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
            <div className="relative mx-auto flex h-[340px] w-[340px] shrink-0 items-center justify-center">
              <svg
                className="absolute inset-0 z-10 h-full w-full"
                viewBox="0 0 340 340"
              >
                <circle
                  cx="170"
                  cy="170"
                  r={orbitRadius}
                  fill="none"
                  stroke="#d7e6ef"
                  strokeWidth="3"
                />
                <circle
                  cx="170"
                  cy="170"
                  r={orbitRadius}
                  fill="none"
                  stroke="#0b5d88"
                  strokeWidth="5"
                  strokeDasharray={orbitCirc}
                  strokeDashoffset={orbitOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 170 170)"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(11,93,136,0.4))",
                  }}
                />
              </svg>

              <img
                src={data.planet_image}
                alt="planet"
                className="relative z-0 w-[255px] sm:w-[275px] object-contain"
              />
            </div>

            <div className="w-full flex flex-col gap-5">
              <div className="bg-white rounded-[22px] px-6 py-6 border border-[#dbe8ef]">
                <div className="text-[#0b4b6b] text-[18px] font-bold mb-4">
                  Пройдено:
                </div>
                <div className="text-[#0b4b6b] text-[42px] font-black">
                  {currentDistanceKm.toLocaleString("ru-RU")}
                  <span className="ml-3">км</span>
                </div>
              </div>

              <div className="bg-white rounded-[22px] px-6 py-6 border border-[#dbe8ef]">
                <div className="text-[#0b4b6b] text-[18px] font-bold mb-4">
                  Осталось:
                </div>
                <div className="text-[#0b4b6b] text-[42px] font-black">
                  {remainingKm.toLocaleString("ru-RU")}
                  <span className="ml-3">км</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRACK CTA */}
        <section className="mt-8">
          <div className="bg-white border-[2px] border-[#3f7392] rounded-[22px] px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 overflow-hidden">
            <img
              src={data.yandex_image}
              alt="yandex music"
              className="w-10 h-10 object-contain shrink-0 self-center sm:self-auto"
            />

            <p className="w-full sm:flex-1 min-w-0 text-center text-[#0b4b6b] text-[18px] sm:text-[20px] font-medium">
              друнк — Навсегда к тебе
            </p>

            <a
              href={data.track_url}
              target="_blank"
              rel="noreferrer"
              onClick={handleClick}
              className="w-full sm:w-auto bg-[#00517c] hover:bg-[#004568] text-white font-bold px-5 py-3 rounded-[14px] whitespace-nowrap shrink-0 text-center"
            >
              Слушать на Яндекс.Музыке
            </a>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-[24px] border border-[#dbe8ef] px-6 py-6 min-h-[240px] flex flex-col justify-center items-center text-center">
            <p className="text-[18px] font-bold">Вместе с Сашей бежит уже:</p>

            <div className="mt-4 text-[52px] font-black leading-none">
              {data.total_clicks.toLocaleString("ru-RU")}
              <span className="ml-2 text-[28px] align-middle">чел</span>
            </div>

            <a
              href="https://music.yandex.ru/artist/18926860"
              target="_blank"
              rel="noreferrer"
              onClick={handleClick}
              className="mt-5 bg-[#00517c] text-white font-bold px-5 py-3 rounded-[14px]"
            >
              Присоединяйся!
            </a>
          </div>

          <div className="bg-white rounded-[24px] border border-[#dbe8ef] px-6 py-6 min-h-[240px] flex flex-col items-center justify-center text-center">
            <p className="text-[18px] font-bold">Пройдено пути:</p>

            <div className="mt-4 flex flex-col items-center justify-center">
              <div className="relative w-[220px] h-[120px]">
                <svg
                  width="220"
                  height="120"
                  viewBox="0 0 220 120"
                  className="absolute inset-0 block"
                >
                  <path
                    d="M20 100 A80 80 0 0 1 200 100"
                    fill="none"
                    stroke="#e6eef5"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 100 A80 80 0 0 1 200 100"
                    fill="none"
                    stroke="#0b5d88"
                    strokeWidth="14"
                    strokeDasharray={gaugeLength}
                    strokeDashoffset={gaugeOffset}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="mt-1 text-[52px] font-black text-[#0b4b6b] leading-none">
                {progress}%
              </div>
            </div>
          </div>
        </section>

        {/* VIDEO + TELEGRAM */}
        <section className="mt-8 flex flex-col md:flex-row gap-5">
          {data.video_url ? (
            <video
              src={data.video_url}
              controls
              playsInline
              className="w-full md:w-[210px] rounded-[22px] border-[3px] border-[#3f7392] object-cover"
            />
          ) : (
            <div className="w-full md:w-[210px] rounded-[22px] border-[3px] border-[#3f7392] bg-[#f5f4f2] min-h-[280px] flex items-center justify-center text-[#0c4b6a] font-medium">
              Видео
            </div>
          )}

          <div className="flex-1 rounded-[28px] bg-[#B6DAEB] px-7 py-7">
            <p className="text-[18px] font-semibold">
              Подробнее о том, как это работает рассказали в видео
              <br />
              Ну и конечно, ты можешь подписаться на наш Telegram
            </p>

            <div className="flex justify-end mt-8">
              <a
                href="https://t.me/drunk_band"
                target="_blank"
                rel="noreferrer"
                className="bg-[#f5f4f2] text-[#0c4b6a] font-bold px-8 py-4 rounded-[16px]"
              >
                Telegram
              </a>
            </div>
          </div>
        </section>

        <div id="details" className="mt-10" />
      </div>
    </main>
  );
}