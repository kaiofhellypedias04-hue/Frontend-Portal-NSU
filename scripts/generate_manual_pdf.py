from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "pages" / "Configuracoes.tsx"
OUTPUT = ROOT / "public" / "manual" / "manual-completo-portal-nfse.pdf"
SCREENSHOTS = ROOT / "public" / "manual" / "screens"

IMAGE_GROUPS = [
    ["painel-visao-geral.png", "painel-filtros-notas.png"],
    ["tomados-visao-geral.png", "tomados-filtros-tabela.png"],
    ["prestados-visao-geral.png", "prestados-tabela.png"],
    ["todas-notas-filtros.png"],
    ["motor-adn.png"],
    ["fila-consultas.png"],
    ["historico-resumo.png", "historico-processos.png"],
    ["certificados.png"],
    ["painel-visao-geral.png"],
]


def field(line: str, name: str) -> str:
    match = re.search(rf"{name}: '([^']*)'", line)
    return match.group(1) if match else ""


def read_items() -> list[dict[str, object]]:
    source = SOURCE.read_text(encoding="utf-8")
    block = source.split("const manualItems", 1)[1].split("const manualImagesByIndex", 1)[0]
    items = []
    for line in block.splitlines():
        if not line.lstrip().startswith("{ title:"):
            continue
        steps = [
            {"title": title, "detail": detail}
            for title, detail in re.findall(r"\{ title: '([^']*)', detail: '([^']*)' \}", line)
        ]
        path_match = re.search(r"path: \[([^]]*)\]", line)
        path = re.findall(r"'([^']*)'", path_match.group(1)) if path_match else []
        items.append({
            "title": field(line, "title"),
            "summary": field(line, "summary"),
            "description": field(line, "description"),
            "path": path,
            "steps": steps,
        })
    return items


def safe(value: object) -> str:
    return html.escape(str(value))


def build_pdf() -> None:
    items = read_items()
    if not items:
        raise RuntimeError("Nenhum tópico foi encontrado no manual.")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontSize=25, leading=31, textColor=colors.HexColor("#0F766E"), alignment=TA_CENTER, spaceAfter=14))
    styles.add(ParagraphStyle(name="Topic", parent=styles["Heading1"], fontSize=18, leading=23, textColor=colors.HexColor("#0F766E"), spaceAfter=8))
    styles.add(ParagraphStyle(name="Summary", parent=styles["Heading2"], fontSize=11, leading=16, textColor=colors.HexColor("#334155"), spaceAfter=10))
    styles.add(ParagraphStyle(name="BodyManual", parent=styles["BodyText"], fontSize=10, leading=15, textColor=colors.HexColor("#1E293B"), spaceAfter=8))
    styles.add(ParagraphStyle(name="Step", parent=styles["BodyText"], fontSize=9.5, leading=14, leftIndent=10, textColor=colors.HexColor("#334155"), spaceAfter=6))
    styles.add(ParagraphStyle(name="Caption", parent=styles["BodyText"], fontSize=8, leading=11, alignment=TA_CENTER, textColor=colors.HexColor("#64748B"), spaceAfter=9))

    story = [
        Spacer(1, 4.2 * cm),
        Paragraph("Manual completo do Portal NFS-e", styles["CoverTitle"]),
        Paragraph("Guia de utilização do sistema", styles["Summary"]),
        Spacer(1, 1 * cm),
        Paragraph("Este documento reúne todas as orientações disponíveis na área Manual do portal.", styles["BodyManual"]),
        PageBreak(),
    ]

    for index, item in enumerate(items):
        story.append(Paragraph(safe(item["title"]), styles["Topic"]))
        story.append(Paragraph(safe(item["summary"]), styles["Summary"]))
        story.append(Paragraph(safe(item["description"]), styles["BodyManual"]))
        path = " → ".join(item["path"])
        story.append(Paragraph(f"<b>Caminho na tela:</b> {safe(path)}", styles["BodyManual"]))
        story.append(Paragraph("<b>Passo a passo</b>", styles["Summary"]))
        for step_index, step in enumerate(item["steps"], 1):
            story.append(Paragraph(f"<b>{step_index}. {safe(step['title'])}</b><br/>{safe(step['detail'])}", styles["Step"]))

        for image_name in IMAGE_GROUPS[index] if index < len(IMAGE_GROUPS) else []:
            image_path = SCREENSHOTS / image_name
            if not image_path.exists():
                continue
            image = Image(str(image_path))
            max_width, max_height = 17.2 * cm, 10.5 * cm
            scale = min(max_width / image.imageWidth, max_height / image.imageHeight, 1)
            image.drawWidth = image.imageWidth * scale
            image.drawHeight = image.imageHeight * scale
            story.extend([Spacer(1, 0.2 * cm), image, Paragraph(image_name.replace("-", " ").removesuffix(".png").capitalize(), styles["Caption"])])
        if index < len(items) - 1:
            story.append(PageBreak())

    document = SimpleDocTemplate(str(OUTPUT), pagesize=A4, rightMargin=1.7 * cm, leftMargin=1.7 * cm, topMargin=1.5 * cm, bottomMargin=1.5 * cm, title="Manual completo do Portal NFS-e", author="Portal NFS-e")
    document.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
