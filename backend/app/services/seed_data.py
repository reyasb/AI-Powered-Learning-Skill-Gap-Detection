from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.models import (
    User, StudentProfile, Skill, SkillPrerequisite, CareerRole,
    CareerRequiredSkill, AssessmentDefinition, AssessmentQuestion, LearningResource,
    Course, Lesson, CourseEnrollment, LessonProgress, CourseSkill
)
from app.core.security import get_password_hash

SKILLS_SEED = [
    # Languages
    {"name": "Python", "category": "Languages", "description": "High-level, versatile language for backend, AI, and scripting."},
    {"name": "JavaScript", "category": "Languages", "description": "Core dynamic language of the modern web and frontend development."},
    {"name": "TypeScript", "category": "Languages", "description": "Typed superset of JavaScript providing enterprise-grade maintainability."},
    {"name": "Java", "category": "Languages", "description": "Object-oriented language popular in enterprise and Android ecosystems."},
    {"name": "C++", "category": "Languages", "description": "High-performance systems programming language with direct memory control."},
    {"name": "SQL", "category": "Languages", "description": "Structured Query Language for querying and managing relational databases."},
    {"name": "Go", "category": "Languages", "description": "Concurrent, compiled systems language engineered at Google."},

    # Frameworks & Libraries
    {"name": "React", "category": "Frameworks", "description": "Component-based declarative UI library for modern frontend applications."},
    {"name": "Node.js", "category": "Frameworks", "description": "Asynchronous event-driven JavaScript runtime for scalable backend services."},
    {"name": "FastAPI", "category": "Frameworks", "description": "High-performance Python web framework with automatic OpenAPI docs."},
    {"name": "Django", "category": "Frameworks", "description": "Batteries-included web framework for Python."},
    {"name": "Spring Boot", "category": "Frameworks", "description": "Java-based framework for enterprise microservices."},
    {"name": "Express.js", "category": "Frameworks", "description": "Minimalist and flexible web application framework for Node.js."},

    # Databases
    {"name": "PostgreSQL", "category": "Databases", "description": "Powerful open-source object-relational database system."},
    {"name": "MongoDB", "category": "Databases", "description": "Document-based NoSQL database for flexible JSON-style storage."},
    {"name": "Redis", "category": "Databases", "description": "In-memory data structure store used as database, cache, and message broker."},

    # Cloud & DevOps
    {"name": "Docker", "category": "Cloud & DevOps", "description": "Platform for containerizing applications into isolated deployable units."},
    {"name": "Kubernetes", "category": "Cloud & DevOps", "description": "Automated container orchestration, scaling, and cluster management system."},
    {"name": "AWS", "category": "Cloud & DevOps", "description": "Comprehensive Amazon Web Services cloud infrastructure and services."},
    {"name": "CI/CD", "category": "Cloud & DevOps", "description": "Continuous Integration and Continuous Delivery automation pipelines."},
    {"name": "Linux", "category": "Cloud & DevOps", "description": "Open-source Unix-like OS underlying server and cloud infrastructure."},
    {"name": "Git", "category": "Cloud & DevOps", "description": "Distributed version control system for tracking source code changes."},

    # AI & ML
    {"name": "Machine Learning", "category": "AI / ML", "description": "Supervised, unsupervised algorithms and predictive modeling."},
    {"name": "Deep Learning", "category": "AI / ML", "description": "Multi-layer neural networks, backpropagation, and transformer architectures."},
    {"name": "Natural Language Processing", "category": "AI / ML", "description": "Text analytics, language models, tokenization, and semantic processing."},
    {"name": "Computer Vision", "category": "AI / ML", "description": "Image processing, object detection, and visual perception models."},
    {"name": "PyTorch", "category": "AI / ML", "description": "Dynamic tensor computation library for deep learning research and deployment."},
    {"name": "Scikit-Learn", "category": "AI / ML", "description": "Python library for classical machine learning and data preprocessing."},

    # Data
    {"name": "Data Analysis", "category": "Data", "description": "Exploratory data analysis, statistical tests, and hypothesis validation."},
    {"name": "Data Visualization", "category": "Data", "description": "Communicating insights through interactive dashboards and statistical charts."},
    {"name": "Pandas", "category": "Data", "description": "High-performance data manipulation and analysis library for Python."},
    {"name": "Tableau", "category": "Data", "description": "Business intelligence software for visual analytics and enterprise reporting."},

    # Cybersecurity
    {"name": "Cybersecurity", "category": "Cybersecurity", "description": "Fundamentals of protecting systems, networks, and data from cyber threats."},
    {"name": "Network Security", "category": "Cybersecurity", "description": "Firewalls, VPNs, IDS/IPS, protocol inspection, and packet analysis."},
    {"name": "Penetration Testing", "category": "Cybersecurity", "description": "Simulating attacks to identify vulnerabilities in systems and applications."},
    {"name": "Cryptography", "category": "Cybersecurity", "description": "Symmetric and asymmetric encryption, hashing, and PKI infrastructure."},

    # Mobile & Core
    {"name": "Flutter", "category": "Mobile", "description": "Google's UI toolkit for compiling cross-platform native apps from a single codebase."},
    {"name": "React Native", "category": "Mobile", "description": "Framework for building native apps using React and JavaScript."},
    {"name": "Data Structures & Algorithms", "category": "Core CS", "description": "Time/space complexity, trees, graphs, dynamic programming, sorting."},
    {"name": "System Design", "category": "Core CS", "description": "Designing high-scale, distributed, fault-tolerant architectures."}
]

CAREERS_SEED = [
    {
        "title": "Software Developer",
        "slug": "software-developer",
        "description": "Generalist software engineer building robust applications, algorithmic solutions, and clean software architecture.",
        "category": "Software Engineering",
        "suggested_topics": ["Clean Code", "Design Patterns", "Unit Testing", "Modular Architecture"],
        "sample_projects": ["Task Management Engine", "CLI Automation Tool", "Distributed Cache Client"],
        "skills": [
            ("Data Structures & Algorithms", 85.0, 5.0, "Core algorithmic reasoning and complexity optimization"),
            ("Python", 80.0, 4.0, "Primary or secondary language for rapid development"),
            ("Git", 80.0, 4.0, "Collaborative version control and branching strategies"),
            ("SQL", 75.0, 3.5, "Data querying and relational persistence"),
            ("System Design", 70.0, 4.0, "Scalable component composition and APIs")
        ]
    },
    {
        "title": "Full Stack Developer",
        "slug": "full-stack-developer",
        "description": "End-to-end web engineer proficient in interactive frontend interfaces, resilient backend APIs, and database modeling.",
        "category": "Web Development",
        "suggested_topics": ["State Management", "RESTful API Design", "Authentication & JWT", "Component Architecture"],
        "sample_projects": ["E-Commerce Marketplace", "SaaS Analytics Dashboard", "Collaborative Workspace"],
        "skills": [
            ("JavaScript", 85.0, 5.0, "Full-stack language foundation across client and server"),
            ("React", 85.0, 4.5, "Modern reactive single-page application development"),
            ("Node.js", 80.0, 4.5, "Server-side asynchronous runtime and microservices"),
            ("TypeScript", 80.0, 4.0, "Type safety across frontend and API layers"),
            ("PostgreSQL", 75.0, 4.0, "Relational database schema design and migrations"),
            ("Git", 80.0, 3.5, "Version control workflow")
        ]
    },
    {
        "title": "Backend Developer",
        "slug": "backend-developer",
        "description": "Server-side specialist focusing on high-throughput microservices, database transactions, concurrency, and API security.",
        "category": "Software Engineering",
        "suggested_topics": ["Concurrency & Async I/O", "Database Indexing & Query Plans", "Caching Patterns", "Microservice Architectures"],
        "sample_projects": ["Payment Processing Gateway", "High-Throughput Streaming API", "Inventory Ledger"],
        "skills": [
            ("FastAPI", 85.0, 5.0, "Modern asynchronous API framework with automatic validation"),
            ("PostgreSQL", 85.0, 5.0, "Advanced SQL, transactions, indexing, and connection pooling"),
            ("Python", 85.0, 4.5, "Backend service logic and asynchronous concurrency"),
            ("Docker", 80.0, 4.0, "Containerized service packaging and environments"),
            ("System Design", 80.0, 4.5, "Architecting distributed services and event buses"),
            ("Redis", 75.0, 3.5, "Caching layers, pub/sub, and rate-limiting structures")
        ]
    },
    {
        "title": "AI/ML Engineer",
        "slug": "ai-ml-engineer",
        "description": "Engineer designing, training, evaluating, and deploying machine learning and deep learning models into production.",
        "category": "Artificial Intelligence",
        "suggested_topics": ["Feature Engineering", "Neural Architecture Search", "Model Serving & Quantization", "MLOps Pipelines"],
        "sample_projects": ["Automated Defect Detection Vision Model", "Domain-Specific RAG Engine", "Recommendation Microservice"],
        "skills": [
            ("Python", 90.0, 5.0, "Ecosystem language for tensor computing and model training"),
            ("Machine Learning", 85.0, 5.0, "Statistical modeling, regularization, and evaluation metrics"),
            ("PyTorch", 85.0, 4.5, "Deep neural network architectures and GPU acceleration"),
            ("Deep Learning", 80.0, 4.5, "Transformers, backpropagation, and latent representations"),
            ("Scikit-Learn", 80.0, 4.0, "Classical baseline modeling, pipelines, and validation"),
            ("Docker", 75.0, 3.5, "Reproducible model containerization and API serving")
        ]
    },
    {
        "title": "Data Scientist",
        "slug": "data-scientist",
        "description": "Analytical scientist blending statistics, programming, and domain knowledge to extract actionable intelligence and predictive models.",
        "category": "Data Science",
        "suggested_topics": ["Hypothesis Testing", "A/B Experimentation", "Dimensionality Reduction", "Predictive Analytics"],
        "sample_projects": ["Customer Churn Predictor", "Marketing Attribution Model", "Dynamic Pricing Engine"],
        "skills": [
            ("Python", 85.0, 5.0, "Core language for data manipulation and statistical scripts"),
            ("Pandas", 90.0, 5.0, "Dataframe reshaping, aggregation, and time-series ops"),
            ("SQL", 85.0, 4.5, "Complex analytical window queries and aggregations"),
            ("Machine Learning", 80.0, 4.5, "Regression, classification, and clustering methodologies"),
            ("Data Visualization", 80.0, 4.0, "Exploratory charting and stakeholder communication")
        ]
    },
    {
        "title": "Data Analyst",
        "slug": "data-analyst",
        "description": "Professional transforming raw corporate data into intuitive dashboards, KPI reports, and decision-making insights.",
        "category": "Data Analytics",
        "suggested_topics": ["Relational Data Modeling", "Executive Dashboards", "Statistical Metrics", "Cohort Analysis"],
        "sample_projects": ["Executive Revenue Dashboard", "User Retention Funnel", "Supply Chain Metric Audit"],
        "skills": [
            ("SQL", 90.0, 5.0, "Advanced data joins, grouping, and analytical queries"),
            ("Data Analysis", 85.0, 5.0, "Data validation, exploratory metrics, and KPI tracking"),
            ("Tableau", 80.0, 4.5, "Interactive business intelligence dashboards"),
            ("Data Visualization", 80.0, 4.5, "Storytelling with charts and visual metrics"),
            ("Python", 70.0, 3.5, "Scripting for automated reporting and data ETL")
        ]
    },
    {
        "title": "Cybersecurity Analyst",
        "slug": "cybersecurity-analyst",
        "description": "Information security defender safeguarding corporate infrastructure, monitoring threats, and auditing vulnerabilities.",
        "category": "Cybersecurity",
        "suggested_topics": ["Threat Intelligence", "Incident Response", "Vulnerability Management", "SOC Operations"],
        "sample_projects": ["Intrusion Detection Log Analyzer", "Automated Vulnerability Scanner", "Network Penetration Report"],
        "skills": [
            ("Cybersecurity", 90.0, 5.0, "Security principles, CIA triad, and defense in depth"),
            ("Network Security", 85.0, 5.0, "Firewalls, subnets, packet analysis, and VPN protocols"),
            ("Linux", 80.0, 4.5, "System auditing, permissions, and log inspection"),
            ("Cryptography", 75.0, 4.0, "Hashing algorithms, TLS/SSL, and key management"),
            ("Penetration Testing", 75.0, 4.0, "Vulnerability scanning, exploit analysis, and hardening")
        ]
    },
    {
        "title": "Cloud Engineer",
        "slug": "cloud-engineer",
        "description": "Cloud architect deploying resilient, auto-scaling, and cost-effective cloud services on modern hyperscalers.",
        "category": "Cloud Infrastructure",
        "suggested_topics": ["Infrastructure as Code", "VPC & Networking", "High Availability & Multi-Region", "Cost Governance"],
        "sample_projects": ["Multi-Tier AWS Cloud Architecture", "Terraform VPC Automation", "Serverless Event Pipeline"],
        "skills": [
            ("AWS", 90.0, 5.0, "Core compute, storage, networking, and IAM policies"),
            ("Docker", 85.0, 4.5, "Containerization of cloud workloads"),
            ("Linux", 85.0, 4.5, "System configuration, shell scripting, and storage"),
            ("Kubernetes", 75.0, 4.0, "Cluster workload management and ingress routing"),
            ("CI/CD", 75.0, 4.0, "Automated deployment pipelines to cloud targets")
        ]
    },
    {
        "title": "DevOps Engineer",
        "slug": "devops-engineer",
        "description": "Automation engineer bridging software development and IT operations through robust CI/CD and observability.",
        "category": "DevOps & SRE",
        "suggested_topics": ["GitOps", "Continuous Deployment", "Site Reliability Engineering", "Distributed Tracing"],
        "sample_projects": ["Zero-Downtime Deployment Pipeline", "Prometheus & Grafana Monitoring Stack", "GitOps Kubernetes Engine"],
        "skills": [
            ("Docker", 90.0, 5.0, "Immutable artifact builds and container optimization"),
            ("Kubernetes", 85.0, 5.0, "Orchestration, Helm charts, and cluster autoscaling"),
            ("CI/CD", 90.0, 5.0, "Automated test, build, and deploy stages"),
            ("Linux", 85.0, 4.5, "Shell scripting and system troubleshooting"),
            ("Git", 85.0, 4.5, "GitOps workflow and repository automation")
        ]
    },
    {
        "title": "Mobile Application Developer",
        "slug": "mobile-developer",
        "description": "Mobile specialist crafting fluid, responsive, high-performance applications for iOS and Android devices.",
        "category": "Mobile Development",
        "suggested_topics": ["Native Mobile Lifecycles", "Offline Data Sync", "Cross-Platform Optimization", "Mobile Push & App Store Ops"],
        "sample_projects": ["Real-Time Chat & Media App", "Fitness Tracker with Offline Sync", "Mobile Banking Portal"],
        "skills": [
            ("React Native", 85.0, 5.0, "Cross-platform mobile UI development and native bridges"),
            ("JavaScript", 85.0, 4.5, "Modern ES6+ language syntax and async architecture"),
            ("TypeScript", 80.0, 4.5, "Type safety for robust mobile state management"),
            ("Flutter", 75.0, 4.0, "Declarative multi-platform widget UI design"),
            ("Git", 80.0, 3.5, "Branching and version control workflow")
        ]
    }
]

PREREQUISITES_SEED = [
    ("Machine Learning", "Python"),
    ("Deep Learning", "Machine Learning"),
    ("Natural Language Processing", "Machine Learning"),
    ("Computer Vision", "Deep Learning"),
    ("PyTorch", "Python"),
    ("Scikit-Learn", "Python"),
    ("React", "JavaScript"),
    ("TypeScript", "JavaScript"),
    ("Node.js", "JavaScript"),
    ("FastAPI", "Python"),
    ("Django", "Python"),
    ("Kubernetes", "Docker"),
    ("System Design", "Data Structures & Algorithms"),
    ("Penetration Testing", "Network Security"),
    ("Pandas", "Python")
]

QUESTIONS_SEED = [
    # Python
    {
        "skill": "Python",
        "q": "What is the primary difference between a list and a tuple in Python?",
        "a": "Lists are mutable, whereas tuples are immutable.",
        "b": "Tuples can only store numbers, while lists store any type.",
        "c": "Lists use less memory and are faster than tuples.",
        "d": "Tuples do not support indexing or slicing.",
        "correct": "A",
        "explanation": "In Python, lists are mutable objects that can be modified in-place, whereas tuples are immutable and cannot be altered once instantiated.",
        "difficulty": "easy"
    },
    {
        "skill": "Python",
        "q": "How does the Global Interpreter Lock (GIL) affect multithreaded CPU-bound Python programs?",
        "a": "It automatically parallelizes execution across all available CPU cores.",
        "b": "It prevents multiple native threads from executing Python bytecodes simultaneously.",
        "c": "It forces all I/O operations to block until thread completion.",
        "d": "It causes race conditions during database read transactions.",
        "correct": "B",
        "explanation": "The GIL is a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously in CPython.",
        "difficulty": "hard"
    },
    {
        "skill": "Python",
        "q": "Which Python decorator is used to define a method that operates on the class itself rather than an instance?",
        "a": "@staticmethod",
        "b": "@classmethod",
        "c": "@property",
        "d": "@abstractmethod",
        "correct": "B",
        "explanation": "@classmethod receives the class object (cls) as its first implicit parameter rather than the instance (self).",
        "difficulty": "medium"
    },

    # JavaScript
    {
        "skill": "JavaScript",
        "q": "What does the JavaScript Event Loop do when executing asynchronous code?",
        "a": "It compiles JavaScript code into native machine instructions at runtime.",
        "b": "It monitors the Call Stack and Task Queue, pushing callback tasks onto the stack when it is empty.",
        "c": "It spins up new OS threads for every function invocation.",
        "d": "It encrypts network payloads prior to dispatching HTTP requests.",
        "correct": "B",
        "explanation": "The event loop continuously checks if the call stack is empty. If it is, pending callbacks from the microtask/macrotask queue are pushed onto the stack.",
        "difficulty": "medium"
    },
    {
        "skill": "JavaScript",
        "q": "What is the output of 'typeof null' in standard JavaScript?",
        "a": "'null'",
        "b": "'undefined'",
        "c": "'object'",
        "d": "'boolean'",
        "correct": "C",
        "explanation": "In JavaScript, 'typeof null' returns 'object' due to a historical legacy implementation detail in the initial JavaScript engine.",
        "difficulty": "easy"
    },

    # React
    {
        "skill": "React",
        "q": "Why should you never mutate React state directly using assignments like 'state.count = 5'?",
        "a": "It causes a syntax error during compilation.",
        "b": "React cannot detect the state change, preventing necessary component re-renders.",
        "c": "It permanently deletes the virtual DOM tree.",
        "d": "It resets all component props to their initial defaults.",
        "correct": "B",
        "explanation": "Direct state mutation bypasses React's reconciliation engine, so React will not know that state changed and will not schedule a re-render.",
        "difficulty": "easy"
    },
    {
        "skill": "React",
        "q": "What is the purpose of the dependency array in React's useEffect hook?",
        "a": "To declare which external npm packages the component imports.",
        "b": "To control when the effect re-runs based on changes to specified variables between renders.",
        "c": "To bind this context to event listener methods.",
        "d": "To force the component to re-mount synchronously on every scroll event.",
        "correct": "B",
        "explanation": "The dependency array tells React to re-run the effect only when one or more of the specified dependency values have changed.",
        "difficulty": "medium"
    },

    # SQL / PostgreSQL
    {
        "skill": "SQL",
        "q": "Which SQL clause is used to filter records based on aggregate function results (e.g., COUNT > 5)?",
        "a": "WHERE",
        "b": "HAVING",
        "c": "GROUP BY",
        "d": "ORDER BY",
        "correct": "B",
        "explanation": "HAVING filters groups of rows produced by GROUP BY and aggregate functions, whereas WHERE filters individual rows before grouping.",
        "difficulty": "easy"
    },
    {
        "skill": "PostgreSQL",
        "q": "What is the primary benefit of creating a B-Tree index on a frequently queried column in PostgreSQL?",
        "a": "It reduces table disk storage space by compressing column values.",
        "b": "It allows O(log N) lookup time instead of an O(N) sequential table scan.",
        "c": "It automatically encrypts the indexed data.",
        "d": "It prevents foreign key constraints from failing.",
        "correct": "B",
        "explanation": "A B-Tree index organizes keys hierarchically, enabling logarithmic lookup, range scans, and ordered retrieval instead of expensive sequential scans.",
        "difficulty": "medium"
    },

    # Docker
    {
        "skill": "Docker",
        "q": "What is the fundamental difference between a Docker image and a Docker container?",
        "a": "An image is an immutable template; a container is a running, stateful instance of an image.",
        "b": "Containers are compiled binary executables; images are configuration scripts.",
        "c": "An image runs on bare metal, while containers require a virtual machine hypervisor.",
        "d": "Images are only for frontend apps; containers are exclusively for databases.",
        "correct": "A",
        "explanation": "A Docker image is a read-only snapshot containing application code and dependencies; a container is a runnable isolated instance created from that image.",
        "difficulty": "easy"
    },

    # Machine Learning
    {
        "skill": "Machine Learning",
        "q": "What is overfitting in a machine learning model?",
        "a": "The model performs poorly on training data and fails to capture patterns.",
        "b": "The model learns noise and details in training data so closely that it fails to generalize to new data.",
        "c": "The model has zero parameters and cannot be optimized.",
        "d": "The model produces constant predictions regardless of input features.",
        "correct": "B",
        "explanation": "Overfitting occurs when a model fits the training set too closely (low bias, high variance), harming its predictive accuracy on unseen test data.",
        "difficulty": "medium"
    },
    {
        "skill": "Machine Learning",
        "q": "Which evaluation metric is most appropriate for a classification problem with severe class imbalance (e.g., 99% negative, 1% positive)?",
        "a": "Raw Accuracy",
        "b": "Precision-Recall AUC or F1-Score",
        "c": "Mean Squared Error",
        "d": "R-squared Score",
        "correct": "B",
        "explanation": "Accuracy is misleading with imbalanced data because predicting only the majority class yields 99% accuracy. Precision-Recall AUC or F1-score accurately reflects minority class detection.",
        "difficulty": "hard"
    },

    # Data Structures & Algorithms
    {
        "skill": "Data Structures & Algorithms",
        "q": "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?",
        "a": "O(1)",
        "b": "O(log N)",
        "c": "O(N)",
        "d": "O(N log N)",
        "correct": "C",
        "explanation": "If elements are inserted in sorted order, an unbalanced BST degenerates into a linked list, resulting in O(N) worst-case search complexity.",
        "difficulty": "medium"
    },
    {
        "skill": "Data Structures & Algorithms",
        "q": "Which data structure implements a LIFO (Last-In, First-Out) access pattern?",
        "a": "Queue",
        "b": "Stack",
        "c": "Hash Table",
        "d": "Binary Heap",
        "correct": "B",
        "explanation": "A Stack operates on the LIFO principle, where the most recently inserted item is the first to be removed.",
        "difficulty": "easy"
    },

    # System Design
    {
        "skill": "System Design",
        "q": "According to the CAP theorem, which property must a distributed system sacrifice in the presence of a network partition (P)?",
        "a": "Either Consistency (C) or Availability (A).",
        "b": "Both Latency and Throughput.",
        "c": "Security encryption standards.",
        "d": "Database normalization rules.",
        "correct": "A",
        "explanation": "The CAP theorem states that during a network partition (P), a distributed data store must choose between returning fresh data (Consistency) or remaining responsive (Availability).",
        "difficulty": "hard"
    },

    # Cybersecurity
    {
        "skill": "Cybersecurity",
        "q": "What is the primary objective of implementing Multi-Factor Authentication (MFA)?",
        "a": "To speed up user login time.",
        "b": "To require two or more distinct evidence categories (knowledge, possession, inherence) before granting access.",
        "c": "To replace firewall rules entirely.",
        "d": "To store passwords in reversible cleartext format.",
        "correct": "B",
        "explanation": "MFA strengthens defense by requiring multiple independent credentials (e.g., password + authenticator code) so compromising one credential does not grant entry.",
        "difficulty": "easy"
    }
]

