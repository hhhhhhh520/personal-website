#!/usr/bin/env python3
"""
Data Extraction Script for RAG System

This script extracts content from various sources for the RAG system.
Sources include:
    - TypeScript data files (projects.ts, personal.ts, blogs.ts)
    - MDX blog content files

Usage:
    python extract_data.py [--source SOURCE_DIR] [--output OUTPUT_DIR]

Output:
    Creates JSON files with extracted content in the output directory.
"""

import argparse
import json
import re
import hashlib
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional


# Pattern for matching quoted strings (single or double quotes)
QUOTED_PATTERN = r"""['"]([^'"]+)['"]"""


@dataclass
class ExtractedContent:
    """Extracted content from a data source."""
    source: str           # 'project' | 'personal' | 'blog'
    source_id: str        # Project ID or blog slug
    title: str            # Title for display
    content: str          # Full content for indexing
    metadata: dict        # Additional metadata


def parse_projects_ts(file_path: Path) -> list[ExtractedContent]:
    """Extract project data from projects.ts."""
    content = file_path.read_text(encoding='utf-8')
    extracted = []

    # Find all project objects in the array
    # Each project starts with { id: 'xxx', and ends before the next { or ]
    project_pattern = re.compile(
        r'\{\s*'
        r'id:\s*' + QUOTED_PATTERN + r'\s*,\s*'
        r'name:\s*' + QUOTED_PATTERN + r'\s*,\s*'
        r'shortDesc:\s*' + QUOTED_PATTERN + r'\s*,.*?'
        r'fullDesc:\s*' + QUOTED_PATTERN + r'\s*,.*?'
        r'techStack:\s*\[([^\]]+)\].*?'
        r'highlights:\s*\[([^\]]+)\].*?'
        r'category:\s*' + QUOTED_PATTERN + r'\s*,.*?'
        r'status:\s*' + QUOTED_PATTERN,
        re.DOTALL
    )

    project_blocks = project_pattern.findall(content)

    for block in project_blocks:
        project_id, name, short_desc, full_desc, tech_stack, highlights, category, status = block

        # Parse tech stack array
        tech_items = re.findall(QUOTED_PATTERN, tech_stack)

        # Parse highlights array
        highlight_items = re.findall(QUOTED_PATTERN, highlights)

        # Format content for indexing
        formatted_content = f"""项目名称: {name}
简介: {short_desc}
详细描述: {full_desc}
技术栈: {', '.join(tech_items)}
特点: {', '.join(highlight_items)}
分类: {category}
状态: {status}"""

        extracted.append(ExtractedContent(
            source='project',
            source_id=project_id,
            title=name,
            content=formatted_content,
            metadata={
                'shortDesc': short_desc,
                'fullDesc': full_desc,
                'techStack': tech_items,
                'highlights': highlight_items,
                'category': category,
                'status': status
            }
        ))

    return extracted


def parse_personal_ts(file_path: Path) -> list[ExtractedContent]:
    """Extract personal information from personal.ts."""
    content = file_path.read_text(encoding='utf-8')
    extracted = []

    # Extract personal info fields
    name_match = re.search(r"name:\s*" + QUOTED_PATTERN, content)
    location_match = re.search(r"location:\s*" + QUOTED_PATTERN, content)
    summary_match = re.search(r"summary:\s*" + QUOTED_PATTERN, content)
    email_match = re.search(r"email:\s*" + QUOTED_PATTERN, content)

    # Extract focus areas
    focus_match = re.search(r"focus:\s*\[([^\]]+)\]", content)
    focus_items = []
    if focus_match:
        focus_items = re.findall(QUOTED_PATTERN, focus_match.group(1))

    # Extract education
    education_pattern = re.compile(
        r'school:\s*' + QUOTED_PATTERN + r'.*?'
        r'degree:\s*' + QUOTED_PATTERN + r'.*?'
        r'major:\s*' + QUOTED_PATTERN + r'.*?'
        r'startDate:\s*' + QUOTED_PATTERN + r'.*?'
        r'endDate:\s*' + QUOTED_PATTERN + r'.*?'
        r'highlights:\s*\[([^\]]+)\]',
        re.DOTALL
    )
    education_matches = education_pattern.findall(content)

    # Extract skills - need to handle nested arrays properly
    # Match each skill group object
    skill_group_pattern = re.compile(
        r'\{\s*'
        r'category:\s*' + QUOTED_PATTERN + r'\s*,\s*'
        r'items:\s*\[([^\]]+)\]',
        re.DOTALL
    )
    skill_matches = skill_group_pattern.findall(content)

    # Build personal content
    name = name_match.group(1) if name_match else ""
    location = location_match.group(1) if location_match else ""
    summary = summary_match.group(1) if summary_match else ""
    email = email_match.group(1) if email_match else ""

    # Format education
    education_text = []
    for edu in education_matches:
        school, degree, major, start, end, highlights_str = edu
        highlights = re.findall(QUOTED_PATTERN, highlights_str)
        education_text.append(f"{school} - {degree} - {major} ({start} - {end})")
        for h in highlights:
            education_text.append(f"  - {h}")

    # Format skills
    skills_text = []
    for category, items_str in skill_matches:
        items = re.findall(QUOTED_PATTERN, items_str)
        skills_text.append(f"{category}: {', '.join(items)}")

    formatted_content = f"""姓名: {name}
位置: {location}
邮箱: {email}
简介: {summary}

专注领域:
{chr(10).join('  - ' + f for f in focus_items)}

教育背景:
{chr(10).join('  ' + e for e in education_text)}

技能:
{chr(10).join('  ' + s for s in skills_text)}"""

    extracted.append(ExtractedContent(
        source='personal',
        source_id='main',
        title=f"{name} - 个人简介",
        content=formatted_content,
        metadata={
            'name': name,
            'location': location,
            'email': email,
            'summary': summary,
            'focus': focus_items,
            'education': [edu[0:5] for edu in education_matches] if education_matches else [],
            'skills': {cat: re.findall(QUOTED_PATTERN, items) for cat, items in skill_matches}
        }
    ))

    return extracted


