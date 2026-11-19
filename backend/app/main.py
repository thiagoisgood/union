from contextlib import asynccontextmanager
import re

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, inspect, or_, select
from sqlalchemy.orm import Session

from .db import SessionLocal, engine, get_db
from .models import (
    Base,
    ClubRecord,
    Club,
    Coach,
    DevProgress,
    FanEvent,
    Match,
    Milestone,
    News,
    Player,
    Season,
    Source,
    Transfer,
    Venue,
)
from .seed import seed


def to_dict(obj):
    return {c.key: getattr(obj, c.key) for c in inspect(obj).mapper.column_attrs}


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="陕西联合足球俱乐部数据服务", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/overview")
def overview(db: Session = Depends(get_db)):
    club = db.scalar(select(Club).limit(1))
    seasons = db.scalars(select(Season).order_by(Season.year.desc())).all()
    milestones = db.scalars(select(Milestone).order_by(Milestone.date.desc()).limit(5)).all()
    coaches = db.scalars(select(Coach).order_by(Coach.start_date.desc()).limit(3)).all()
    latest = seasons[0] if seasons else None
    return {
        "club": to_dict(club) if club else None,
        "seasons": [to_dict(s) for s in seasons],
        "latest_season": to_dict(latest) if latest else None,
        "recent_milestones": [to_dict(m) for m in milestones],
        "recent_coaches": [to_dict(c) for c in coaches],
        "stats": {
            "milestones": db.scalar(select(func.count()).select_from(Milestone)),
            "players": db.scalar(select(func.count()).select_from(Player)),
            "matches": db.scalar(select(func.count()).select_from(Match)),
            "sources": db.scalar(select(func.count()).select_from(Source)),
        },
    }


@app.get("/api/milestones")
def milestones(db: Session = Depends(get_db)):
    rows = db.scalars(select(Milestone).order_by(Milestone.date)).all()
    return [to_dict(m) for m in rows]


@app.get("/api/seasons")
def seasons(db: Session = Depends(get_db)):
    rows = db.scalars(select(Season).order_by(Season.year)).all()
    return [to_dict(s) for s in rows]


@app.get("/api/coaches")
def coaches(db: Session = Depends(get_db)):
    rows = db.scalars(select(Coach).order_by(Coach.start_date)).all()
    return [to_dict(c) for c in rows]


@app.get("/api/records")
def records(db: Session = Depends(get_db)):
    rows = db.scalars(select(ClubRecord).order_by(ClubRecord.id)).all()
    return [to_dict(r) for r in rows]


@app.get("/api/players")
def players(season: int | None = Query(default=None), db: Session = Depends(get_db)):
    stmt = select(Player)
    if season is not None:
        stmt = stmt.where(Player.season_year == season)
    rows = db.scalars(stmt.order_by(Player.captain.desc(), Player.number.nulls_last(), Player.id)).all()
    return [to_dict(p) for p in rows]


@app.get("/api/transfers")
def transfers(season: int | None = Query(default=None), db: Session = Depends(get_db)):
    stmt = select(Transfer)
    if season is not None:
        stmt = stmt.where(Transfer.season_year == season)
    rows = db.scalars(stmt.order_by(Transfer.date)).all()
    return [to_dict(t) for t in rows]


@app.get("/api/matches")
def matches(season: int | None = Query(default=None), db: Session = Depends(get_db)):
    stmt = select(Match)
    if season is not None:
        stmt = stmt.where(Match.season_year == season)
    rows = db.scalars(stmt.order_by(Match.date)).all()
    return [to_dict(m) for m in rows]


@app.get("/api/venues")
def venues(db: Session = Depends(get_db)):
    rows = db.scalars(select(Venue).order_by(Venue.years)).all()
    return [to_dict(v) for v in rows]


@app.get("/api/fan-events")
def fan_events(db: Session = Depends(get_db)):
    rows = db.scalars(select(FanEvent).order_by(FanEvent.date)).all()
    return [to_dict(f) for f in rows]


@app.get("/api/news")
def news(db: Session = Depends(get_db)):
    rows = db.scalars(select(News).order_by(News.date.desc(), News.id.desc())).all()
    return [to_dict(n) for n in rows]


@app.get("/api/sources")
def sources(db: Session = Depends(get_db)):
    rows = db.scalars(select(Source).order_by(Source.published_at.desc())).all()
    return [to_dict(s) for s in rows]


@app.get("/api/progress")
def progress(db: Session = Depends(get_db)):
    rows = db.scalars(select(DevProgress).order_by(DevProgress.loop_index)).all()
    return [to_dict(p) for p in rows]


@app.get("/api/audit")
def audit(db: Session = Depends(get_db)):
    source_keys = set(db.scalars(select(Source.key)).all())
    milestone_refs = db.scalars(select(Milestone.source_key)).all()
    fan_refs = db.scalars(select(FanEvent.source_key)).all()
    transfer_refs = db.scalars(select(Transfer.source_key)).all()
    references = [k for k in [*milestone_refs, *fan_refs, *transfer_refs] if k]
    missing = sorted({k for k in references if k not in source_keys})

    total_matches = db.scalar(select(func.count()).select_from(Match))
    unknown_matches = db.scalars(
        select(Match)
        .where(or_(Match.goals_for.is_(None), Match.goals_against.is_(None)))
        .order_by(Match.date)
    ).all()
    unknown_list = [
        {
            "date": m.date,
            "season_year": m.season_year,
            "opponent": m.opponent,
            "round": m.round,
        }
        for m in unknown_matches
    ]

    date_re = re.compile(r"^\d{4}-\d{2}(-\d{2})?$")
    dated = [
        ("里程碑", d) for d in db.scalars(select(Milestone.date)).all()
    ] + [
        ("比赛", d) for d in db.scalars(select(Match.date)).all()
    ] + [
        ("球迷事件", d) for d in db.scalars(select(FanEvent.date)).all()
    ]
    bad_dates = [{"kind": kind, "date": d} for kind, d in dated if not date_re.match(d)]

    checks = [
        {
            "key": "source_refs",
            "label": "来源引用完整",
            "status": "pass" if not missing else "warn",
            "detail": f"{len(source_keys)} 条来源，{len(references)} 处引用，"
            f"{'无悬空引用' if not missing else f'{len(missing)} 条悬空引用'}",
        },
        {
            "key": "unknown_scores",
            "label": "比分完整性",
            "status": "pass" if not unknown_list else "warn",
            "detail": f"已收录 {total_matches} 场，{len(unknown_list)} 场比分待核实",
        },
        {
            "key": "dates",
            "label": "日期格式",
            "status": "pass" if not bad_dates else "warn",
            "detail": f"检查 {len(dated)} 条日期，"
            f"{'全部符合 YYYY-MM 或 YYYY-MM-DD 格式' if not bad_dates else f'{len(bad_dates)} 条格式异常'}",
        },
    ]

    return {
        "checked_at": "2026-11-09",
        "source_count": len(source_keys),
        "reference_count": len(references),
        "missing_references": missing,
        "match_count": total_matches,
        "unknown_matches": unknown_list,
        "checks": checks,
    }
