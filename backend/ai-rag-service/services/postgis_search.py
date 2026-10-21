"""Async, neutral advocate discovery queries for PostGIS."""

from dataclasses import dataclass
from typing import Literal

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

SortBy = Literal["alphabetical", "distance"]


@dataclass(frozen=True)
class AdvocateSearch:
    """A district boundary and a point used for an auditable search."""

    district_geojson: str
    longitude: float
    latitude: float
    sort_by: SortBy = "alphabetical"
    limit: int = 50


_ORDER_BY = {
    "alphabetical": "name ASC, id ASC",
    "distance": "distance_m ASC, name ASC, id ASC",
}


async def find_advocates(
    session: AsyncSession,
    search: AdvocateSearch,
) -> list[dict[str, object]]:
    """Return verified advocates inside a supplied GeoJSON district.

    The caller explicitly chooses alphabetical or geographic distance order.
    Neither ordering is a quality, popularity, or recommendation ranking.
    """

    if not 1 <= search.limit <= 100:
        raise ValueError("limit must be between 1 and 100")

    query = text(
        f"""
        WITH district AS (
            SELECT ST_SetSRID(
                ST_GeomFromGeoJSON(CAST(:district_geojson AS text)),
                4326
            ) AS boundary
        )
        SELECT
            a.id,
            a.name,
            a.district,
            a.state,
            a.practice_areas,
            a.verified,
            ST_Y(a.location::geometry) AS latitude,
            ST_X(a.location::geometry) AS longitude,
            ST_DistanceSphere(
                a.location::geometry,
                ST_SetSRID(ST_Point(:longitude, :latitude), 4326)
            ) AS distance_m
        FROM advocates AS a
        CROSS JOIN district
        WHERE a.verified = TRUE
          AND ST_Contains(district.boundary, a.location::geometry)
        ORDER BY {_ORDER_BY[search.sort_by]}
        LIMIT :limit
        """
    )
    result = await session.execute(
        query,
        {
            "district_geojson": search.district_geojson,
            "longitude": search.longitude,
            "latitude": search.latitude,
            "limit": search.limit,
        },
    )
    return [dict(row) for row in result.mappings().all()]
