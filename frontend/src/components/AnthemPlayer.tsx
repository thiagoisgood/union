import { useEffect, useRef, useState } from "react";

function format(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AnthemPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(48);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setCurrent(0);
      audio.currentTime = 0;
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  };

  return (
    <div className="anthem-card">
      <audio ref={audioRef} src="/media/anthem/union-anthem.mp3" preload="metadata" />
      <div className="anthem-head">
        <span className="anthem-tag">ORIGINAL INSTRUMENTAL</span>
        <span className="anthem-eq" data-playing={playing} aria-hidden="true">
          <i /><i /><i /><i /><i />
        </span>
      </div>
      <div className="anthem-main">
        <div className="anthem-copy">
          <h3>联合战歌</h3>
          <p>
            为本站创作的器乐助威曲，不是俱乐部官方队歌。D 小调、120 BPM，用鼓点、铜管式和声与
            行进感旋律写成，模拟看台合唱由缓到强的推进。
          </p>
          <div className="anthem-meta">
            <span>0:48</span>
            <span>120 BPM</span>
            <span>D 小调</span>
            <span>器乐</span>
          </div>
        </div>
        <div className="anthem-player">
          <button
            type="button"
            className="anthem-play"
            onClick={toggle}
            aria-label={playing ? "暂停主题曲" : "播放主题曲"}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <rect x="7" y="5" width="3.4" height="14" rx="1" fill="currentColor" />
                <rect x="13.6" y="5" width="3.4" height="14" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
              </svg>
            )}
          </button>
          <div className="anthem-track">
            <input
              type="range"
              min={0}
              max={Math.max(duration, 1)}
              step={0.1}
              value={Math.min(current, duration)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="主题曲播放进度"
            />
            <div className="anthem-time">
              <span>{format(current)}</span>
              <span>{format(duration)}</span>
            </div>
          </div>
          <a className="anthem-download" href="/media/anthem/union-anthem.mp3" download>
            下载 MP3
          </a>
        </div>
      </div>
      <p className="anthem-license">
        授权：本站原创器乐，采用 CC0 1.0 公共领域贡献（CC0 1.0 Universal），可免费用于非商业或商业场景，无需署名；
        建议注明来源 union.mountainscene.top。
      </p>
    </div>
  );
}
