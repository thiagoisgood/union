from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Meta(Base):
    __tablename__ = "meta"

    key: Mapped[str] = mapped_column(primary_key=True)
    value: Mapped[str]


class Source(Base):
    __tablename__ = "sources"
    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(unique=True)
    title: Mapped[str]
    publisher: Mapped[str]
    url: Mapped[str]
    published_at: Mapped[str] = mapped_column(default="")
    note: Mapped[str] = mapped_column(default="")


class Club(Base):
    __tablename__ = "club"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    en_name: Mapped[str]
    short_name: Mapped[str]
    founded: Mapped[str]
    city: Mapped[str]
    colors: Mapped[str]
    motto: Mapped[str]
    membership_since: Mapped[str]
    stadium: Mapped[str]
    capacity: Mapped[int]
    market_value: Mapped[str]
    members: Mapped[int]
    former_names: Mapped[str]
    summary: Mapped[str]


class Milestone(Base):
    __tablename__ = "milestones"

    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[str] = mapped_column(index=True)
    title: Mapped[str]
    description: Mapped[str]
    category: Mapped[str]
    source_key: Mapped[str] = mapped_column(default="")


class Season(Base):
    __tablename__ = "seasons"

    id: Mapped[int] = mapped_column(primary_key=True)
    year: Mapped[int] = mapped_column(index=True)
    competition: Mapped[str]
    rank: Mapped[str]
    played: Mapped[int]
    won: Mapped[int]
    drawn: Mapped[int]
    lost: Mapped[int]
    goals_for: Mapped[int]
    goals_against: Mapped[int]
    points: Mapped[int]
    home_venue: Mapped[str]
    highlight: Mapped[str] = mapped_column(default="")


class Coach(Base):
    __tablename__ = "coaches"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    role: Mapped[str]
    nationality: Mapped[str]
    start_date: Mapped[str]
    end_date: Mapped[str] = mapped_column(default="")
    career: Mapped[str] = mapped_column(default="")
    record: Mapped[str] = mapped_column(default="")
    matches: Mapped[int] = mapped_column(default=0)
    wins: Mapped[int] = mapped_column(default=0)
    draws: Mapped[int] = mapped_column(default=0)
    losses: Mapped[int] = mapped_column(default=0)
    goals_for: Mapped[int] = mapped_column(default=0)
    goals_against: Mapped[int] = mapped_column(default=0)
    photo: Mapped[str] = mapped_column(default="")
    note: Mapped[str] = mapped_column(default="")


class ClubRecord(Base):
    __tablename__ = "club_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(unique=True)
    title: Mapped[str]
    holder: Mapped[str]
    value: Mapped[str]
    unit: Mapped[str] = mapped_column(default="")
    detail: Mapped[str] = mapped_column(default="")
    scope: Mapped[str] = mapped_column(default="")
    source_key: Mapped[str] = mapped_column(default="")


class Player(Base):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(primary_key=True)
    season_year: Mapped[int] = mapped_column(index=True)
    name: Mapped[str]
    number: Mapped[int | None] = mapped_column(default=None)
    position: Mapped[str]
    nationality: Mapped[str]
    birth_date: Mapped[str] = mapped_column(default="")
    hometown: Mapped[str] = mapped_column(default="")
    height: Mapped[int | None] = mapped_column(default=None)
    weight: Mapped[int | None] = mapped_column(default=None)
    foot: Mapped[str] = mapped_column(default="")
    u21: Mapped[bool] = mapped_column(default=False)
    photo: Mapped[str] = mapped_column(default="")
    appearances: Mapped[int] = mapped_column(default=0)
    starts: Mapped[int] = mapped_column(default=0)
    minutes: Mapped[int] = mapped_column(default=0)
    cup_apps: Mapped[int] = mapped_column(default=0)
    cup_starts: Mapped[int] = mapped_column(default=0)
    goals: Mapped[int] = mapped_column(default=0)
    assists: Mapped[int] = mapped_column(default=0)
    captain: Mapped[bool] = mapped_column(default=False)
    note: Mapped[str] = mapped_column(default="")


class Transfer(Base):
    __tablename__ = "transfers"

    id: Mapped[int] = mapped_column(primary_key=True)
    season_year: Mapped[int] = mapped_column(index=True)
    date: Mapped[str] = mapped_column(default="")
    player_name: Mapped[str]
    direction: Mapped[str]
    kind: Mapped[str]
    club: Mapped[str]
    fee: Mapped[str] = mapped_column(default="")
    source_key: Mapped[str] = mapped_column(default="")
    note: Mapped[str] = mapped_column(default="")


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True)
    season_year: Mapped[int] = mapped_column(index=True)
    competition: Mapped[str]
    round: Mapped[int | None] = mapped_column(default=None)
    date: Mapped[str] = mapped_column(index=True)
    is_home: Mapped[bool]
    opponent: Mapped[str]
    goals_for: Mapped[int | None]
    goals_against: Mapped[int | None]
    venue: Mapped[str] = mapped_column(default="")
    attendance: Mapped[int | None] = mapped_column(default=None)
    result: Mapped[str] = mapped_column(default="")
    scorers: Mapped[str] = mapped_column(default="")
    is_key: Mapped[bool] = mapped_column(default=False)
    note: Mapped[str] = mapped_column(default="")


class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    city: Mapped[str]
    capacity: Mapped[int]
    opened: Mapped[str]
    years: Mapped[str]
    note: Mapped[str] = mapped_column(default="")


class FanEvent(Base):
    __tablename__ = "fan_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[str]
    name: Mapped[str]
    location: Mapped[str]
    attendance: Mapped[int | None] = mapped_column(default=None)
    description: Mapped[str]
    source_key: Mapped[str] = mapped_column(default="")


class DevProgress(Base):
    __tablename__ = "dev_progress"

    id: Mapped[int] = mapped_column(primary_key=True)
    loop_index: Mapped[int]
    phase: Mapped[str]
    title: Mapped[str]
    status: Mapped[str]
    completed_at: Mapped[str] = mapped_column(default="")
    detail: Mapped[str] = mapped_column(default="")
