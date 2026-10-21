from main import cnr_pattern
from services.postgis_search import _ORDER_BY
from services.rag_engine import PERSONA_PROMPTS, build_prompt


def test_cnr_requires_exactly_16_alphanumeric_characters():
    assert cnr_pattern.fullmatch("DLHC010000012026")
    assert not cnr_pattern.fullmatch("too-short")
    assert not cnr_pattern.fullmatch("DLHC01000001202!")


def test_spatial_order_is_neutral_and_explicit():
    assert _ORDER_BY["alphabetical"] == "name ASC, id ASC"
    assert _ORDER_BY["distance"] == "distance_m ASC, name ASC, id ASC"


def test_persona_prompts_include_required_boundaries():
    assert "plain language" in PERSONA_PROMPTS["citizen"]
    assert "ratio decidendi" in PERSONA_PROMPTS["student"]
    assert "Supreme Court" in PERSONA_PROMPTS["student"]
    assert "legal notice drafting templates" in PERSONA_PROMPTS["advocate"]
    prompt = build_prompt("citizen", "What is bail?", [])
    assert "not legal advice" in prompt
