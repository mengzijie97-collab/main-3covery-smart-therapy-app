import { useState } from 'react';
import { Clock, User, ChevronRight, Play } from 'lucide-react';

interface LearnContentProps {
  onNavigate: (screen: 'main-app' | 'article-detail') => void;
}

type Category = 'all' | 'science' | 'recovery' | 'device';

interface Article {
  id: string;
  title: string;
  description: string;
  category: Category;
  readTime: number;
  author: string;
  heroImage: string;
  type: 'article' | 'video';
  relatedProgramId?: string;
  isFeatured?: boolean;
}

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'The Science of Contrast Therapy',
    description: 'Understanding how alternating hot and cold temperatures accelerate recovery through vascular pumping.',
    category: 'science',
    readTime: 5,
    author: 'Dr. Recovery',
    heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    type: 'article',
    relatedProgramId: 'official-1',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Optimal Recovery Timing',
    description: 'When to use cold therapy vs heat therapy for maximum benefit.',
    category: 'recovery',
    readTime: 4,
    author: 'Sarah Chen',
    heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    type: 'article',
  },
  {
    id: '3',
    title: 'Device Setup Guide',
    description: 'Step-by-step instructions for getting the most out of your 3Covery device.',
    category: 'device',
    readTime: 3,
    author: '3Covery Team',
    heroImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
    type: 'video',
  },
  {
    id: '4',
    title: 'Compression Therapy Benefits',
    description: 'How pneumatic compression enhances circulation and reduces muscle soreness.',
    category: 'science',
    readTime: 6,
    author: 'Dr. James Wilson',
    heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    type: 'article',
    relatedProgramId: 'official-2',
  },
];

const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'science', label: 'Science' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'device', label: 'Device' },
];

export default function LearnContent({ onNavigate }: LearnContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const filteredArticles = selectedCategory === 'all'
    ? mockArticles
    : mockArticles.filter(article => article.category === selectedCategory);

  const featuredArticle = mockArticles.find(article => article.isFeatured);
  const regularArticles = filteredArticles.filter(article => !article.isFeatured);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Learn</h2>
        <p className="text-sm text-gray-600 mt-1">Science & Guides</p>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Featured Card - 16:9 Aspect Ratio */}
      {featuredArticle && selectedCategory === 'all' && (
        <div
          className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '16 / 9' }}
          onClick={() => onNavigate('article-detail')}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary rounded-full blur-3xl"></div>
          </div>

          <div className="relative p-4 h-full flex flex-col justify-between">
            <div className="inline-block px-3 py-1 bg-primary/20 backdrop-blur-sm rounded-full self-start">
              <span className="text-xs font-semibold text-primary-foreground">FEATURED</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                {featuredArticle.title}
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                {featuredArticle.description}
              </p>

              <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                Read Article
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article List */}
      <div className="space-y-3">
        {regularArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-lg p-3 border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onNavigate('article-detail')}
          >
            <div className="flex gap-3">
              {/* Thumbnail */}
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {article.type === 'video' && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" strokeWidth={2} fill="white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-primary uppercase mb-1">
                  {article.category}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    <span>{article.readTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" strokeWidth={1.5} />
                    <span>{article.author}</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
