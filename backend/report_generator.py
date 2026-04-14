"""Build final report and export to PDF using ReportLab."""

from __future__ import annotations

import re
from datetime import datetime
from io import BytesIO

import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

# Register a Unicode font that supports Greek
def _register_unicode_font():
    # Try to find a system font that supports Greek
    font_paths = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                pdfmetrics.registerFont(TTFont("UnicodeFont", path))
                return "UnicodeFont"
            except Exception:
                continue
    return None

UNICODE_FONT = _register_unicode_font()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean_markdown(text: str) -> str:
    """Strip Markdown syntax for plain-text PDF rendering."""
    # Remove bold/italic markers
    text = re.sub(r"\*{1,3}(.*?)\*{1,3}", r"\1", text)
    text = re.sub(r"_{1,3}(.*?)_{1,3}", r"\1", text)
    # Remove inline code
    text = re.sub(r"`([^`]+)`", r"\1", text)
    # Remove code blocks
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    return text.strip()


def _make_styles() -> dict:
    base = getSampleStyleSheet()
    _font = UNICODE_FONT or "Helvetica"
    _font_bold = UNICODE_FONT or "Helvetica-Bold"
    _font_bold_oblique = UNICODE_FONT or "Helvetica-BoldOblique"

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=base["Title"],
        fontSize=24,
        textColor=colors.HexColor("#1e3a5f"),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName=_font_bold,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=base["Normal"],
        fontSize=13,
        textColor=colors.HexColor("#4a6fa5"),
        spaceAfter=4,
        alignment=TA_CENTER,
        fontName=_font,
    )
    date_style = ParagraphStyle(
        "DateStyle",
        parent=base["Normal"],
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=20,
        alignment=TA_CENTER,
    )
    h1_style = ParagraphStyle(
        "H1",
        parent=base["Heading1"],
        fontSize=16,
        textColor=colors.HexColor("#1e3a5f"),
        spaceBefore=18,
        spaceAfter=8,
        fontName=_font_bold,
    )
    h2_style = ParagraphStyle(
        "H2",
        parent=base["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#2c5282"),
        spaceBefore=12,
        spaceAfter=6,
        fontName=_font_bold,
    )
    h3_style = ParagraphStyle(
        "H3",
        parent=base["Heading3"],
        fontSize=11,
        textColor=colors.HexColor("#2b6cb0"),
        spaceBefore=8,
        spaceAfter=4,
        fontName=_font_bold_oblique,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=base["Normal"],
        fontSize=10,
        leading=15,
        spaceAfter=8,
        alignment=TA_JUSTIFY,
        fontName=_font,
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        parent=base["Normal"],
        fontSize=10,
        leading=14,
        spaceAfter=4,
        leftIndent=20,
        bulletIndent=10,
        fontName=_font,
    )
    ref_style = ParagraphStyle(
        "Reference",
        parent=base["Normal"],
        fontSize=9,
        leading=13,
        spaceAfter=4,
        leftIndent=20,
        firstLineIndent=-20,
        fontName=_font,
        textColor=colors.HexColor("#2b6cb0"),
    )

    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "date": date_style,
        "h1": h1_style,
        "h2": h2_style,
        "h3": h3_style,
        "body": body_style,
        "bullet": bullet_style,
        "ref": ref_style,
    }


def _add_page_number(canvas, doc):
    """Footer callback: page number centred at bottom."""
    canvas.saveState()
    canvas.setFont(UNICODE_FONT or "Helvetica", 8)
    canvas.setFillColor(colors.grey)
    page_num_text = f"Page {doc.page}"
    canvas.drawCentredString(A4[0] / 2.0, 1.5 * cm, page_num_text)
    canvas.drawString(2 * cm, 1.5 * cm, "ScholarMind — AI-Powered Academic Research")
    canvas.restoreState()


# ---------------------------------------------------------------------------
# ReportGenerator
# ---------------------------------------------------------------------------

class ReportGenerator:
    def generate_pdf(
        self,
        report_text: str,
        topic: str,
        sources: list[dict],
        citation_format: str = "APA",
    ) -> bytes:
        """Create a professional PDF from report_text and return as bytes."""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2.5 * cm,
            leftMargin=2.5 * cm,
            topMargin=2.5 * cm,
            bottomMargin=2.5 * cm,
        )
        styles = _make_styles()
        story = []

        # ── Title page ─────────────────────────────────────────────────
        story.append(Spacer(1, 2 * cm))
        story.append(Paragraph("ScholarMind Research Report", styles["title"]))
        story.append(Spacer(1, 0.4 * cm))
        story.append(Paragraph(_clean_markdown(topic), styles["subtitle"]))
        story.append(Spacer(1, 0.2 * cm))
        story.append(
            Paragraph(
                f"Generated on {datetime.utcnow().strftime('%B %d, %Y')}",
                styles["date"],
            )
        )
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1e3a5f")))
        story.append(PageBreak())

        # ── Body: parse Markdown-ish sections ──────────────────────────
        story.extend(self._parse_report_body(report_text, styles))

        # ── References section (from sources list) ─────────────────────
        if sources:
            story.append(Spacer(1, 0.5 * cm))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
            story.append(Paragraph("Additional Source Index", styles["h1"]))
            for idx, src in enumerate(sources, 1):
                title = _clean_markdown(src.get("title", "Untitled"))
                url = src.get("url", "")
                snippet = _clean_markdown(src.get("snippet", ""))
                if citation_format == "IEEE":
                    ref_text = f'[{idx}] "{title}."'
                    if snippet:
                        ref_text += f" {snippet}"
                    if url:
                        ref_text += f" [Online]. Available: {url}"
                else:
                    # APA default
                    ref_text = f"{title}."
                    if snippet:
                        ref_text += f" {snippet}."
                    if url:
                        ref_text += f" Retrieved from {url}"
                story.append(Paragraph(ref_text, styles["ref"]))

        doc.build(story, onFirstPage=_add_page_number, onLaterPages=_add_page_number)
        return buffer.getvalue()

    # ------------------------------------------------------------------

    def _parse_report_body(self, report_text: str, styles: dict) -> list:
        """Convert Markdown-formatted report text to ReportLab flowables."""
        flowables = []
        lines = report_text.split("\n")
        i = 0

        while i < len(lines):
            line = lines[i]

            if line.startswith("## "):
                text = _clean_markdown(line[3:].strip())
                flowables.append(Paragraph(text, styles["h1"]))

            elif line.startswith("### "):
                text = _clean_markdown(line[4:].strip())
                flowables.append(Paragraph(text, styles["h2"]))

            elif line.startswith("#### "):
                text = _clean_markdown(line[5:].strip())
                flowables.append(Paragraph(text, styles["h3"]))

            elif line.startswith("- ") or line.startswith("* "):
                text = _clean_markdown(line[2:].strip())
                flowables.append(Paragraph(f"• {text}", styles["bullet"]))

            elif re.match(r"^\d+\.\s", line):
                text = _clean_markdown(re.sub(r"^\d+\.\s", "", line).strip())
                flowables.append(Paragraph(f"• {text}", styles["bullet"]))

            elif line.strip() == "" or line.strip() == "---":
                flowables.append(Spacer(1, 0.3 * cm))

            else:
                text = _clean_markdown(line.strip())
                if text:
                    flowables.append(Paragraph(text, styles["body"]))

            i += 1

        return flowables

    def format_for_display(self, report_text: str) -> str:
        """Return report text as-is — Claude already outputs Markdown."""
        return report_text
