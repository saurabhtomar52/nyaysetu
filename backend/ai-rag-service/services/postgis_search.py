"""Parameterized spatial query boundary for the PostGIS repository."""

ADVOCATES_WITHIN_DISTRICT = """
SELECT id, name, district, state, practice_areas, verified, latitude, longitude
FROM advocates
WHERE ST_Contains(boundary, ST_SetSRID(ST_Point(:longitude, :latitude), 4326))
  AND verified = TRUE
ORDER BY ST_DistanceSphere(location, ST_SetSRID(ST_Point(:longitude, :latitude), 4326))
LIMIT :limit
"""

