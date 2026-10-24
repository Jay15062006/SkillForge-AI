import re
from typing import Dict, Any, List, Optional
import yaml
from pydantic import BaseModel, Field


class ValidationCheck(BaseModel):
    name: str
    passed: bool
    message: str


class ValidationResult(BaseModel):
    valid: bool
    frontmatter: Optional[Dict[str, Any]] = None
    body: str = ""
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    checks: List[ValidationCheck] = Field(default_factory=list)
    stats: Dict[str, Any] = Field(default_factory=dict)


def validate_skill_markdown(content: str) -> ValidationResult:
    """
    Validates an AI Agent SKILL.md file.
    Ensures YAML frontmatter exists, is valid YAML, contains required fields
    ('name', 'description'), and provides structured markdown instructions.
    """
    errors: List[str] = []
    warnings: List[str] = []
    checks: List[ValidationCheck] = []
    frontmatter: Optional[Dict[str, Any]] = None
    body: str = ""

    if not content or not content.strip():
        return ValidationResult(
            valid=False,
            errors=["Skill content is completely empty."],
            checks=[
                ValidationCheck(
                    name="Content Non-Empty",
                    passed=False,
                    message="Skill file must not be empty.",
                )
            ],
            stats={"total_characters": 0, "total_lines": 0},
        )

    # Calculate basic stats
    lines = content.strip().splitlines()
    stats = {
        "total_lines": len(lines),
        "total_characters": len(content),
        "word_count": len(content.split()),
    }

    # Match frontmatter pattern: starts with ---, followed by yaml, closed by ---
    # Optional leading whitespace or UTF-8 BOM
    clean_content = content.lstrip("\ufeff").strip()
    fm_pattern = re.compile(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n?(.*)$", re.DOTALL)
    match = fm_pattern.match(clean_content)

    if not match:
        errors.append("Missing YAML frontmatter block enclosed between '---' delimiters at the beginning of the file.")
        checks.append(ValidationCheck(
            name="Frontmatter Delimiters",
            passed=False,
            message="Must begin with '---' and end frontmatter with '---'."
        ))
        return ValidationResult(
            valid=False,
            errors=errors,
            warnings=warnings,
            checks=checks,
            stats=stats,
            body=clean_content
        )

    checks.append(ValidationCheck(
        name="Frontmatter Delimiters",
        passed=True,
        message="Valid YAML frontmatter delimiters '---' found."
    ))

    raw_yaml = match.group(1)
    body = match.group(2).strip()

    # Parse YAML
    try:
        parsed_yaml = yaml.safe_load(raw_yaml)
        if not isinstance(parsed_yaml, dict):
            errors.append("YAML frontmatter must evaluate to a key-value dictionary.")
            checks.append(ValidationCheck(
                name="YAML Syntax",
                passed=False,
                message="Frontmatter is not a valid YAML mapping/object."
            ))
            return ValidationResult(
                valid=False,
                frontmatter=None,
                body=body,
                errors=errors,
                warnings=warnings,
                checks=checks,
                stats=stats,
            )
        frontmatter = parsed_yaml
        checks.append(ValidationCheck(
            name="YAML Syntax",
            passed=True,
            message="Frontmatter is valid YAML syntax."
        ))
    except yaml.YAMLError as e:
        errors.append(f"Invalid YAML syntax in frontmatter: {str(e)}")
        checks.append(ValidationCheck(
            name="YAML Syntax",
            passed=False,
            message=f"YAML parsing error: {str(e)}"
        ))
        return ValidationResult(
            valid=False,
            frontmatter=None,
            body=body,
            errors=errors,
            warnings=warnings,
            checks=checks,
            stats=stats,
        )

    # Required field: 'name'
    skill_name = frontmatter.get("name")
    if not skill_name or not str(skill_name).strip():
        errors.append("Required field 'name' is missing or empty in frontmatter.")
        checks.append(ValidationCheck(
            name="Required Field: name",
            passed=False,
            message="'name' field is required."
        ))
    else:
        skill_name_str = str(skill_name).strip()
        # Recommend lowercase kebab-case or alphanumeric with hyphens/underscores
        if re.match(r"^[a-z0-9-_]+$", skill_name_str):
            checks.append(ValidationCheck(
                name="Required Field: name",
                passed=True,
                message=f"Valid skill name: '{skill_name_str}'"
            ))
        else:
            warnings.append(f"Skill name '{skill_name_str}' is recommended to use lowercase alphanumeric characters and hyphens (e.g. 'my-agent-skill').")
            checks.append(ValidationCheck(
                name="Required Field: name",
                passed=True,
                message=f"Present but non-standard naming format: '{skill_name_str}'"
            ))

    # Required field: 'description'
    description = frontmatter.get("description")
    if not description or not str(description).strip():
        errors.append("Required field 'description' is missing or empty in frontmatter.")
        checks.append(ValidationCheck(
            name="Required Field: description",
            passed=False,
            message="'description' field is required for AI agents to understand skill purpose."
        ))
    else:
        desc_str = str(description).strip()
        if len(desc_str) < 15:
            warnings.append("Description is very short. Provide a comprehensive summary of when and how the agent should use this skill.")
        checks.append(ValidationCheck(
            name="Required Field: description",
            passed=True,
            message=f"Valid description ({len(desc_str)} characters)."
        ))

    # Body validation
    if not body:
        errors.append("Skill markdown body is empty. Instructions and workflows must be provided below frontmatter.")
        checks.append(ValidationCheck(
            name="Markdown Instructions Body",
            passed=False,
            message="Body is empty."
        ))
    else:
        has_headings = bool(re.search(r"^#{1,4}\s+", body, re.MULTILINE))
        if not has_headings:
            warnings.append("Skill body contains no Markdown headings (# or ##). Organizing into clear sections is recommended.")
            checks.append(ValidationCheck(
                name="Markdown Structure",
                passed=True,
                message="Body present without structured headings."
            ))
        else:
            checks.append(ValidationCheck(
                name="Markdown Structure",
                passed=True,
                message="Structured headings detected in body."
            ))

    stats["has_frontmatter"] = True
    stats["frontmatter_fields"] = list(frontmatter.keys()) if frontmatter else []

    is_valid = len(errors) == 0

    return ValidationResult(
        valid=is_valid,
        frontmatter=frontmatter,
        body=body,
        errors=errors,
        warnings=warnings,
        checks=checks,
        stats=stats,
    )
