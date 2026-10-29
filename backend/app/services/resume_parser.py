import re
import zipfile
import xml.etree.ElementTree as ET
import fitz  # PyMuPDF
from typing import Dict, List, Any, Optional

# Extensible canonical skills dictionary and known aliases
SKILL_ALIASES = {
    "javascript": "JavaScript",
    "js": "JavaScript",
    "ecmascript": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "python": "Python",
    "py": "Python",
    "python3": "Python",
    "java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "php": "PHP",
    "ruby": "Ruby",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "sass": "Sass",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "angular": "Angular",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node": "Node.js",
    "express": "Express.js",
    "expressjs": "Express.js",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "sql": "SQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "sqlite": "SQLite",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "graphql": "GraphQL",
    "rest": "REST API",
    "rest api": "REST API",
    "restful": "REST API",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "gcp": "Google Cloud",
    "google cloud platform": "Google Cloud",
    "ci/cd": "CI/CD",
    "linux": "Linux",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "computer vision": "Computer Vision",
    "cv": "Computer Vision",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "data analysis": "Data Analysis",
    "data visualization": "Data Visualization",
    "tableau": "Tableau",
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "cybersecurity": "Cybersecurity",
    "penetration testing": "Penetration Testing",
    "ethical hacking": "Ethical Hacking",
    "network security": "Network Security",
    "cryptography": "Cryptography",
    "flutter": "Flutter",
    "react native": "React Native",
    "android": "Android Development",
    "swift": "Swift",
    "ios": "iOS Development",
    "agile": "Agile / Scrum",
    "scrum": "Agile / Scrum",
    "system design": "System Design",
    "data structures": "Data Structures & Algorithms",
    "dsa": "Data Structures & Algorithms",
    "algorithms": "Data Structures & Algorithms"
}

class ResumeParserService:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extracts plain text from PDF using PyMuPDF (fitz)."""
        doc = fitz.open(file_path)
        full_text = []
        for page in doc:
            full_text.append(page.get_text())
        doc.close()
        return "\n".join(full_text)

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extracts text from DOCX document using standard library zipfile and XML parsing."""
        try:
            with zipfile.ZipFile(file_path) as z:
                xml_content = z.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            texts = [node.text for node in tree.iter() if node.text and node.tag.endswith('t')]
            return " ".join(texts)
        except Exception:
            return ""

    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extracts text from PDF or DOCX file."""
        if file_path.lower().endswith(".docx"):
            return ResumeParserService.extract_text_from_docx(file_path)
        return ResumeParserService.extract_text_from_pdf(file_path)

    @staticmethod
    def extract_skills_and_sections(text: str) -> Dict[str, Any]:
        """
        Parses text for:
        1. Identified skills using alias normalization and word boundary matching.
        2. Identified education snippet.
        3. Identified experience snippet.
        """
        lower_text = text.lower()
        extracted_skills = set()

        # Multi-word alias check first
        sorted_keys = sorted(SKILL_ALIASES.keys(), key=lambda k: len(k), reverse=True)
        for key in sorted_keys:
            # Pattern matching with boundary
            # escape special regex characters like c++, c#
            escaped = re.escape(key)
            pattern = rf"(?<!\w){escaped}(?!\w)"
            if re.search(pattern, lower_text):
                canonical_name = SKILL_ALIASES[key]
                extracted_skills.add(canonical_name)

        # Section extraction heuristics
        education_snippet = ""
        experience_snippet = ""

        edu_match = re.search(r"(education|academic background|qualifications)([\s\S]{50,600}?)(experience|projects|skills|work history|$)", lower_text, re.IGNORECASE)
        if edu_match:
            start, end = edu_match.span(2)
            education_snippet = text[start:end].strip()

        exp_match = re.search(r"(experience|work experience|employment history|projects)([\s\S]{50,800}?)(education|skills|certifications|$)", lower_text, re.IGNORECASE)
        if exp_match:
            start, end = exp_match.span(2)
            experience_snippet = text[start:end].strip()

        return {
            "extracted_skills": sorted(list(extracted_skills)),
            "education": education_snippet if education_snippet else "Detected in resume",
            "experience": experience_snippet if experience_snippet else "Extracted from resume",
        }
