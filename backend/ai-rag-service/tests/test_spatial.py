from main import cnr_pattern


def test_cnr_requires_exactly_16_alphanumeric_characters():
    assert cnr_pattern.fullmatch("DLHC010000012026")
    assert not cnr_pattern.fullmatch("too-short")
    assert not cnr_pattern.fullmatch("DLHC01000001202!")