def parse_blogs_ts(file_path: Path) -> list[ExtractedContent]:
    """Extract blog metadata from blogs.ts."""
    content = file_path.read_text(encoding='utf-8')
    extracted = []

    # Extract blog objects
    blog_pattern = re.compile(
        r'id:\s*' + QUOTED_PATTERN + r'.*?'
        r'slug:\s*' + QUOTED_PATTERN + r'.*?'
        r'title:\s*' + QUOTED_PATTERN + r'.*?'
        r'excerpt:\s*' + QUOTED_PATTERN + r'.*?'
        r'tags:\s*\[([^\]]+)\].*?'
        r'category:\s*' + QUOTED_PATTERN + r'.*?'
        r'createdAt:\s*' + QUOTED_PATTERN + r'.*?'
        r'readTime:\s*(\d+)',
        re.DOTALL
    )

    blog_matches = blog_pattern.findall(content)

    for blog in blog_matches:
        blog_id, slug, title, excerpt, tags_str, category, created_at, read_time = blog

        tags = re.findall(QUOTED_PATTERN, tags_str)

        formatted_content = f"""标题: {title}
摘要: {excerpt}
标签: {', '.join(tags)}
分类: {category}
发布时间: {created_at}
阅读时间: {read_time} 分钟"""

        extracted.append(ExtractedContent(
            source='blog',
            source_id=slug,
            title=title,
            content=formatted_content,
            metadata={
                'id': blog_id,
                'excerpt': excerpt,
                'tags': tags,
                'category': category,
                'createdAt': created_at,
                'readTime': int(read_time)
            }
        ))

    return extracted


def parse_mdx_file(file_path: Path) -> ExtractedContent:
    """Extract content from an MDX file."""
    content = file_path.read_text(encoding='utf-8')

    # Remove frontmatter (between --- markers)
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            content = parts[2]

    # Remove JSX components (lines starting with < and ending with >)
    # Keep the content between tags
    content = re.sub(r'<[^>]+>', '', content)

    # Remove import statements
    content = re.sub(r'^import\s+.*$', '', content, flags=re.MULTILINE)

    # Remove export statements
    content = re.sub(r'^export\s+.*$', '', content, flags=re.MULTILINE)

    # Clean up extra whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    content = content.strip()

    # Extract slug from filename
    slug = file_path.stem

    # Extract title from first heading
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else slug

    return ExtractedContent(
        source='blog',
        source_id=slug,
        title=title,
        content=content,
        metadata={
            'file': str(file_path.relative_to(file_path.parent.parent.parent)),
            'type': 'mdx'
        }
    )


def generate_content_hash(content: ExtractedContent) -> str:
    """Generate a unique hash for the content."""
    hash_input = f"{content.source}:{content.source_id}:{content.content}"
    return hashlib.md5(hash_input.encode('utf-8')).hexdigest()[:12]


