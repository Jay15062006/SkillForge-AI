from typing import Optional
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.services.ai_generator import generate_skill_content
from app.services.validator import validate_skill_markdown, ValidationResult
from app.services.exporter import create_skill_zip, sanitize_folder_name

router = APIRouter(prefix="/skills", tags=["Skills"])


class GenerateSkillRequest(BaseModel):
    prompt: str = Field(..., min_length=5, description="Description of the AI agent skill")
    skill_name: Optional[str] = Field(None, description="Optional preferred skill name")
    category: Optional[str] = Field(None, description="Optional skill category or domain")


class GenerateSkillResponse(BaseModel):
    markdown: str
    validation: ValidationResult


class ValidateSkillRequest(BaseModel):
    content: str = Field(..., description="Full SKILL.md markdown content to validate")


class ExportZipRequest(BaseModel):
    name: Optional[str] = Field("custom-skill", description="Skill name")
    content: str = Field(..., description="Full SKILL.md content")


class DownloadMdRequest(BaseModel):
    name: Optional[str] = Field("custom-skill", description="Skill name")
    content: str = Field(..., description="Full SKILL.md content")


@router.post("/generate", response_model=GenerateSkillResponse)
async def generate_skill(request: GenerateSkillRequest):
    """
    Generate an AI agent SKILL.md using the hosted open-weight inference model,
    then automatically validate the output structure and YAML frontmatter.
    """
    markdown = await generate_skill_content(
        user_prompt=request.prompt,
        skill_name=request.skill_name,
        category=request.category,
    )
    validation = validate_skill_markdown(markdown)
    return GenerateSkillResponse(markdown=markdown, validation=validation)


@router.post("/validate", response_model=ValidationResult)
async def validate_skill(request: ValidateSkillRequest):
    """
    Validate an existing or edited SKILL.md file for proper YAML frontmatter,
    required fields (name, description), and markdown structure.
    """
    return validate_skill_markdown(request.content)


@router.post("/export-zip")
async def export_skill_zip(request: ExportZipRequest):
    """
    Packages the SKILL.md into a complete agent skill ZIP bundle,
    including scaffolding directories for scripts, examples, and references.
    """
    if not request.content or not request.content.strip():
        raise HTTPException(status_code=400, detail="Skill content cannot be empty for ZIP export.")

    safe_name = sanitize_folder_name(request.name)
    zip_stream = create_skill_zip(skill_name=safe_name, markdown_content=request.content)

    return StreamingResponse(
        zip_stream,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}.zip"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


@router.post("/download-md")
async def download_skill_md(request: DownloadMdRequest):
    """
    Directly returns the SKILL.md file with standard download attachment headers.
    """
    if not request.content or not request.content.strip():
        raise HTTPException(status_code=400, detail="Skill content cannot be empty.")

    return Response(
        content=request.content,
        media_type="text/markdown; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="SKILL.md"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )
