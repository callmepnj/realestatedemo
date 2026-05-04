from __future__ import annotations

import json
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DOC = ROOT / "acreages_complete_website_data_document_clean.docx"
OUTPUT_JSON = ROOT / "chatbot" / "knowledge-base.json"

DOC_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

PROJECTS = [
    {
        "id": "rivlyn-estate",
        "name": "Rivlyn Estate",
        "aliases": ["rivlyn", "rivlyn estate"],
        "status": "Ongoing",
        "location": "Shahapur-Murbad growth belt",
        "category": "Riverfront Farmhouse",
        "bestFor": "Riverfront privacy, premium farmhouse living, and long-term legacy ownership.",
        "headline": "A premium river-edge project shaped around privacy, nature, and legacy value.",
        "description": "Rivlyn Estate is positioned around Kalu River frontage with gated-community planning, clear-title positioning, and farmstay or private villa potential.",
        "plotOptions": "10, 20, and 40 guntha+ references are mentioned publicly.",
        "highlights": [
            "16-acre scale with river-edge ownership story",
            "Clear-title positioning with 25-ft internal road references",
            "10+ amenities and OTA support messaging",
            "Private villa and farmstay potential"
        ],
        "image": "/photos/river-touch-land-for-sale.jpg",
        "sourceUrl": "https://acreages.co.in/rivlynestate/"
    },
    {
        "id": "serenity-park",
        "name": "Serenity Park",
        "aliases": ["serenity", "serenity park"],
        "status": "Phase II Booking Open",
        "location": "Murbad / Kalyan / Malshej Ghat belt",
        "category": "Farmstead Project",
        "bestFor": "Mountain-view farmstead living, peaceful weekends, and nature-led family time.",
        "headline": "A premium farmstead story with hills, streams, and a calmer second-home lifestyle.",
        "description": "Serenity Park is presented around Malshej Ghat views, forest hills, streams, gated-community planning, and EOI-led Phase II interest.",
        "plotOptions": "10, 20, and 40 guntha+ positioning is used publicly.",
        "highlights": [
            "Phase I sold out and Phase II booking open through EOI",
            "25-ft gravel road and 10+ amenities references",
            "Strong mountain, stream, and forest setting",
            "Suitable for buyers seeking a peaceful nature-first retreat"
        ],
        "image": "/photos/serinity.jpg",
        "sourceUrl": "https://acreages.co.in/premium-farmhouse-serenity-park/"
    },
    {
        "id": "diviana-park",
        "name": "Diviana Park",
        "aliases": ["diviana", "diviana park"],
        "status": "Ongoing",
        "location": "Murbad, Thane",
        "category": "Weekend Home Community",
        "bestFor": "Families who want villa-ready weekends, community living, and plot-plus-villa options.",
        "headline": "A 34-acre weekend-home community built around family time and modern village planning.",
        "description": "Diviana Park is positioned as a 34-acre premium weekend-home community with plot, villa, and villa-plus-plot options.",
        "plotOptions": "Plots from 1624 sq ft+ are mentioned publicly.",
        "highlights": [
            "34-acre community with 14+ amenities references",
            "TP-sanctioned layout and separate 7/12 references",
            "Villa, plot, and villa-plus-plot options",
            "Finance availability and 1.43 FSI messaging"
        ],
        "image": "/photos/diviana.jpg",
        "sourceUrl": "https://acreages.co.in/premium-farmhouse-diviana-park/"
    },
    {
        "id": "violet-park-ii",
        "name": "Violet Park II",
        "aliases": ["violet park ii", "violet ii", "violet park 2"],
        "status": "Almost Sold Out",
        "location": "Near Karjat-Mhasa-Tokavde Highway, Murbad",
        "category": "Premium Farmhouse Project",
        "bestFor": "Buyers looking for ready Murbad farmhouse land with limited inventory.",
        "headline": "A near-sold-out Murbad farmhouse launch with urgency and ready-possession appeal.",
        "description": "Violet Park II is presented as a 22-acre premium farmhouse project near the Malshej mountain range with ready amenities and customized farmhouse possibilities.",
        "plotOptions": "10 guntha onwards is publicly referenced.",
        "highlights": [
            "22-acre project with last-few-plots style urgency",
            "Ready possession and ready amenities references",
            "25-ft gravel road messaging",
            "Customized farmhouse option"
        ],
        "image": "/photos/free-photo-of-scenic-view-of-house-with-misty-mountains-in-background.jpeg",
        "sourceUrl": "https://acreages.co.in/projects/"
    },
    {
        "id": "elarise-park",
        "name": "Elarise Park",
        "aliases": ["elarise", "elarise park"],
        "status": "Signature / Investment",
        "location": "Pune-Bengaluru Highway / NH-48",
        "category": "Highway-Front Investment Land",
        "bestFor": "Commercial, logistics, warehousing, industrial, or highway-linked investment use.",
        "headline": "A highway-front land parcel positioned for commercial scale and investor logic.",
        "description": "Elarise Park is framed as premium highway-front land with commercial and logistics use cases rather than a farmhouse lifestyle project.",
        "plotOptions": "Built around a 2.5-acre parcel rather than farmhouse plot bands.",
        "highlights": [
            "260-ft frontage on NH-48",
            "Up to 2 FSI and separate 7/12 references",
            "Immediate registration positioning",
            "Suitable for logistics, warehousing, commercial, and industrial use"
        ],
        "image": "/photos/12.png",
        "sourceUrl": "https://acreages.co.in/elarise-park/"
    },
    {
        "id": "avyay-park",
        "name": "Avyay Park",
        "aliases": ["avyay", "avyay park"],
        "status": "Legacy / Team Confirmation Needed",
        "location": "Kamshet / Lonavala",
        "category": "Hill-Station Farmhouse",
        "bestFor": "Hill-station farmhouse buyers exploring Kamshet or Lonavala style living.",
        "headline": "A hill-station farmhouse story that now works best as a legacy or signature advisory reference.",
        "description": "Avyay Park is positioned around Kamshet-Lonavala mountain views, gated planning, clear-title positioning, and ready farmhouse plots.",
        "plotOptions": "11 guntha onwards is mentioned publicly.",
        "highlights": [
            "14-acre hill-station project references",
            "9+ amenities and gated-community messaging",
            "Category 1 land and separate 7/12 references",
            "Availability should be confirmed with the team"
        ],
        "image": "/photos/farm-plots-kamshet-1.jpg",
        "sourceUrl": "https://acreages.co.in/premium-farmhouse-avyay-park/"
    },
    {
        "id": "leafwood-park",
        "name": "Leafwood Park",
        "aliases": ["leafwood", "leafwood park"],
        "status": "Pre-Bookings Open",
        "location": "Palu-Murbad, Thane",
        "category": "Upcoming Reference",
        "bestFor": "Buyers who want an upcoming Palu-Murbad option before the full launch story matures.",
        "headline": "An upcoming Palu-Murbad reference for early-stage buyers.",
        "description": "Leafwood Park is referenced publicly with lighter details and pre-booking language.",
        "plotOptions": "Project-specific inventory should be confirmed with the team.",
        "highlights": [
            "Publicly referenced as a pre-booking opportunity",
            "Located in Palu-Murbad, Thane",
            "Useful for buyers tracking upcoming launches"
        ],
        "image": "/photos/pexels-vu-ng-c-c-ng-2033625435-30393472.jpg",
        "sourceUrl": "https://acreages.co.in/projects/"
    },
    {
        "id": "orchard-park",
        "name": "Orchard Park",
        "aliases": ["orchard", "orchard park", "mangaon orchard park"],
        "status": "Coming Soon",
        "location": "Mangaon",
        "category": "Upcoming Reference",
        "bestFor": "Buyers who want a lighter-detail upcoming option in Mangaon.",
        "headline": "A coming-soon Mangaon reference in the Acreages pipeline.",
        "description": "Orchard Park is listed as a coming-soon project reference with lighter public detail.",
        "plotOptions": "Current inventory should be confirmed with the Acreages team.",
        "highlights": [
            "Coming-soon status on public pages",
            "Part of the upcoming project pipeline",
            "Best treated as an early-interest enquiry route"
        ],
        "image": "/photos/sky.jpg",
        "sourceUrl": "https://acreages.co.in/projects/"
    },
    {
        "id": "shrivardhan-seawinds-park",
        "name": "Shrivardhan Seawinds Park",
        "aliases": ["shrivardhan seawinds park", "seawinds park", "shrivardhan"],
        "status": "Upcoming",
        "location": "Shrivardhan",
        "category": "Upcoming Reference",
        "bestFor": "Buyers monitoring future coastal-style weekend-home references.",
        "headline": "An upcoming reference with limited public details today.",
        "description": "Shrivardhan Seawinds Park is referenced as part of the upcoming Acreages pipeline.",
        "plotOptions": "Project-specific detail is expected from the team when launch communication advances.",
        "highlights": [
            "Upcoming reference only",
            "Best for early interest registration",
            "Current launch terms should be confirmed directly"
        ],
        "image": "/photos/sky.jpg",
        "sourceUrl": "https://acreages.co.in/projects/"
    },
    {
        "id": "shahapur-nest-park",
        "name": "Shahapur Nest Park",
        "aliases": ["shahapur nest park", "nest park", "shahapur nest"],
        "status": "Upcoming",
        "location": "Shahapur",
        "category": "Upcoming Reference",
        "bestFor": "Buyers who want to track future Shahapur launch opportunities.",
        "headline": "An upcoming Shahapur reference for buyers who want to stay early in the loop.",
        "description": "Shahapur Nest Park is listed among the upcoming project references with limited public details today.",
        "plotOptions": "Detailed plot, price, and launch information should be confirmed with the team.",
        "highlights": [
            "Upcoming reference in the public pipeline",
            "Useful for pre-enquiry or callback routing",
            "Live launch details need team confirmation"
        ],
        "image": "/photos/sky.jpg",
        "sourceUrl": "https://acreages.co.in/projects/"
    },
    {
        "id": "new-mahabaleshwar-sky-park-phase-ii",
        "name": "New Mahabaleshwar Sky Park Phase II",
        "aliases": ["new mahabaleshwar sky park phase ii", "sky park phase ii", "mahabaleshwar sky park"],
        "status": "Upcoming",
        "location": "New Mahabaleshwar",
        "category": "Upcoming Reference",
        "bestFor": "Buyers who want a future hill-station style launch reference.",
        "headline": "An upcoming hill-station pipeline reference with limited public detail today.",
        "description": "New Mahabaleshwar Sky Park Phase II is mentioned publicly as part of the upcoming pipeline.",
        "plotOptions": "Launch inventory should be confirmed with the Acreages team.",
        "highlights": [
            "Upcoming phase reference",
            "Useful for early interest capture",
            "Current commercial details require live confirmation"
        ],
        "image": "/photos/sky.jpg",
        "sourceUrl": "https://acreages.co.in/projects/"
    }
]

SERVICES = {
    "villas": {
        "title": "Villa and Construction Options",
        "summary": "Acreages publicly presents villa and construction options for buyers who want a more built-out weekend-home experience.",
        "items": [
            "Contemporary Brick / RCC Bungalows",
            "Premium Luxury Villas",
            "Prefab / A-frame / Container Homes",
            "Red Laterite Stone Villas"
        ]
    },
    "advisory": {
        "title": "Advisory Services",
        "summary": "Acreages supports land acquisition, farmer certificate guidance, legal due diligence, weekend-home guidance, and local market knowledge.",
        "items": [
            "Land acquisition support",
            "Farmer certificate guidance",
            "Free legal advice positioning",
            "Weekend-home project guidance",
            "Legal due diligence",
            "Property investment advisory"
        ]
    },
    "offers": {
        "title": "Offers and Campaign Notes",
        "summary": "Public offer pages mention campaign-style benefits, but live validity should always be confirmed with the team.",
        "items": [
            "Free barbed-wire fencing",
            "Free legal advice for first-time weekend-home buyers",
            "Free farmer certificate for qualifying large-acreage buyers, subject to limits",
            "Serenity Park Phase II campaign: First to Book. First to Benefit.",
            "Free plantation and drip irrigation on select larger-acreage references",
            "OTA support to help maximize weekend-home usage potential"
        ]
    },
    "nri": {
        "title": "NRI Support",
        "summary": "Acreages supports NRIs with project selection, documentation guidance, legal clarity, and communication through channels such as WhatsApp, Signal, and Botim.",
        "items": [
            "Project selection support",
            "Documentation guidance",
            "Legal clarity discussions",
            "Remote communication support"
        ]
    },
    "legal": {
        "title": "Free Legal Advice",
        "summary": "Acreages can help buyers understand document verification, land usage, zoning, conversion, acquisition, liaisoning, and dispute-related process guidance.",
        "items": [
            "Document verification support",
            "Land usage and zoning guidance",
            "Conversion and acquisition guidance",
            "Liaisoning support",
            "Dispute-process guidance"
        ]
    },
    "investor": {
        "title": "Investor and Promoter Support",
        "summary": "Acreages positions investor opportunities around verified projects, transparent processes, and structured promoter support.",
        "items": [
            "Investor Relations contact route",
            "Promoter-style opportunities",
            "Verified-project positioning",
            "Transparent-process messaging"
        ]
    },
    "channel-partner": {
        "title": "Channel Partner Program",
        "summary": "Acreages offers a channel partner route for brokers, agents, and real-estate sellers.",
        "items": [
            "Commissions and incentives",
            "Rewards and sales support",
            "Brand strength and market expertise",
            "Diverse project portfolio"
        ]
    },
    "referral": {
        "title": "Referral Program",
        "summary": "Acreages publicly mentions a referral route for friends, family, and network introductions with reward-based positioning if the deal closes.",
        "items": [
            "Referral reward positioning",
            "Friends and family referrals",
            "Network-based introductions"
        ]
    },
    "careers": {
        "title": "Careers",
        "summary": "Acreages accepts career enquiries for roles across sales, pre-sales, HR/admin, civil site engineering, and internships.",
        "items": [
            "HR & Admin Executive",
            "Pre-Sales Executive",
            "Sales Executive",
            "Civil Site Engineer",
            "Intern roles"
        ]
    }
}

CONTACTS = {
    "salesPhone": "+91 9892148789",
    "officePhone": "+91 9029012529",
    "generalEmail": "contact@acreages.co.in",
    "channelPartnerPhone": "+91 8652147931",
    "channelPartnerEmail": "shashikant@acreages.co.in",
    "investorName": "Mr. Shani Malave",
    "investorPhone": "+91 9892148789",
    "investorEmail": "shani@acreages.co.in",
    "address": "Moreshwar, A301, 3rd Floor, Plot A35, Sector 20, Opp. Station, Nerul West, Navi Mumbai, 400706, India"
}

QUICK_ACTIONS = {
    "greeting": ["Explore Projects", "Book Site Visit", "Get Brochure", "NRI Support", "Legal Advice"],
    "projects": ["Get Price", "Book Site Visit", "Download Brochure", "Compare Projects", "Talk to Sales"],
    "investor": ["Speak to Investor Relations", "See Investment Options", "Become Promoter"],
    "partners": ["Join as Channel Partner", "Talk to Channel Sales"],
    "general": ["Explore Projects", "Talk to Sales", "Book Site Visit"]
}


def extract_paragraphs(doc_path: Path) -> list[str]:
    with zipfile.ZipFile(doc_path) as archive:
        xml_data = archive.read("word/document.xml")

    root = ET.fromstring(xml_data)
    paragraphs: list[str] = []
    for paragraph in root.findall(".//w:p", DOC_NS):
        fragments = [node.text or "" for node in paragraph.findall(".//w:t", DOC_NS)]
        text = "".join(fragments).strip()
        if text:
            paragraphs.append(re.sub(r"\s+", " ", text))
    return paragraphs


