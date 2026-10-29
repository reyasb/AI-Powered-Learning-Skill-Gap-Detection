import re
import math
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[Dict[str, Any]]:
    """Divides text into meaningful sliding window chunks with clean sentence boundaries."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = []
    current_len = 0
    page_est = 1

    for s in sentences:
        s_clean = s.strip()
        if not s_clean:
            continue
        s_len = len(s_clean)
        if current_len + s_len > chunk_size and current_chunk:
            chunk_str = " ".join(current_chunk)
            chunks.append({
                "content": chunk_str,
                "page_number": page_est,
                "keywords": list(set(re.findall(r'\b[a-zA-Z]{4,}\b', chunk_str.lower())))[:15]
            })
            # keep overlap
            current_chunk = current_chunk[-1:] if overlap > 0 else []
            current_len = sum(len(x) for x in current_chunk)
            if len(chunks) % 4 == 0:
                page_est += 1

        current_chunk.append(s_clean)
        current_len += s_len

    if current_chunk:
        chunk_str = " ".join(current_chunk)
        chunks.append({
            "content": chunk_str,
            "page_number": page_est,
            "keywords": list(set(re.findall(r'\b[a-zA-Z]{4,}\b', chunk_str.lower())))[:15]
        })

    return chunks

class RAGService:
    @staticmethod
    def retrieve_relevant_chunks(query: str, chunks: List[Any], top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Calculates term-frequency and keyword relevance score between query and chunks.
        Deterministic BM25-style keyword matching.
        """
        query_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', query.lower()))
        scored = []

        for chunk in chunks:
            chunk_content = chunk.content.lower()
            score = 0.0
            for word in query_words:
                count = chunk_content.count(word)
                if count > 0:
                    score += 1.0 + math.log(1.0 + count)

            if score > 0:
                scored.append((score, chunk))

        # Sort descending by relevance score
        scored.sort(key=lambda x: x[0], reverse=True)
        top_chunks = scored[:top_k]

        results = []
        for s, c in top_chunks:
            results.append({
                "chunk_id": c.id,
                "document_id": c.document_id,
                "page_number": c.page_number,
                "content": c.content,
                "score": round(s, 2)
            })

        return results

    @staticmethod
    async def generate_grounded_answer(query: str, retrieved_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generates grounded response:
        1. If settings.LLM_API_KEY is configured, sends grounded prompt to LLM.
        2. Otherwise, synthesizes grounded answer directly from matching excerpts with citations.
        """
        # If no document chunks matched or user has no documents uploaded
        if not retrieved_chunks:
            # If LLM API Key is configured, answer as general technical AI assistant
            if settings.LLM_API_KEY and len(settings.LLM_API_KEY.strip()) > 5:
                try:
                    system_prompt = (
                        "You are an expert AI Technical Tutor in SkillMap AI. "
                        "Explain concepts clearly, write runnable and well-formatted code blocks, "
                        "break down complex engineering topics step-by-step, and help students close their skill gaps."
                    )
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        resp = await client.post(
                            "https://api.openai.com/v1/chat/completions",
                            headers={
                                "Authorization": f"Bearer {settings.LLM_API_KEY}",
                                "Content-Type": "application/json"
                            },
                            json={
                                "model": settings.LLM_MODEL,
                                "messages": [
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": query}
                                ],
                                "temperature": 0.4
                            }
                        )
                        if resp.status_code == 200:
                            llm_out = resp.json()["choices"][0]["message"]["content"]
                            return {
                                "answer": llm_out,
                                "sources": []
                            }
                except Exception:
                    pass

            # Built-in technical tutor knowledge response for core concepts
            q_lower = query.lower()

            if "binary search" in q_lower:
                answer = (
                    "### Binary Search Algorithm\n\n"
                    "**Binary Search** is an efficient divide-and-conquer algorithm for finding an element in a **sorted array**. "
                    "Instead of checking every item sequentially ($O(n)$ linear search), it repeatedly divides the search interval in half.\n\n"
                    "#### Time & Space Complexity\n"
                    "- **Best Case:** $O(1)$ (element is at the middle)\n"
                    "- **Average & Worst Case:** $O(\\log n)$\n"
                    "- **Space Complexity:** $O(1)$ iterative, $O(\\log n)$ recursive\n\n"
                    "```python\ndef binary_search(arr: list[int], target: int) -> int:\n"
                    "    left, right = 0, len(arr) - 1\n"
                    "    while left <= right:\n"
                    "        mid = (left + right) // 2\n"
                    "        if arr[mid] == target:\n"
                    "            return mid  # Found at index\n"
                    "        elif arr[mid] < target:\n"
                    "            left = mid + 1\n"
                    "        else:\n"
                    "            right = mid - 1\n"
                    "    return -1  # Not found\n```\n\n"
                    "**Key Takeaway:** The array must always be sorted prior to binary search."
                )
            elif "supervised" in q_lower or "unsupervised" in q_lower:
                answer = (
                    "### Supervised vs. Unsupervised Machine Learning\n\n"
                    "| Feature | Supervised Learning | Unsupervised Learning |\n"
                    "| :--- | :--- | :--- |\n"
                    "| **Data Type** | Labeled dataset $(X, y)$ | Unlabeled raw data $(X)$ |\n"
                    "| **Objective** | Predict target label or continuous value | Discover inherent patterns or clusters |\n"
                    "| **Feedback** | Direct error feedback via loss function | No ground truth labels |\n"
                    "| **Core Tasks** | Classification, Regression | Clustering, Dimensionality Reduction |\n"
                    "| **Common Algorithms** | Linear Regression, Random Forest, SVM, Neural Nets | K-Means, PCA, DBSCAN, Autoencoders |\n\n"
                    "#### Example Use Cases\n"
                    "- **Supervised:** Spam email detection (Spam / Not Spam), House price forecasting.\n"
                    "- **Unsupervised:** Customer market segmentation, Anomaly/fraud pattern detection without pre-labeled fraud."
                )
            elif "hook" in q_lower or "react" in q_lower:
                answer = (
                    "### Essential React Hooks Guide\n\n"
                    "React Hooks allow functional components to maintain state and lifecycle behaviors without classes.\n\n"
                    "#### 1. `useState` — Local Component State\n"
                    "```tsx\nimport React, { useState } from 'react';\n\n"
                    "export const Counter = () => {\n"
                    "  const [count, setCount] = useState(0);\n"
                    "  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n"
                    "};\n```\n\n"
                    "#### 2. `useEffect` — Side Effects & Lifecycle\n"
                    "```tsx\nimport React, { useEffect, useState } from 'react';\n\n"
                    "export const UserProfile = ({ userId }) => {\n"
                    "  useEffect(() => {\n"
                    "    // Fetch data when component mounts or userId changes\n"
                    "    const controller = new AbortController();\n"
                    "    fetch(`/api/users/${userId}`, { signal: controller.signal });\n"
                    "    return () => controller.abort(); // Cleanup on unmount\n"
                    "  }, [userId]);\n"
                    "};\n```\n\n"
                    "#### 3. `useCallback` & `useMemo` — Performance Optimization\n"
                    "- `useMemo` caches the **computed value** of an expensive calculation.\n"
                    "- `useCallback` caches the **function instance** between renders."
                )
            elif "study plan" in q_lower or "full-stack" in q_lower or "roadmap" in q_lower:
                answer = (
                    "### 12-Week Full Stack Engineer Study Plan\n\n"
                    "1. **Weeks 1–3: Core Web Architecture & React**\n"
                    "   - TypeScript fundamentals, component composition, hooks, state management.\n"
                    "   - REST APIs integration, responsive Tailwind CSS styling.\n"
                    "2. **Weeks 4–6: Backend Development & Databases**\n"
                    "   - Python FastAPI / Node.js Express, request routing, async handlers.\n"
                    "   - PostgreSQL relational design, foreign keys, indexes, SQLAlchemy ORM.\n"
                    "3. **Weeks 7–9: Authentication & Security**\n"
                    "   - JWT token lifecycle, bcrypt password hashing, CORS, input sanitization.\n"
                    "4. **Weeks 10–12: DevOps, Testing & Capstone**\n"
                    "   - Docker containerization, GitHub Actions CI/CD pipelines, unit & integration tests.\n\n"
                    "💡 *You can generate your custom automated roadmap directly under the **Learning Roadmap** tab.*"
                )
            elif "python" in q_lower and "practice" in q_lower:
                answer = (
                    "### Python Technical Practice Questions\n\n"
                    "1. **Generators & Memory Efficiency:**\n"
                    "   *Question:* What is the difference between a list comprehension and a generator expression?\n"
                    "   *Answer:* A list comprehension creates the entire list in memory immediately: `[x*2 for x in range(1000000)]`. "
                    "A generator expression evaluates lazily using `yield`: `(x*2 for x in range(1000000))`, consuming $O(1)$ memory.\n\n"
                    "2. **Decorators:**\n"
                    "   *Question:* How do you write a function timer decorator in Python?\n"
                    "   ```python\nimport time\nfrom functools import wraps\n\n"
                    "def time_it(func):\n"
                    "    @wraps(func)\n"
                    "    def wrapper(*args, **kwargs):\n"
                    "        start = time.perf_counter()\n"
                    "        res = func(*args, **kwargs)\n"
                    "        print(f'{func.__name__} took {time.perf_counter() - start:.4f}s')\n"
                    "        return res\n"
                    "    return wrapper\n```\n\n"
                    "3. **GIL (Global Interpreter Lock):**\n"
                    "   *Question:* How do you bypass the GIL for CPU-bound tasks?\n"
                    "   *Answer:* Use the `multiprocessing` module or native C extensions instead of `threading`."
                )
            else:
                answer = (
                    f"### SkillMap AI Technical Tutor\n\n"
                    f"I am ready to assist you with: **\"{query}\"**.\n\n"
                    f"#### How to get the most from the AI Assistant:\n"
                    f"1. **Grounded Document Tutoring:** Upload your course PDF or lecture notes in the **Learning Library** to get cited answers grounded in your specific materials.\n"
                    f"2. **Specific Questions:** Ask about specific algorithms, design patterns, database architectures, or coding errors.\n"
                    f"3. **Live Generative AI:** To enable open-ended generative responses for any topic, configure your `LLM_API_KEY` (e.g. OpenAI or Gemini) in the `backend/.env` configuration file."
                )

            return {
                "answer": answer,
                "sources": []
            }

        context_blocks = []
        sources = []
        for i, c in enumerate(retrieved_chunks):
            context_blocks.append(f"Source [{i+1}] (Page {c['page_number']}):\n{c['content']}")
            sources.append({
                "source_index": i + 1,
                "page_number": c["page_number"],
                "snippet": c["content"][:200] + "..." if len(c["content"]) > 200 else c["content"],
                "score": c.get("score", 1.0)
            })

        combined_context = "\n\n".join(context_blocks)

        # If LLM API Key is configured and not empty
        if settings.LLM_API_KEY and len(settings.LLM_API_KEY.strip()) > 5:
            try:
                system_prompt = (
                    "You are an expert AI Learning Assistant in SkillMap AI. "
                    "Answer the student's question strictly grounded in the provided document excerpts. "
                    "Always cite the source number (e.g. [Source 1], [Page 2]) where relevant. "
                    "If the answer cannot be deduced from the provided context, state that clearly."
                )
                user_prompt = f"Context:\n{combined_context}\n\nStudent Question: {query}\n\nAnswer:"
                
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.LLM_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": settings.LLM_MODEL,
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            "temperature": 0.2
                        }
                    )
                    if resp.status_code == 200:
                        llm_out = resp.json()["choices"][0]["message"]["content"]
                        return {
                            "answer": llm_out,
                            "sources": sources
                        }
            except Exception as e:
                # Fall back gracefully to local grounded synthesis if network/API error
                pass

        # Built-in Intelligent Grounded Extractive Answer Synthesizer
        # Directly quotes and organizes key passages with source citations
        best_chunk = retrieved_chunks[0]
        summary_sentences = [s.strip() for s in best_chunk["content"].split(".") if len(s.strip()) > 20][:3]
        synthesis = " ".join(summary_sentences) + "."

        grounded_answer = (
            f"Based on your uploaded study material (Page {best_chunk['page_number']}):\n\n"
            f"> \"{synthesis}\"\n\n"
            f"**Key Concepts Identified:**\n"
            + "\n".join([f"- **Page {c['page_number']} Insight:** {c['content'][:140]}..." for c in retrieved_chunks[:3]]) +
            "\n\n*(Grounded directly in your uploaded notes. You can configure `LLM_API_KEY` in `.env` for generative conversational expansions.)*"
        )

        return {
            "answer": grounded_answer,
            "sources": sources
        }
