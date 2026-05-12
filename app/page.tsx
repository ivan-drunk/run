"use client";

import { useEffect, useMemo, useState } from "react";

type Stats = {
  total_streams: number;
  yesterday_streams: number;

  total_listeners: number;
  yesterday_listeners: number;

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

  // --- STREAMS (как было) ---
  const interpolatedStreams = useMemo(() => {
    if (!data) return 0;

    const updatedAtMs = data.updated_at
      ? new Date(data.updated_at).getTime()
      : now;

    const elapsedMs = Math.max(0, now - updatedAtMs);
    const progressInDay = Math.min(1, elapsedMs / DAY_MS);

    const delta =
      Number(data.total_streams) - Number(data.yesterday_streams);

    return Math.floor(
      Number(data.yesterday_streams) + Math.max(0, delta) * progressInDay
    );
  }, [data, now]);

  // --- LISTENERS (аналогично streams) ---
  const interpolatedListeners = useMemo(() => {
    if (!data) return 0;

    const updatedAtMs = data.updated_at
      ? new Date(data.updated_at).getTime()
      : now;

    const elapsedMs = Math.max(0, now - updatedAtMs);
    const progressInDay = Math.min(1, elapsedMs / DAY_MS);

    const delta =
      Number(data.total_listeners) - Number(data.yesterday_listeners);

    return Math.floor(
      Number(data.yesterday_listeners) + Math.max(0, delta) * progressInDay
    );
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

        {/* HERO — без изменений */}
        <section className="rounded-[34px] overflow-hidden shadow-[0_10px_35px_rgba(79,115,136,0.22)] border border-white/30">
          <div className="relative bg-[#B6DAEB]">
            <img
              src={data.hero_image}
              alt="drunk band"
              className="w-full h-[320px] sm:h-[500px] object-contain md:object-cover object-center"
            />
          </div>

          <div className="bg-white pt-0 pb-6">
            <div className="relative -mt-20 sm:-mt-24 mx-4 sm:mx-8 rounded-[24px] border border-white bg-[#B6DAEB] px-6 sm:px-8 py-6 sm:py-7">
              <div className="space-y-4 text-[13px] sm:text-[15px] font-semibold">
                <p>Привет! Это группа “друнк”...</p>
                <p>Недавно у нас вышел сингл...</p>
                <p>И чтобы подчеркнуть это...</p>
                <p>Каждое прослушивание — дополнительные 608 метров.</p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-[24px] border px-6 py-6 text-center">
            <p className="text-[18px] font-bold">
              Вместе с Сашей бежит уже:
            </p>

            <div className="mt-4 text-[52px] font-black">
              {interpolatedListeners.toLocaleString("ru-RU")}
              <span className="ml-2 text-[28px]">чел</span>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border px-6 py-6 text-center">
            <p className="text-[18px] font-bold">Пройдено пути:</p>

            <div className="mt-4 text-[52px] font-black">
              {progress}%
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}