def is_heading(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    if stripped in {"Field", "Data", "Source URL", "Tags"}:
        return False
    if re.match(r"^\d+\.\s+", stripped):
        return True
    if stripped.endswith("Project Details"):
        return True
    if stripped.endswith("Overview"):
        return True
    if stripped.endswith("Support"):
        return len(stripped.split()) <= 8
    if len(stripped) <= 70 and "." not in stripped and ":" not in stripped:
        words = stripped.split()
        if 1 <= len(words) <= 8:
            title_like = sum(1 for word in words if word[:1].isupper() or word.isupper() or re.match(r"^\d+[+/A-Za-z-]*$", word))
            return title_like >= max(1, len(words) - 1)
    return False


def chunk_lines(lines: Iterable[str]) -> list[dict]:
    chunks: list[dict] = []
    current_heading = "Acreages Knowledge"
    buffer: list[str] = []

    def flush() -> None:
        nonlocal buffer
        text = " ".join(buffer).strip()
        if not text:
            buffer = []
            return

        parts = re.split(r"(?<=[.!?])\s+", text)
        segment: list[str] = []
        char_count = 0
        part_index = 1
        for sentence in parts:
            if not sentence:
                continue
            sentence = sentence.strip()
            segment.append(sentence)
            char_count += len(sentence) + 1
            if char_count >= 760:
                chunk_text = " ".join(segment).strip()
                chunks.append(build_chunk(current_heading, chunk_text, part_index))
                part_index += 1
                segment = []
                char_count = 0
        if segment:
            chunk_text = " ".join(segment).strip()
            chunks.append(build_chunk(current_heading, chunk_text, part_index))
        buffer = []

    for line in lines:
        if is_heading(line):
            flush()
            current_heading = re.sub(r"^\d+\.\s+", "", line).strip()
            continue
        if line in {"Field", "Data", "Source URL", "Tags"}:
            continue
        buffer.append(line)

    flush()
    return chunks


def build_chunk(title: str, text: str, index: int) -> dict:
    combined = f"{title} {text}".lower()
    tags = []
    tag_map = {
        "project": ["project", "plot", "villa", "farmhouse", "land"],
        "investor": ["investor", "promoter", "returns"],
        "nri": ["nri", "abroad", "botim", "signal"],
        "legal": ["legal", "clear-title", "7/12", "verification", "zoning"],
        "offers": ["offer", "free legal", "farmer certificate", "drip irrigation", "fencing"],
        "careers": ["career", "hr", "pre-sales", "intern", "civil site engineer"],
        "channel-partner": ["channel partner", "commission", "incentive"],
        "referral": ["referral", "reward"],
        "contact": ["contact@", "+91", "phone", "email", "office"],
        "faq": ["faq", "question", "answer"],
        "blog": ["blog", "article", "seo", "akshaya tritiya", "waterfront"],
    }
    for tag, keywords in tag_map.items():
        if any(keyword in combined for keyword in keywords):
            tags.append(tag)

    for project in PROJECTS:
        if any(alias in combined for alias in project["aliases"]):
            tags.append(project["id"])

    return {
        "id": f"{slugify(title)}-{index}",
        "title": title,
        "text": text,
        "tags": sorted(set(tags))
    }


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "acreages"


def main() -> None:
    paragraphs = extract_paragraphs(SOURCE_DOC)
    chunks = chunk_lines(paragraphs)
    payload = {
        "sourceDocument": str(SOURCE_DOC.relative_to(ROOT)).replace("\\", "/"),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "projects": PROJECTS,
        "services": SERVICES,
        "contacts": CONTACTS,
        "quickActions": QUICK_ACTIONS,
        "chunks": chunks,
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()




