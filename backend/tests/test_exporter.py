import zipfile
from app.services.exporter import create_skill_zip, sanitize_folder_name


def test_sanitize_folder_name():
    assert sanitize_folder_name("My Awesome Skill!") == "my-awesome-skill"
    assert sanitize_folder_name("___test___") == "test"
    assert sanitize_folder_name("") == "custom-skill"
    assert sanitize_folder_name(None) == "custom-skill"


def test_create_skill_zip():
    skill_content = "---\nname: test-skill\ndescription: Test description.\n---\n# Test"
    zip_buf = create_skill_zip("test-skill", skill_content)

    assert zip_buf is not None
    # Verify contents with zipfile
    with zipfile.ZipFile(zip_buf, "r") as zf:
        file_list = zf.namelist()
        assert "test-skill/SKILL.md" in file_list
        assert "test-skill/README.md" in file_list
        assert "test-skill/scripts/README.md" in file_list
        assert "test-skill/examples/README.md" in file_list
        assert "test-skill/references/README.md" in file_list

        extracted_skill = zf.read("test-skill/SKILL.md").decode("utf-8")
        assert extracted_skill == skill_content
