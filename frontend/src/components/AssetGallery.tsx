import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type Asset = {
  id: string;
  title: string;
  date: string;
  image: string;
  alt: string;
  note: string;
  sourceName: string;
  sourceUrl: string;
  rights: string;
  contain?: boolean;
  plate?: boolean;
  facts?: { label: string; value: string }[];
};

export function AssetLightbox({ active, onClose }: { active: Asset | null; onClose: () => void }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!active) return null;

  return createPortal(
    <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={active.title} onClick={() => closeRef.current()}>
      <div className="media-lightbox-inner" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="media-close" onClick={() => closeRef.current()} aria-label="关闭大图">
          ×
        </button>
        <img src={active.image} alt={active.alt} />
        <div className="media-lightbox-caption">
          <strong>{active.title}</strong>
          <span>{active.sourceName}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function AssetCard({ asset, onOpen }: { asset: Asset; onOpen: (asset: Asset) => void }) {
  return (
    <article className="media-card">
      <button
        type="button"
        className={`media-thumb ${asset.contain ? "is-contain" : ""} ${asset.plate ? "is-plate" : ""}`}
        onClick={() => onOpen(asset)}
        aria-label={`查看大图：${asset.title}`}
      >
        <img src={asset.image} alt={asset.alt} loading="lazy" />
      </button>
      <div className="media-card-body">
        <div className="media-card-top">
          <h3>{asset.title}</h3>
          <span className="media-date">{asset.date}</span>
        </div>
        <p className="media-card-note">{asset.note}</p>
        <p className="media-source">
          来源：
          <a href={asset.sourceUrl} target="_blank" rel="noreferrer noopener">
            {asset.sourceName}
          </a>
        </p>
      </div>
    </article>
  );
}
