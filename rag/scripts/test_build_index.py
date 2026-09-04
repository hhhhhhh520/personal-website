#!/usr/bin/env python3
"""
Tests for build_index.py incremental-update logic (the REAL production code).

Replaces the former self-contained TS stub (ISSUE-001) that duplicated
"incremental update" logic which never existed in TypeScript — the actual
hash/change-detection lives here in build_index.py.

Tests cover:
- compute_data_hash determinism and sensitivity to content change
- check_index_needs_update transitions (no metadata / matching / changed hash)
"""

import json
import sys
from pathlib import Path

import pytest

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from build_index import (
    compute_data_hash,
    get_data_source_files,
    check_index_needs_update,
)


@pytest.fixture
def project_root(tmp_path):
    """Create a minimal project root with data sources."""
    data_dir = tmp_path / 'data'
    data_dir.mkdir()
    (data_dir / 'projects.ts').write_text(
        "export const projects = [{ id: 'demo', name: 'Demo' }];",
        encoding='utf-8',
    )
    return tmp_path


class TestComputeDataHash:
    def test_deterministic(self, project_root):
        files = get_data_source_files(project_root)
        assert len(files) > 0
        h1 = compute_data_hash(files)
        h2 = compute_data_hash(files)
        assert h1 == h2
        assert len(h1) == 32  # MD5 hex length

    def test_changes_when_content_changes(self, project_root):
        files = get_data_source_files(project_root)
        h1 = compute_data_hash(files)

        (project_root / 'data' / 'projects.ts').write_text(
            "export const projects = [{ id: 'demo', name: 'Changed' }];",
            encoding='utf-8',
        )
        files_after = get_data_source_files(project_root)
        h2 = compute_data_hash(files_after)
        assert h1 != h2

    def test_detects_new_file(self, project_root):
        before = compute_data_hash(get_data_source_files(project_root))
        (project_root / 'data' / 'personal.ts').write_text(
            "export const personal = { name: 'X' };", encoding='utf-8'
        )
        after = compute_data_hash(get_data_source_files(project_root))
        assert before != after


class TestCheckNeedsUpdate:
    def test_no_existing_index_needs_update(self, project_root, tmp_path):
        out = tmp_path / 'out'
        out.mkdir()
        result = check_index_needs_update(project_root, out)
        assert result['needs_update'] is True
        assert result['reason'] == 'No existing index found'

    def test_matching_hash_is_up_to_date(self, project_root, tmp_path):
        out = tmp_path / 'out'
        out.mkdir()
        current_hash = compute_data_hash(get_data_source_files(project_root))
        (out / 'metadata.json').write_text(
            json.dumps({'data_hash': current_hash}), encoding='utf-8'
        )
        result = check_index_needs_update(project_root, out)
        assert result['needs_update'] is False
        assert result['stored_hash'] == current_hash

    def test_changed_hash_needs_update(self, project_root, tmp_path):
        out = tmp_path / 'out'
        out.mkdir()
        (out / 'metadata.json').write_text(
            json.dumps({'data_hash': 'stale_hash_value'}), encoding='utf-8'
        )
        result = check_index_needs_update(project_root, out)
        assert result['needs_update'] is True
        assert result['reason'] == 'Data files have changed'

    def test_metadata_without_hash_field_needs_update(self, project_root, tmp_path):
        out = tmp_path / 'out'
        out.mkdir()
        (out / 'metadata.json').write_text(
            json.dumps({'version': '1.0.0'}), encoding='utf-8'
        )
        result = check_index_needs_update(project_root, out)
        assert result['needs_update'] is True
        assert result['stored_hash'] is None

    def test_corrupt_metadata_needs_update(self, project_root, tmp_path):
        out = tmp_path / 'out'
        out.mkdir()
        (out / 'metadata.json').write_text('not-valid-json{{', encoding='utf-8')
        result = check_index_needs_update(project_root, out)
        assert result['needs_update'] is True
