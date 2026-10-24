from app.services.validator import validate_skill_markdown


VALID_SKILL = """---
name: github-pr-reviewer
description: Automatically reviews pull requests for style, security vulnerabilities, and test coverage.
version: 1.0.0
tags:
  - git
  - code-review
  - security
---

# GitHub PR Reviewer Skill

## Overview
This skill guides autonomous agents in performing thorough PR reviews.

## Instructions
1. Inspect the git diff using git CLI.
2. Highlight any potential breaking changes.
3. Summarize the pull request changes clearly.
"""

INVALID_YAML_SKILL = """---
name: [broken-yaml
description: missing bracket
---
# Content
"""

MISSING_NAME_SKILL = """---
description: This skill has no name.
version: 1.0.0
---
# Content
"""

MISSING_FRONTMATTER_SKILL = """# Just Markdown
No frontmatter delimiters here.
"""


def test_validator_valid_skill():
    result = validate_skill_markdown(VALID_SKILL)
    assert result.valid is True
    assert len(result.errors) == 0
    assert result.frontmatter is not None
    assert result.frontmatter["name"] == "github-pr-reviewer"
    assert "reviews pull requests" in result.frontmatter["description"]
    assert result.stats["total_lines"] > 0
    assert result.stats["has_frontmatter"] is True


def test_validator_empty_content():
    result = validate_skill_markdown("")
    assert result.valid is False
    assert any("empty" in err.lower() for err in result.errors)


def test_validator_missing_frontmatter():
    result = validate_skill_markdown(MISSING_FRONTMATTER_SKILL)
    assert result.valid is False
    assert any("delimiters" in err.lower() for err in result.errors)


def test_validator_invalid_yaml():
    result = validate_skill_markdown(INVALID_YAML_SKILL)
    assert result.valid is False
    assert any("yaml" in err.lower() for err in result.errors)


def test_validator_missing_name():
    result = validate_skill_markdown(MISSING_NAME_SKILL)
    assert result.valid is False
    assert any("name" in err.lower() for err in result.errors)