RESOURCES_SEED = [
    {"skill": "Python", "title": "Official Python 3 Documentation & Tutorial", "topic": "Python Core & Advanced Concepts", "type": "official_doc", "url": "https://docs.python.org/3/tutorial/", "duration": 120, "difficulty": "medium"},
    {"skill": "JavaScript", "title": "MDN Web Docs — Modern JavaScript Guide", "topic": "Asynchronous JS, Event Loop & DOM", "type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "duration": 90, "difficulty": "medium"},
    {"skill": "React", "title": "React.dev — The New Official React Documentation", "topic": "Hooks, State Management & Reconciliation", "type": "official_doc", "url": "https://react.dev/learn", "duration": 110, "difficulty": "medium"},
    {"skill": "FastAPI", "title": "FastAPI Complete Tutorial & Architecture Guide", "topic": "Asynchronous Endpoints & Pydantic Validation", "type": "official_doc", "url": "https://fastapi.tiangolo.com/tutorial/", "duration": 85, "difficulty": "medium"},
    {"skill": "PostgreSQL", "title": "PostgreSQL Tutorial for Production Engineers", "topic": "Indexing, Explain Plans & Concurrency", "type": "article", "url": "https://www.postgresqltutorial.com/", "duration": 95, "difficulty": "hard"},
    {"skill": "Docker", "title": "Docker Getting Started & Container Best Practices", "topic": "Multi-stage builds, Volumes & Networking", "type": "article", "url": "https://docs.docker.com/get-started/", "duration": 70, "difficulty": "easy"},
    {"skill": "Kubernetes", "title": "Kubernetes Basics & Workload Deployment", "topic": "Pods, Deployments, Services & Ingress", "type": "official_doc", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "duration": 120, "difficulty": "hard"},
    {"skill": "Machine Learning", "title": "Scikit-Learn Machine Learning in Python", "topic": "Model Training, Cross Validation & Tuning", "type": "official_doc", "url": "https://scikit-learn.org/stable/tutorial/index.html", "duration": 150, "difficulty": "hard"},
    {"skill": "PyTorch", "title": "Deep Learning with PyTorch: A 60 Minute Blitz", "topic": "Tensors, Autograd & Neural Network Layers", "type": "tutorial", "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", "duration": 60, "difficulty": "hard"},
    {"skill": "Data Structures & Algorithms", "title": "Visualgo — Visualising Data Structures and Algorithms", "topic": "Graph Algorithms, Trees & Dynamic Programming", "type": "article", "url": "https://visualgo.net/", "duration": 140, "difficulty": "hard"},
    {"skill": "System Design", "title": "System Design Primer by Donne Martin", "topic": "Scalability, Caching, Sharding & Load Balancing", "type": "article", "url": "https://github.com/donnemartin/system-design-primer", "duration": 180, "difficulty": "hard"},
    {"skill": "Cybersecurity", "title": "OWASP Top Ten Security Vulnerabilities Guide", "topic": "Web Application Security & Attack Vectors", "type": "article", "url": "https://owasp.org/www-project-top-ten/", "duration": 80, "difficulty": "medium"}
]

def seed_database(db: Session):
    """Populates initial canonical seed data idempotently."""
    # 1. Skills
    skill_map = {}
    for s_data in SKILLS_SEED:
        existing = db.query(Skill).filter(Skill.name == s_data["name"]).first()
        if not existing:
            existing = Skill(name=s_data["name"], category=s_data["category"], description=s_data["description"])
            db.add(existing)
            db.commit()
            db.refresh(existing)
        skill_map[existing.name] = existing

    # 2. Prerequisites
    for s_name, p_name in PREREQUISITES_SEED:
        if s_name in skill_map and p_name in skill_map:
            s_id = skill_map[s_name].id
            p_id = skill_map[p_name].id
            existing_prereq = db.query(SkillPrerequisite).filter(
                SkillPrerequisite.skill_id == s_id,
                SkillPrerequisite.prerequisite_skill_id == p_id
            ).first()
            if not existing_prereq:
                db.add(SkillPrerequisite(skill_id=s_id, prerequisite_skill_id=p_id))
    db.commit()

    # 3. Career Roles & Requirements
    career_map = {}
    for c_data in CAREERS_SEED:
        career = db.query(CareerRole).filter(CareerRole.slug == c_data["slug"]).first()
        if not career:
            career = CareerRole(
                title=c_data["title"],
                slug=c_data["slug"],
                description=c_data["description"],
                category=c_data["category"],
                suggested_topics=c_data["suggested_topics"],
                sample_projects=c_data["sample_projects"]
            )
            db.add(career)
            db.commit()
            db.refresh(career)
        career_map[career.title] = career

        # Add Required Skills
        for skill_name, req_prof, weight, rationale in c_data["skills"]:
            if skill_name in skill_map:
                sk_id = skill_map[skill_name].id
                existing_req = db.query(CareerRequiredSkill).filter(
                    CareerRequiredSkill.career_id == career.id,
                    CareerRequiredSkill.skill_id == sk_id
                ).first()
                if not existing_req:
                    db.add(CareerRequiredSkill(
                        career_id=career.id,
                        skill_id=sk_id,
                        required_proficiency=req_prof,
                        importance_weight=weight,
                        rationale=rationale
                    ))
    db.commit()

    # 4. Assessment Definitions & Questions
    for career_title, career in career_map.items():
        existing_ass = db.query(AssessmentDefinition).filter(
            AssessmentDefinition.career_id == career.id
        ).first()
        if not existing_ass:
            ass = AssessmentDefinition(
                title=f"{career.title} Benchmark Assessment",
                description=f"Standardized evaluation testing readiness across core competency requirements for {career.title}.",
                career_id=career.id,
                difficulty="medium",
                duration_minutes=20,
                total_questions=0
            )
            db.add(ass)
            db.commit()
            db.refresh(ass)

    # Add Questions
    for q_data in QUESTIONS_SEED:
        sk = skill_map.get(q_data["skill"])
        sk_id = sk.id if sk else None

        # Check if question exists
        existing_q = db.query(AssessmentQuestion).filter(
            AssessmentQuestion.question_text == q_data["q"]
        ).first()
        if not existing_q:
            # Attach to matching career assessments
            assessments = db.query(AssessmentDefinition).all()
            for ass in assessments:
                # check if skill is in career
                req = db.query(CareerRequiredSkill).filter(
                    CareerRequiredSkill.career_id == ass.career_id,
                    CareerRequiredSkill.skill_id == sk_id
                ).first() if sk_id and ass.career_id else None

                if req or not ass.career_id:
                    q_entry = AssessmentQuestion(
                        assessment_id=ass.id,
                        skill_id=sk_id,
                        question_text=q_data["q"],
                        option_a=q_data["a"],
                        option_b=q_data["b"],
                        option_c=q_data["c"],
                        option_d=q_data["d"],
                        correct_option=q_data["correct"],
                        explanation=q_data["explanation"],
                        difficulty=q_data.get("difficulty", "medium")
                    )
                    db.add(q_entry)
            db.commit()

    # Update total_questions count on assessments
    for ass in db.query(AssessmentDefinition).all():
        ass.total_questions = len(ass.questions)
    db.commit()

    # 5. Resources
    for r_data in RESOURCES_SEED:
        sk = skill_map.get(r_data["skill"])
        sk_id = sk.id if sk else None
        existing_res = db.query(LearningResource).filter(
            LearningResource.title == r_data["title"]
        ).first()
        if not existing_res:
            db.add(LearningResource(
                title=r_data["title"],
                skill_id=sk_id,
                topic=r_data["topic"],
                resource_type=r_data["type"],
                url=r_data["url"],
                duration_minutes=r_data["duration"],
                difficulty=r_data["difficulty"],
                description=f"Recommended study resource covering {r_data['topic']} for skill progression."
            ))
    db.commit()

    # 6. Default Demo Student Account & Admin Account
    demo_user = db.query(User).filter(User.email == "demo@skillmap.ai").first()
    if not demo_user:
        demo_user = User(
            email="demo@skillmap.ai",
            hashed_password=get_password_hash("DemoUser@2026"),
            full_name="Alex Morgan",
            role="student",
            is_active=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # Profile
        sw_dev = career_map.get("Full Stack Developer")
        profile = StudentProfile(
            user_id=demo_user.id,
            college="Stanford University",
            degree="Bachelor of Science",
            branch="Computer Science",
            graduation_year=2026,
            bio="Aspiring Full Stack Engineer passionate about scalable web architecture and modern cloud systems.",
            target_career_id=sw_dev.id if sw_dev else None,
            learning_pace="moderate",
            weekly_learning_hours=12,
            preferred_learning_style="hands-on",
            onboarded=True
        )
        db.add(profile)
        db.commit()

    admin_user = db.query(User).filter(User.email == "admin@skillmap.ai").first()
    if not admin_user:
        admin_user = User(
            email="admin@skillmap.ai",
            hashed_password=get_password_hash("AdminMaster@2026"),
            full_name="Platform Administrator",
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        db.commit()

    # 7. Seed Courses, Lessons, and Linked Skills
    from app.services.courses_seed_data import COURSES_SEED
    for c_data in COURSES_SEED:
        existing_course = db.query(Course).filter(Course.slug == c_data["slug"]).first()
        if not existing_course:
            existing_course = Course(
                title=c_data["title"],
                slug=c_data["slug"],
                category=c_data["category"],
                difficulty=c_data["difficulty"],
                duration_hours=c_data["duration_hours"],
                estimated_weeks=c_data["estimated_weeks"],
                badge=c_data.get("badge", "Popular"),
                rating=c_data.get("rating", 4.8),
                is_featured=c_data.get("is_featured", False),
                instructor_name=c_data.get("instructor_name", "SkillMap AI Curriculum Team"),
                short_description=c_data["short_description"],
                description=c_data["description"],
                prerequisites_text=c_data.get("prerequisites_text", "None"),
                learning_outcomes=c_data.get("learning_outcomes", [])
            )
            db.add(existing_course)
            db.commit()
            db.refresh(existing_course)

        # Add Lessons
        for l_data in c_data.get("lessons", []):
            existing_lesson = db.query(Lesson).filter(
                Lesson.course_id == existing_course.id,
                Lesson.slug == l_data["slug"]
            ).first()
            if not existing_lesson:
                existing_lesson = Lesson(
                    course_id=existing_course.id,
                    title=l_data["title"],
                    slug=l_data["slug"],
                    lesson_order=l_data["lesson_order"],
                    duration_minutes=l_data["duration_minutes"],
                    content_body=l_data["content_body"],
                    content_type="markdown",
                    key_takeaways=l_data.get("key_takeaways", [])
                )
                db.add(existing_lesson)
        db.commit()

        # Connect CourseSkills
        for s_name in c_data.get("skills", []):
            sk = skill_map.get(s_name)
            if sk:
                existing_cs = db.query(CourseSkill).filter(
                    CourseSkill.course_id == existing_course.id,
                    CourseSkill.skill_id == sk.id
                ).first()
                if not existing_cs:
                    db.add(CourseSkill(course_id=existing_course.id, skill_id=sk.id))
        db.commit()

    # 8. Enroll Demo Student in Full Stack and DSA with sample progress
    if demo_user:
        full_stack_course = db.query(Course).filter(Course.slug == "full-stack-web-development").first()
        dsa_course = db.query(Course).filter(Course.slug == "data-structures-and-algorithms").first()
        now = datetime.now(timezone.utc)

        for course in [full_stack_course, dsa_course]:
            if course:
                enr = db.query(CourseEnrollment).filter(
                    CourseEnrollment.user_id == demo_user.id,
                    CourseEnrollment.course_id == course.id
                ).first()
                if not enr:
                    db.add(CourseEnrollment(
                        user_id=demo_user.id,
                        course_id=course.id,
                        enrolled_at=now,
                        last_accessed_at=now,
                        status="active"
                    ))
                    # Mark first 2 lessons completed in full stack course
                    if course == full_stack_course and course.lessons:
                        for l in course.lessons[:2]:
                            lp = db.query(LessonProgress).filter(
                                LessonProgress.user_id == demo_user.id,
                                LessonProgress.course_id == course.id,
                                LessonProgress.lesson_id == l.id
                            ).first()
                            if not lp:
                                db.add(LessonProgress(
                                    user_id=demo_user.id,
                                    course_id=course.id,
                                    lesson_id=l.id,
                                    completed=True,
                                    completed_at=now
                                ))
        db.commit()
