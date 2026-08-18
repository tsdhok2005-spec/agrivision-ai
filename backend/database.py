"""Small SQLite history store for local development.

Use a managed PostgreSQL database and object storage for production deployments.
"""
import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = Path(os.getenv("AGRIVISION_DB_PATH", ROOT / "data" / "agrivision.db"))


def _connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute(
        """CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY, kind TEXT NOT NULL, summary TEXT NOT NULL,
            payload TEXT NOT NULL, created_at TEXT NOT NULL
        )"""
    )
    return connection


def save_analysis(kind: str, summary: str, payload: dict) -> str:
    analysis_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    with _connection() as connection:
        connection.execute(
            "INSERT INTO analyses (id, kind, summary, payload, created_at) VALUES (?, ?, ?, ?, ?)",
            (analysis_id, kind, summary, json.dumps(payload), created_at),
        )
    return analysis_id


def list_analyses(limit: int = 30) -> list[dict]:
    with _connection() as connection:
        rows = connection.execute(
            "SELECT id, kind, summary, payload, created_at FROM analyses ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    return [{**dict(row), "payload": json.loads(row["payload"])} for row in rows]
