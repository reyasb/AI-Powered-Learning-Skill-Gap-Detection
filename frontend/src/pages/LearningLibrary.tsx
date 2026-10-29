import React, { useState, useEffect } from 'react';
import { resourceService, documentService } from '../services/api';
import type { LearningResource, UploadedDocument } from '../types';
import {
  BookOpen,
  Search,
  ExternalLink,
  UploadCloud,
  FileText,
  Clock,
  Trash2,
  Sparkles,
  Layers
} from 'lucide-react';

export const LearningLibrary: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'resources' | 'my-docs'>('resources');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [resRes, docRes] = await Promise.all([
        resourceService.listResources(),
        documentService.listDocuments(),
      ]);
      setResources(resRes.data);
      setDocuments(docRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await documentService.uploadDocument(file);
      await fetchData();
      setActiveTab('my-docs');
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm('Delete this document from your learning assistant knowledge base?')) return;
    try {
      await documentService.deleteDocument(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.skill_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || r.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-violet-400" />
            <span>Learning Resources & Document Library</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Browse verified study material for core competencies or upload your own notes for AI-grounded tutoring.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-2 bg-[#101321] border border-[#1F2438] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'resources' ? 'bg-violet-600 text-white shadow-neon-violet' : 'text-gray-400 hover:text-white'
            }`}
          >
            Curated Library ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('my-docs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'my-docs' ? 'bg-violet-600 text-white shadow-neon-violet' : 'text-gray-400 hover:text-white'
            }`}
          >
            My Uploaded Notes ({documents.length})
          </button>
        </div>
      </div>

      {activeTab === 'resources' ? (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by topic, skill (e.g. React, SQL)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#101321] border border-[#1F2438] focus:border-violet-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    difficultyFilter === d
                      ? 'bg-violet-600 text-white shadow-neon-violet'
                      : 'bg-[#101321] border border-[#1F2438] text-gray-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-[#101321] border border-[#1F2438] hover:border-violet-500/40 rounded-2xl p-5 shadow-card-glow flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase bg-[#17192B] text-cyan-400 px-2 py-0.5 rounded">
                      {res.skill_name}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-gray-400">
                      {res.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1">{res.title}</h3>
                  <p className="text-xs text-violet-300 mt-1">{res.topic}</p>
                  <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">{res.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1F2438] flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{res.duration_minutes} min read</span>
                  </span>

                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                    >
                      <span>Study Resource</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* My Documents Tab */
        <div className="space-y-6">
          {/* Upload Widget */}
          <div className="border-2 border-dashed border-[#1F2438] hover:border-cyan-500/50 rounded-2xl p-8 bg-[#101321] text-center transition-all">
            <input
              type="file"
              id="doc-upload"
              accept=".pdf,.txt,.md"
              onChange={handleDocumentUpload}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 shadow-neon-cyan">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">
                {uploading ? 'Chunking and Indexing Document for RAG...' : 'Upload Notes, Syllabus or Textbooks'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Accepted formats: PDF, TXT, Markdown. Text is chunked with semantic sliding windows for RAG retrieval.
              </p>
            </label>
          </div>

          {/* Document list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#101321] border border-[#1F2438] rounded-2xl p-5 shadow-card-glow flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#17192B] border border-[#1F2438] flex items-center justify-center text-violet-400 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{doc.filename}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {doc.chunk_count} vector chunks • {(doc.file_size_bytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Indexed
                  </span>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {documents.length === 0 && (
              <div className="col-span-2 text-center py-12 text-xs text-gray-500">
                No personal notes uploaded yet. Upload a PDF or TXT above to use in AI Chat & Quiz Generator.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