def parse_project_doc(file_path: Path) -> list[ExtractedContent]:
    """Parse a project documentation Markdown file into structured content.

    Splits the document into logical sections for better RAG retrieval.
    Each section becomes a separate ExtractedContent item.
    """
    content = file_path.read_text(encoding='utf-8')

    # Extract project ID from filename (e.g., mini-claude.md -> mini-claude)
    project_id = file_path.stem

    if project_id in ['TEMPLATE', 'README']:
        return []

    # Extract title from first heading
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else project_id

    # Remove comment blocks (<!-- -->)
    content_clean = re.sub(r'<!--[\s\S]*?-->', '', content)

    # Split into sections by ## headings
    section_pattern = re.compile(r'^##\s+(.+)$', re.MULTILINE)
    sections = section_pattern.split(content_clean)

    extracted = []

    # First section is the content before first ##
    if sections and sections[0].strip():
        intro = sections[0].strip()
        # Skip template instructions
        if not intro.startswith('本模板用于'):
            extracted.append(ExtractedContent(
                source='project_doc',
                source_id=f"{project_id}_overview",
                title=f"{title} - 概述",
                content=intro,
                metadata={
                    'project_id': project_id,
                    'section': 'overview',
                    'file': str(file_path.relative_to(file_path.parent.parent.parent))
                }
            ))

    # Process remaining sections
    for i in range(1, len(sections), 2):
        if i + 1 >= len(sections):
            break

        section_title = sections[i].strip()
        section_content = sections[i + 1].strip()

        # Skip empty sections
        if not section_content or len(section_content) < 50:
            continue

        # Clean up section content
        # Remove code block markers but keep content
        section_content = re.sub(r'```mermaid[\s\S]*?```', '[架构图]', section_content)
        section_content = re.sub(r'```\\w*\n', '```\n', section_content)

        # Create section ID
        section_id = re.sub(r'[^\w一-鿿]+', '_', section_title).strip('_').lower()

        extracted.append(ExtractedContent(
            source='project_doc',
            source_id=f"{project_id}_{section_id}",
            title=f"{title} - {section_title}",
            content=section_content,
            metadata={
                'project_id': project_id,
                'section': section_title,
                'file': str(file_path.relative_to(file_path.parent.parent.parent))
            }
        ))

    return extracted


def extract_all_data(source_dir: Path) -> list[ExtractedContent]:
    """Extract all data from the source directory."""
    all_content = []

    # Extract from TypeScript data files
    data_dir = source_dir / 'data'

    if (data_dir / 'projects.ts').exists():
        projects = parse_projects_ts(data_dir / 'projects.ts')
        all_content.extend(projects)
        print(f"Extracted {len(projects)} projects")

    if (data_dir / 'personal.ts').exists():
        personal = parse_personal_ts(data_dir / 'personal.ts')
        all_content.extend(personal)
        print(f"Extracted {len(personal)} personal info entries")

    # Skip blogs.ts extraction - MDX files contain the full content
    # blogs.ts only contains metadata which is already in MDX frontmatter
    # if (data_dir / 'blogs.ts').exists():
    #     blogs = parse_blogs_ts(data_dir / 'blogs.ts')
    #     all_content.extend(blogs)
    #     print(f"Extracted {len(blogs)} blog metadata entries")

    # Extract from MDX blog files (primary source for blog content)
    content_dir = source_dir / 'content' / 'blog'
    if content_dir.exists():
        mdx_files = list(content_dir.glob('*.mdx'))
        for mdx_file in mdx_files:
            try:
                mdx_content = parse_mdx_file(mdx_file)
                all_content.append(mdx_content)
            except Exception as e:
                print(f"Warning: Failed to parse {mdx_file}: {e}")
        print(f"Extracted {len(mdx_files)} MDX blog files")

    # Extract from project documentation Markdown files
    docs_dir = source_dir / 'docs' / 'projects'
    if docs_dir.exists():
        md_files = list(docs_dir.glob('*.md'))
        doc_count = 0
        for md_file in md_files:
            try:
                doc_sections = parse_project_doc(md_file)
                all_content.extend(doc_sections)
                doc_count += len(doc_sections)
            except Exception as e:
                print(f"Warning: Failed to parse {md_file}: {e}")
        print(f"Extracted {doc_count} project doc sections from {len(md_files)} files")

    return all_content


def save_to_json(content: list[ExtractedContent], output_dir: Path) -> None:
    """Save extracted content to JSON files."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save all content to a single file
    output_file = output_dir / 'extracted_content.json'

    # Convert to dict format
    data = []
    for item in content:
        item_dict = asdict(item)
        item_dict['id'] = generate_content_hash(item)
        data.append(item_dict)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(data)} items to {output_file}")

    # Also save a summary by source
    summary = {}
    for item in content:
        source = item.source
        if source not in summary:
            summary[source] = {'count': 0, 'items': []}
        summary[source]['count'] += 1
        summary[source]['items'].append({
            'id': item.source_id,
            'title': item.title
        })

    summary_file = output_dir / 'extraction_summary.json'
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"Saved summary to {summary_file}")


def main():
    parser = argparse.ArgumentParser(description='Extract data for RAG system')
    parser.add_argument(
        '--source',
        type=str,
        default=None,
        help='Source directory (default: project root)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Output directory (default: rag/data)'
    )

    args = parser.parse_args()

    # Determine paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent

    source_dir = Path(args.source) if args.source else project_root
    output_dir = Path(args.output) if args.output else script_dir.parent / 'data'

    print(f"Source directory: {source_dir}")
    print(f"Output directory: {output_dir}")

    # Extract all data
    content = extract_all_data(source_dir)

    # Save to JSON
    save_to_json(content, output_dir)

    print("\nExtraction complete!")
    print(f"Total items extracted: {len(content)}")


if __name__ == '__main__':
    main()