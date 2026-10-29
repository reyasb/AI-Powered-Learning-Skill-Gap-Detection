COURSES_SEED = [
    {
        "title": "Data Structures & Algorithms Masterclass",
        "slug": "data-structures-and-algorithms",
        "category": "DSA and Interview Preparation",
        "difficulty": "Intermediate",
        "duration_hours": 36,
        "estimated_weeks": 6,
        "badge": "Bestseller",
        "rating": 4.9,
        "is_featured": True,
        "instructor_name": "Dr. Sarah Chen, Ex-Google Staff Engineer",
        "short_description": "Master algorithmic problem solving, Big-O complexity analysis, dynamic programming, and graph theory for top-tier tech interviews.",
        "description": "This comprehensive course takes you from foundational computational complexity to advanced graph theory and dynamic programming. Specifically designed for software engineers targeting competitive technical interviews at tier-1 technology firms, each module combines rigorous mathematical analysis with clean implementation in multiple languages.",
        "prerequisites_text": "Familiarity with at least one programming language (Python, Java, C++, or JavaScript).",
        "learning_outcomes": [
            "Calculate asymptotic time and space complexity using Big-O, Big-Omega, and Master Theorem.",
            "Implement two-pointer and sliding-window techniques to solve array problems in O(N).",
            "Build and traverse advanced tree structures including BSTs, AVL trees, and Binary Heaps.",
            "Solve complex graph problems using BFS, DFS, Dijkstra's algorithm, and Topological Sort.",
            "Formulate dynamic programming state transitions for 1D and 2D subproblems."
        ],
        "skills": ["Data Structures & Algorithms"],
        "lessons": [
            {
                "title": "1. Asymptotic Complexity and Big-O Analysis",
                "slug": "asymptotic-complexity-and-big-o",
                "lesson_order": 1,
                "duration_minutes": 25,
                "content_body": """# Asymptotic Complexity and Big-O Analysis

### Why Algorithmic Complexity Matters
In production engineering, the difference between an $O(N)$ and an $O(N^2)$ algorithm can mean seconds versus hours of processing time on large datasets.

```python
# O(N) Linear Search vs O(log N) Binary Search
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

### Key Complexity Classes
- **$O(1)$ Constant Time**: Hash map lookup, array index access.
- **$O(\\log N)$ Logarithmic**: Binary search, balanced BST search.
- **$O(N)$ Linear**: Single pass through an array or linked list.
- **$O(N \\log N)$ Linearithmic**: Merge sort, heapsort, optimal comparison sorting.
- **$O(N^2)$ Quadratic**: Nested loops, bubble sort, brute-force pair comparisons.
- **$O(2^N)$ Exponential**: Naive recursive Fibonacci, subset generation.
""",
                "key_takeaways": [
                    "Big-O represents the upper bound of growth as input size approaches infinity.",
                    "Space complexity includes auxiliary memory allocated on the heap and recursion call stacks.",
                    "Always identify input constraints before choosing an algorithm."
                ]
            },
            {
                "title": "2. Two-Pointer and Sliding Window Patterns",
                "slug": "two-pointer-and-sliding-window",
                "lesson_order": 2,
                "duration_minutes": 30,
                "content_body": """# Two-Pointer and Sliding Window Patterns

The two-pointer technique optimizes brute-force $O(N^2)$ nested loops down to $O(N)$ by keeping two pointers traversing the data structure in a coordinated fashion.

```python
def max_sum_subarray(arr, k):
    \"\"\"Find maximum sum of any contiguous subarray of size k (Sliding Window)\"\"\"
    if len(arr) < k:
        return 0
    
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]  # Slide window: add right, drop left
        max_sum = max(max_sum, window_sum)
        
    return max_sum
```

### When to apply:
1. Contiguous subarray or substring problems.
2. Target sum search in sorted arrays.
3. String anagram or palindrome detection.
""",
                "key_takeaways": [
                    "Sliding window maintains a rolling state without recalculating from scratch.",
                    "Two pointers moving toward each other are optimal for sorted array target searching.",
                    "Reduces time complexity from quadratic to linear in array and string queries."
                ]
            },
            {
                "title": "3. Binary Search Trees & Priority Queues",
                "slug": "bst-and-priority-queues",
                "lesson_order": 3,
                "duration_minutes": 35,
                "content_body": """# Binary Search Trees and Priority Queues

Binary Search Trees (BST) maintain the invariant that for any node, all left subtree keys are smaller and all right subtree keys are larger.

```python
import heapq

# Priority Queue (Min-Heap) for top-K elements
def find_k_largest(nums, k):
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0] # The kth largest element
```

### Heap Operations:
- `heappush`: $O(\\log K)$
- `heappop`: $O(\\log K)$
- `peek`: $O(1)$
""",
                "key_takeaways": [
                    "A min-heap of size K efficiently solves streaming top-K problems in O(N log K).",
                    "Unbalanced BSTs can degrade to O(N) worst-case search unless self-balancing (AVL/Red-Black).",
                    "Heaps are complete binary trees compactly stored as continuous arrays."
                ]
            },
            {
                "title": "4. Graph Algorithms: BFS, DFS & Dijkstra",
                "slug": "graph-algorithms-bfs-dfs-dijkstra",
                "lesson_order": 4,
                "duration_minutes": 40,
                "content_body": """# Graph Algorithms: BFS, DFS, and Dijkstra

Graphs model networks, dependencies, maps, and social relationships.

```python
from collections import deque

def shortest_path_bfs(graph, start, target):
    \"\"\"Finds shortest path in unweighted graph using BFS\"\"\"
    queue = deque([(start, [start])])
    visited = {start}
    
    while queue:
        node, path = queue.popleft()
        if node == target:
            return path
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return None
```
""",
                "key_takeaways": [
                    "BFS finds shortest paths in unweighted graphs using a FIFO queue.",
                    "DFS is ideal for topological sorting, cycle detection, and connected components.",
                    "Dijkstra's algorithm uses a priority queue to find single-source shortest paths on non-negative weighted graphs in O((V + E) log V)."
                ]
            },
            {
                "title": "5. Dynamic Programming: Memoization to Tabulation",
                "slug": "dynamic-programming-memoization-tabulation",
                "lesson_order": 5,
                "duration_minutes": 45,
                "content_body": """# Dynamic Programming (DP)

DP solves complex problems by breaking them into overlapping subproblems and optimal substructures.

```python
def knapsack(weights, values, capacity):
    \"\"\"0/1 Knapsack using 2D Tabulation\"\"\"
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]
                
    return dp[n][capacity]
```
""",
                "key_takeaways": [
                    "Top-down memoization caches recursive calls; bottom-up tabulation fills iterative matrices.",
                    "Always define the DP state and recurrence relation before writing code.",
                    "Look for opportunities to optimize space from O(N*W) to O(W) when only the previous row is needed."
                ]
            }
        ]
    },
    {
        "title": "Python Programming Masterclass",
        "slug": "python-programming-masterclass",
        "category": "Programming Languages",
        "difficulty": "Beginner",
        "duration_hours": 28,
        "estimated_weeks": 4,
        "badge": "Popular",
        "rating": 4.9,
        "is_featured": True,
        "instructor_name": "Alex Rivera, Senior Python Architect",
        "short_description": "From modern Python syntax to OOP, generators, decorators, asynchronous concurrency, and clean production architectures.",
        "description": "Gain industrial proficiency in Python 3.12+. Learn idiomatic Pythonic programming, design patterns, metaclasses, async/await concurrency, and type hinting used by top software and machine learning engineering teams.",
        "prerequisites_text": "No prior programming experience required.",
        "learning_outcomes": [
            "Write idiomatic Python using list/dict comprehensions and pattern matching.",
            "Harness functional tools: closures, decorators, generators, and iterators.",
            "Design robust object-oriented software with encapsulation, polymorphism, and dunder methods.",
            "Build asynchronous I/O programs with asyncio and thread pools.",
            "Implement typed and linted Python code ready for enterprise CI/CD pipelines."
        ],
        "skills": ["Python"],
        "lessons": [
            {
                "title": "1. Modern Python Syntax & Data Structures",
                "slug": "modern-python-syntax-and-data-structures",
                "lesson_order": 1,
                "duration_minutes": 20,
                "content_body": """# Modern Python Syntax & Core Collections

Python provides native mutable and immutable sequences with high expressiveness.

```python
# Structural Pattern Matching (Python 3.10+)
def process_command(cmd):
    match cmd:
        case {"action": "send", "payload": msg}:
            return f"Transmitting: {msg}"
        case {"action": "shutdown"}:
            return "Halting system"
        case _:
            raise ValueError("Unknown command schema")
```
""",
                "key_takeaways": [
                    "Lists and dictionaries are mutable; tuples, strings, and frozensets are immutable.",
                    "Use dictionary comprehensions for concise and fast associative mapping.",
                    "Structural pattern matching provides expressive destructuring of complex JSON payloads."
                ]
            },
            {
                "title": "2. Generators, Iterators & Custom Decorators",
                "slug": "generators-iterators-decorators",
                "lesson_order": 2,
                "duration_minutes": 30,
                "content_body": """# Generators, Iterators, and Decorators

Generators allow lazy evaluation of infinite streams without loading entire datasets into memory.

```python
import time
from functools import wraps

def time_execution(func):
    \"\"\"Decorator that benchmarks execution time\"\"\"
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"[{func.__name__}] took {duration:.4f}s")
        return result
    return wrapper

@time_execution
def fibonacci_stream(limit):
    a, b = 0, 1
    for _ in range(limit):
        yield a
        a, b = b, a + b
```
""",
                "key_takeaways": [
                    "The `yield` keyword pauses execution, emitting values one at a time with O(1) memory overhead.",
                    "Decorators wrap functions to dynamically augment logging, caching, and authentication.",
                    "Always use `functools.wraps` to preserve function docstrings and introspectable signatures."
                ]
            },
            {
                "title": "3. Object-Oriented Architecture & Dunder Methods",
                "slug": "oop-dunder-methods",
                "lesson_order": 3,
                "duration_minutes": 35,
                "content_body": """# Object-Oriented Architecture & Magic Methods

Python classes leverage magic (dunder) methods for operator overloading and container protocol implementation.

```python
class Vector2D:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
        
    def __add__(self, other: "Vector2D") -> "Vector2D":
        return Vector2D(self.x + other.x, self.y + other.y)
        
    def __repr__(self) -> str:
        return f"Vector2D(x={self.x}, y={self.y})"
        
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector2D):
            return False
        return self.x == other.x and self.y == other.y
```
""",
                "key_takeaways": [
                    "Dunder methods allow custom classes to integrate seamlessly with Python's built-in operators.",
                    "Use properties (`@property`) for controlled getter and setter encapsulation.",
                    "Differentiate `__str__` (user-facing) from `__repr__` (unambiguous developer representation)."
                ]
            },
            {
                "title": "4. Asynchronous Concurrency with Asyncio",
                "slug": "asyncio-concurrency",
                "lesson_order": 4,
                "duration_minutes": 35,
                "content_body": """# Asynchronous Concurrency with Asyncio

Asynchronous programming uses an event loop on a single thread to multiplex thousands of non-blocking I/O tasks.

```python
import asyncio
import httpx

async def fetch_status(client, url):
    resp = await client.get(url)
    return url, resp.status_code

async def main():
    urls = ["https://httpbin.org/delay/1" for _ in range(5)]
    async with httpx.AsyncClient() as client:
        tasks = [fetch_status(client, u) for u in urls]
        results = await asyncio.gather(*tasks)
        print("Gathered async responses:", results)

# asyncio.run(main())
```
""",
                "key_takeaways": [
                    "Asyncio is ideal for I/O-bound workloads like microservices, database queries, and web scraping.",
                    "Never execute blocking CPU-heavy calculations inside an async coroutine without running in an executor.",
                    "Async context managers (`async with`) guarantee connection cleanup and resource release."
                ]
            }
        ]
    },
    {
        "title": "Full Stack Web Development with React & Node",
        "slug": "full-stack-web-development",
        "category": "Web Development",
        "difficulty": "Intermediate",
        "duration_hours": 42,
        "estimated_weeks": 8,
        "badge": "Hot",
        "rating": 4.9,
        "is_featured": True,
        "instructor_name": "Marcus Vance, Principal Full Stack Engineer",
        "short_description": "Build scalable, reactive web apps from scratch using modern React 19, TypeScript, Node.js, Express, and PostgreSQL.",
        "description": "Gain complete mastery over both client and server software engineering. You will build high-performance single page applications with React, design RESTful and GraphQL backend microservices, write relational database migrations, and deploy production containerized architectures.",
        "prerequisites_text": "Basic understanding of HTML, CSS, and basic JavaScript.",
        "learning_outcomes": [
            "Architect responsive client applications with React components, custom hooks, and state management.",
            "Construct enterprise-grade REST APIs in Node.js and Express with validation and middleware.",
            "Design normalized relational database schemas in PostgreSQL with indexes and transactions.",
            "Implement secure JWT authentication, CSRF defenses, and password hashing.",
            "Deploy full stack applications on cloud servers with Nginx reverse proxies and Docker."
        ],
        "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"],
        "lessons": [
            {
                "title": "1. Modern TypeScript & ES6+ Foundations",
                "slug": "typescript-es6-foundations",
                "lesson_order": 1,
                "duration_minutes": 25,
                "content_body": """# Modern TypeScript & Strict Typing

TypeScript adds static typing to JavaScript, catching bugs at compile time before production runtime.

```typescript
interface UserProfile {
  id: number;
  email: string;
  role: 'student' | 'admin';
  isActive: boolean;
}

function formatUserGreeting(user: UserProfile): string {
  return `Welcome, ${user.email} (${user.role.toUpperCase()})`;
}
```
""",
                "key_takeaways": [
                    "Static typing eliminates runtime null-pointer and property-undefined crashes.",
                    "Use discriminated unions to represent mutually exclusive UI and state configurations.",
                    "Maintain strict null checks and avoid `any` in production codebases."
                ]
            },
            {
                "title": "2. React 19 Components, State & Custom Hooks",
                "slug": "react-components-state-custom-hooks",
                "lesson_order": 2,
                "duration_minutes": 35,
                "content_body": """# React Component Architecture & Custom Hooks

Components encapsulate markup, styling, and reactive state.

```tsx
import React, { useState, useEffect } from 'react';

export function useFetchData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then(res => res.json())
      .then(d => { if (!cancelled) setData(d); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading };
}
```
""",
                "key_takeaways": [
                    "Custom hooks encapsulate reusable stateful business logic across components.",
                    "Always clean up asynchronous subscriptions and timeouts in useEffect return functions.",
                    "Keep component state minimal, deriving computed values during render."
                ]
            },
            {
                "title": "3. REST API Design & Express Middleware",
                "slug": "rest-api-design-express-middleware",
                "lesson_order": 3,
                "duration_minutes": 35,
                "content_body": """# REST API Architecture & Express Middleware

A robust backend decouples routing, controller logic, data access, and centralized error handling.

```javascript
const express = require('express');
const app = express();

// Authorization Middleware
function verifyAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization token' });
  }
  // Validate token payload...
  req.userId = 42;
  next();
}

app.get('/api/profile', verifyAuth, (req, res) => {
  res.json({ userId: req.userId, status: 'Authorized' });
});
```
""",
                "key_takeaways": [
                    "Middleware chains handle cross-cutting concerns like logging, authentication, and CORS.",
                    "Use HTTP status codes accurately (200, 201, 400, 401, 403, 404, 500).",
                    "Sanitize and validate all incoming request bodies using schemas (e.g. Zod, Joi)."
                ]
            },
            {
                "title": "4. Relational Database Modeling with PostgreSQL",
                "slug": "relational-database-modeling-postgresql",
                "lesson_order": 4,
                "duration_minutes": 40,
                "content_body": """# Relational Schema Design & Transactions

Normalized relational databases guarantee ACID properties across multi-table mutations.

```sql
BEGIN;

-- Deduct balance
UPDATE accounts 
SET balance = balance - 100.00 
WHERE id = 1 AND balance >= 100.00;

-- Credit receiver
UPDATE accounts 
SET balance = balance + 100.00 
WHERE id = 2;

-- Record ledger entry
INSERT INTO transactions (from_id, to_id, amount, created_at)
VALUES (1, 2, 100.00, NOW());

COMMIT;
```
""",
                "key_takeaways": [
                    "ACID transactions guarantee that all updates succeed or fail atomically.",
                    "Indexes dramatically accelerate read queries but introduce write overhead.",
                    "Apply foreign key constraints with ON DELETE CASCADE or SET NULL appropriately."
                ]
            }
        ]
    },
    {
        "title": "Artificial Intelligence & Machine Learning",
        "slug": "ai-and-machine-learning",
        "category": "AI and Machine Learning",
        "difficulty": "Intermediate",
        "duration_hours": 38,
        "estimated_weeks": 7,
        "badge": "Comprehensive",
        "rating": 4.9,
        "is_featured": True,
        "instructor_name": "Dr. Elena Rostova, AI Research Director",
        "short_description": "Foundational and modern AI engineering: regression, classification, deep learning, PyTorch neural networks, and model evaluation.",
        "description": "Step into the vanguard of modern computing. This course provides mathematical rigor and hands-on coding for predictive modeling, computer vision, deep neural networks, and tensor computation pipelines.",
        "prerequisites_text": "Basic Python and college-level linear algebra/calculus concepts.",
        "learning_outcomes": [
            "Implement classical algorithms: linear regression, logistic classification, and decision trees.",
            "Understand loss surfaces, gradient descent optimization, and learning rate scheduling.",
            "Build, train, and validate deep neural networks using PyTorch modules.",
            "Evaluate models using ROC-AUC, F1-scores, precision-recall curves, and confusion matrices.",
            "Prevent overfitting using L1/L2 regularization, dropout layers, and early stopping."
        ],
        "skills": ["Machine Learning", "Deep Learning", "PyTorch", "Scikit-Learn"],
        "lessons": [
            {
                "title": "1. Mathematical Foundations of Machine Learning",
                "slug": "mathematical-foundations-ml",
                "lesson_order": 1,
                "duration_minutes": 30,
                "content_body": """# Mathematical Foundations: Gradient Descent & Loss

Machine learning formulates pattern recognition as an optimization problem minimizing empirical risk.

$$\\theta_{t+1} = \\theta_t - \\eta \\nabla L(\\theta_t)$$

Where $\\eta$ is the learning rate and $\\nabla L$ is the gradient vector of the loss function.
""",
                "key_takeaways": [
                    "Gradient descent iteratively updates parameters in the direction of steepest loss descent.",
                    "Learning rate tuning is critical: too large causes divergence, too small causes slow convergence.",
                    "Convex optimization guarantees a global minimum, whereas deep networks optimize non-convex surfaces."
                ]
            },
            {
                "title": "2. Supervised Learning & Scikit-Learn Pipelines",
                "slug": "supervised-learning-scikit-learn",
                "lesson_order": 2,
                "duration_minutes": 35,
                "content_body": """# Supervised Learning Pipelines

Pipelines prevent data leakage between training and testing folds during cross-validation.

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Fit on training data only
# pipeline.fit(X_train, y_train)
```
""",
                "key_takeaways": [
                    "Data preprocessing steps must be fitted solely on training splits to prevent data leakage.",
                    "Random Forests aggregate uncorrelated decision trees to reduce prediction variance.",
                    "Evaluate with stratified K-fold cross validation for balanced class representations."
                ]
            },
            {
                "title": "3. Deep Neural Networks with PyTorch",
                "slug": "deep-neural-networks-pytorch",
                "lesson_order": 3,
                "duration_minutes": 45,
                "content_body": """# Deep Neural Networks with PyTorch

PyTorch provides dynamic computation graphs and automatic differentiation.

```python
import torch
import torch.nn as nn

class MultilayerPerceptron(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, output_dim)
        )
        
    def forward(self, x):
        return self.network(x)
```
""",
                "key_takeaways": [
                    "Tensors are multi-dimensional arrays with hardware acceleration on GPUs/TPUs.",
                    "Autograd automatically traces forward passes to compute backpropagation gradients.",
                    "Dropout randomly zeros activations during training to regularize deep networks."
                ]
            }
        ]
    },
    {
        "title": "Java Enterprise & Spring Boot Microservices",
        "slug": "java-development-spring-boot",
        "category": "Programming Languages",
        "difficulty": "Intermediate",
        "duration_hours": 34,
        "estimated_weeks": 6,
        "badge": "Enterprise",
        "rating": 4.8,
        "is_featured": False,
        "instructor_name": "Karthik Subramanian, Principal Architect",
        "short_description": "Build high-throughput, fault-tolerant enterprise backend microservices with Java 21, Spring Boot 3, JPA, and Kafka.",
        "description": "Learn the industry-standard enterprise backbone. Covers memory management, concurrency, thread pools, Spring IoC, Spring Data JPA, REST microservices, and reactive programming.",
        "prerequisites_text": "Basic object-oriented programming concepts.",
        "learning_outcomes": [
            "Master JVM memory architecture, garbage collection, and heap tuning.",
            "Write thread-safe concurrent code using ExecutorService and ConcurrentHashMap.",
            "Build RESTful microservices with Spring Boot, Spring Security, and validation.",
            "Persist data with Spring Data JPA, Hibernate caching, and transaction isolation."
        ],
        "skills": ["Java", "Spring Boot", "SQL"],
        "lessons": [
            {
                "title": "1. JVM Architecture & Garbage Collection",
                "slug": "jvm-architecture-gc",
                "lesson_order": 1,
                "duration_minutes": 25,
                "content_body": "# JVM Architecture\n\nUnderstand Heap, Stack, Metaspace, and generational garbage collection (G1, ZGC).",
                "key_takeaways": ["Objects are allocated on the Heap; primitive references live on the Thread Stack.", "Garbage collection tracks unreferenced objects using root-reachability analysis."]
            },
            {
                "title": "2. Spring Boot IoC & REST Controllers",
                "slug": "spring-boot-ioc-rest",
                "lesson_order": 2,
                "duration_minutes": 35,
                "content_body": "# Spring Boot Dependency Injection\n\nDecouple service lifecycles with `@Autowired`, `@Service`, and `@RestController`.",
                "key_takeaways": ["Inversion of Control delegates object instantiation to the Spring ApplicationContext.", "Use constructor injection for immutable and easily testable components."]
            }
        ]
    },
    {
        "title": "Data Science & Analytical Intelligence",
        "slug": "data-science-and-analytics",
        "category": "Data Science",
        "difficulty": "Beginner",
        "duration_hours": 30,
        "estimated_weeks": 5,
        "badge": "Popular",
        "rating": 4.8,
        "is_featured": False,
        "instructor_name": "Priya Nair, Lead Data Scientist",
        "short_description": "Transform messy raw data into actionable decision intelligence using Python, Pandas, statistical hypothesis testing, and Tableau.",
        "description": "Complete data analytics bootcamp covering exploratory data analysis, statistical tests, time-series forecasting, SQL window queries, and executive data visualization.",
        "prerequisites_text": "Basic mathematics and introductory computer literacy.",
        "learning_outcomes": [
            "Perform advanced data manipulation and pivot transformations with Pandas.",
            "Conduct statistical significance tests (t-test, ANOVA, chi-square).",
            "Write complex SQL queries with analytical window functions and CTEs.",
            "Design clear visual dashboards for technical and business stakeholders."
        ],
        "skills": ["Data Analysis", "Data Visualization", "Pandas", "SQL"],
        "lessons": [
            {
                "title": "1. Advanced Pandas Wrangling & Aggregation",
                "slug": "pandas-wrangling-aggregation",
                "lesson_order": 1,
                "duration_minutes": 30,
                "content_body": "# Pandas Wrangling\n\nHandling missing values, grouping, pivot tables, and time-series resampling.",
                "key_takeaways": ["Vectorized Pandas operations are 100x faster than iterating with Python for-loops.", "Use `.groupby().agg()` for multi-dimensional statistical summaries."]
            }
        ]
    },
    {
        "title": "Cybersecurity & Ethical Penetration Testing",
        "slug": "cybersecurity-ethical-hacking",
        "category": "Cybersecurity",
        "difficulty": "Intermediate",
        "duration_hours": 32,
        "estimated_weeks": 6,
        "badge": "Hot",
        "rating": 4.9,
        "is_featured": True,
        "instructor_name": "Damon Cross, Offensive Security Consultant",
        "short_description": "Defend enterprise networks, audit OWASP top vulnerabilities, analyze packets, and master ethical penetration testing.",
        "description": "Learn both defensive and offensive security principles. Covers threat modeling, network security, packet analysis with Wireshark, application vulnerability discovery, and cryptography.",
        "prerequisites_text": "Basic networking and operating system concepts.",
        "learning_outcomes": [
            "Identify and patch OWASP Top 10 web application vulnerabilities (SQLi, XSS, CSRF).",
            "Analyze network traffic, protocols, and handshake packets with Wireshark.",
            "Implement symmetric and asymmetric cryptographic encryption (AES, RSA, ECC).",
            "Perform vulnerability scans and write comprehensive security audit reports."
        ],
        "skills": ["Cybersecurity", "Network Security", "Penetration Testing", "Cryptography"],
        "lessons": [
            {
                "title": "1. Defense in Depth & Threat Modeling",
                "slug": "defense-in-depth-threat-modeling",
                "lesson_order": 1,
                "duration_minutes": 25,
                "content_body": "# Defense in Depth\n\nSecurity is a layered architecture: physical, network, host, application, and data layers.",
                "key_takeaways": ["Never rely on a single defensive control; implement redundancy across layers.", "Least privilege principles prevent lateral attacker movement upon initial breach."]
            }
        ]
    },
    {
        "title": "Cloud Computing, Docker & Kubernetes DevOps",
        "slug": "cloud-computing-and-devops",
        "category": "Cloud and DevOps",
        "difficulty": "Intermediate",
        "duration_hours": 36,
        "estimated_weeks": 6,
        "badge": "Bestseller",
        "rating": 4.9,
        "is_featured": True,
        "instructor_name": "Siddharth Rao, Cloud Architect",
        "short_description": "Deploy immutable, auto-scaling containerized cloud infrastructure with AWS, Docker, Kubernetes, and CI/CD automation.",
        "description": "Master the modern DevOps pipeline. From containerizing apps with multi-stage Docker builds to deploying fault-tolerant Kubernetes clusters with automated GitHub Actions CI/CD pipelines.",
        "prerequisites_text": "Familiarity with Linux terminal commands and basic web development.",
        "learning_outcomes": [
            "Design highly available AWS architectures using VPC, Subnets, EC2, S3, and ALB.",
            "Build secure, minimal Docker container images using multi-stage builds.",
            "Orchestrate microservices with Kubernetes Deployments, Services, and Ingress.",
            "Construct automated CI/CD deployment pipelines with zero-downtime rollouts."
        ],
        "skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"],
        "lessons": [
            {
                "title": "1. Containerization Principles with Docker",
                "slug": "containerization-principles-docker",
                "lesson_order": 1,
                "duration_minutes": 30,
                "content_body": "# Containerization with Docker\n\nContainers isolate software dependencies from underlying host operating systems using Linux namespaces and cgroups.",
                "key_takeaways": ["Docker images are immutable layered templates; containers are running instances.", "Use multi-stage builds to produce tiny, secure production runtime artifacts."]
            }
        ]
    },
    {
        "title": "Database Management Systems & Advanced SQL",
        "slug": "database-management-systems-sql",
        "category": "Databases",
        "difficulty": "Beginner",
        "duration_hours": 24,
        "estimated_weeks": 4,
        "badge": "Core",
        "rating": 4.8,
        "is_featured": False,
        "instructor_name": "Vikram Seth, Database Architect",
        "short_description": "Relational schema design, normalization, B-Tree indexing, query optimization, ACID transactions, and NoSQL paradigms.",
        "description": "The definitive database engineering course. Master entity-relationship modeling, normal forms up to BCNF, execution plans with EXPLAIN ANALYZE, indexing strategies, and transaction isolation levels.",
        "prerequisites_text": "None.",
        "learning_outcomes": [
            "Design normalized relational databases that eliminate insertion and deletion anomalies.",
            "Write advanced queries using window functions, CTEs, and recursive queries.",
            "Optimize query latency using B-Tree and GIN indexes.",
            "Manage concurrent transaction isolation levels and prevent deadlocks."
        ],
        "skills": ["SQL", "PostgreSQL"],
        "lessons": [
            {
                "title": "1. Relational Schema Design & Normalization",
                "slug": "schema-design-normalization",
                "lesson_order": 1,
                "duration_minutes": 25,
                "content_body": "# Database Normalization\n\n1NF, 2NF, 3NF, and BCNF systematically eliminate data redundancy and anomalies.",
                "key_takeaways": ["First Normal Form requires atomic attributes.", "Third Normal Form ensures every non-key column depends solely on the primary key."]
            }
        ]
    },
    {
        "title": "Generative AI & RAG Architecture",
        "slug": "generative-ai-and-rag",
        "category": "AI and Machine Learning",
        "difficulty": "Advanced",
        "duration_hours": 26,
        "estimated_weeks": 4,
        "badge": "Cutting Edge",
        "rating": 5.0,
        "is_featured": True,
        "instructor_name": "Dr. Sarah Chen, Ex-Google Staff Engineer",
        "short_description": "Build production LLM applications: vector embeddings, semantic retrieval, RAG pipelines, fine-tuning, and AI guardrails.",
        "description": "Learn how to build, optimize, and deploy production-grade Retrieval-Augmented Generation (RAG) applications. Understand vector databases, cosine semantic similarity, chunking heuristics, hallucination mitigation, and LLM evaluation.",
        "prerequisites_text": "Proficiency in Python and basic machine learning concepts.",
        "learning_outcomes": [
            "Understand Transformer self-attention mechanisms and generative language modeling.",
            "Implement high-performance semantic search using dense vector embeddings.",
            "Construct robust RAG architectures with sliding window text chunking and citation metadata.",
            "Mitigate prompt injection and hallucinations with strict system guardrails."
        ],
        "skills": ["Machine Learning", "Natural Language Processing", "Python"],
        "lessons": [
            {
                "title": "1. Dense Embeddings & Vector Search",
                "slug": "embeddings-vector-search",
                "lesson_order": 1,
                "duration_minutes": 30,
                "content_body": "# Vector Embeddings & Similarity\n\nDense vector embeddings map unstructured text into continuous semantic latent spaces.",
                "key_takeaways": ["Cosine similarity measures the orientation angle between two embedding vectors.", "Vector databases index embeddings for approximate nearest neighbor (ANN) retrieval."]
            }
        ]
    },
    {
        "title": "Computer Networks & Distributed Communication",
        "slug": "computer-networks-fundamentals",
        "category": "Computer Science Fundamentals",
        "difficulty": "Beginner",
        "duration_hours": 22,
        "estimated_weeks": 4,
        "badge": "Core",
        "rating": 4.7,
        "is_featured": False,
        "instructor_name": "Prof. Alan Miller, Networking Specialist",
        "short_description": "OSI & TCP/IP stack, routing protocols, TCP flow control, HTTP/3, WebSockets, DNS, and secure network architecture.",
        "description": "Demystify how data packets traverse the globe. Master the OSI and TCP/IP models, subnetting, TCP handshake and congestion windows, modern HTTP protocols, and TLS encryption.",
        "prerequisites_text": "None.",
        "learning_outcomes": [
            "Explain layer responsibilities in the OSI and TCP/IP network protocol stacks.",
            "Analyze packet captures of TCP handshakes, window updates, and retransmissions.",
            "Calculate IPv4 subnets, netmasks, and CIDR prefix ranges.",
            "Understand HTTPS TLS handshakes, certificate authorities, and public key exchanges."
        ],
        "skills": ["Network Security", "Linux"],
        "lessons": [
            {
                "title": "1. OSI vs TCP/IP Models & Packet Encapsulation",
                "slug": "osi-tcp-ip-models",
                "lesson_order": 1,
                "duration_minutes": 25,
                "content_body": "# Network Protocol Architecture\n\nHow data flows down from Application to Physical layer with headers appended at each step.",
                "key_takeaways": ["Encapsulation wraps payloads in headers at each layer (Frame -> Packet -> Segment -> Data).", "IP routes packets between networks; TCP ensures reliable stream delivery."]
            }
        ]
    },
    {
        "title": "Operating Systems & Concurrency Architecture",
        "slug": "operating-systems-and-architecture",
        "category": "Computer Science Fundamentals",
        "difficulty": "Intermediate",
        "duration_hours": 24,
        "estimated_weeks": 4,
        "badge": "Core",
        "rating": 4.8,
        "is_featured": False,
        "instructor_name": "Vikram Seth, Systems Architect",
        "short_description": "Process scheduling, thread synchronization, deadlocks, virtual memory, paging, and Linux kernel internals.",
        "description": "Understand what happens beneath your application code. Learn how operating systems manage hardware resources, schedule processes, handle context switches, enforce memory protection, and resolve concurrency race conditions.",
        "prerequisites_text": "Basic C, C++, or systems programming knowledge.",
        "learning_outcomes": [
            "Analyze CPU scheduling algorithms: Round-Robin, Priority, and Multi-level Feedback Queues.",
            "Prevent race conditions and deadlocks using mutexes, semaphores, and condition variables.",
            "Explain virtual memory translation, page tables, TLBs, and page replacement policies.",
            "Understand Linux kernel system calls, process fork/exec semantics, and signals."
        ],
        "skills": ["Linux", "System Design"],
        "lessons": [
            {
                "title": "1. Processes, Threads & CPU Scheduling",
                "slug": "processes-threads-scheduling",
                "lesson_order": 1,
                "duration_minutes": 30,
                "content_body": "# Processes and Threads\n\nA process is an executing program with isolated virtual memory. Threads share process memory but retain independent registers and stacks.",
                "key_takeaways": ["Context switches save and restore CPU registers and program counters.", "Multi-threading accelerates I/O and parallel computation on multi-core processors."]
            }
        ]
    }
]
