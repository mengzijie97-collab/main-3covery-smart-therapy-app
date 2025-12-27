import { ArrowLeft, Play, Clock, User } from 'lucide-react';

interface ArticleDetailScreenProps {
  onNavigate: (screen: 'main-app' | 'program-detail') => void;
}

export default function ArticleDetailScreen({ onNavigate }: ArticleDetailScreenProps) {
  const article = {
    id: '1',
    title: 'The Science of Contrast Therapy',
    category: 'SCIENCE',
    readTime: 5,
    author: 'Dr. Recovery',
    heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80',
    type: 'article' as const,
    relatedProgramId: 'official-1',
    relatedProgramName: 'Contrast Recovery',
    content: `
      <h2>What is Contrast Therapy?</h2>
      <p>Contrast therapy, also known as contrast water therapy, is a post-exercise recovery method that involves alternating between hot and cold water immersion.</p>
      
      <h2>How it works</h2>
      <p>The rapid changes in temperature cause your blood vessels to constrict (in the cold) and dilate (in the heat). This creates a pumping action in your circulatory system.</p>
      
      <p>This vascular pumping helps to:</p>
      <ul>
        <li>Flush out metabolic waste products</li>
        <li>Reduce inflammation</li>
        <li>Accelerate recovery time</li>
        <li>Decrease muscle soreness</li>
      </ul>
      
      <h2>Optimal Protocol</h2>
      <p>Research suggests the most effective contrast therapy protocol involves:</p>
      <ul>
        <li>3-5 cycles of alternating temperatures</li>
        <li>Cold exposure: 10-15°C for 1-2 minutes</li>
        <li>Heat exposure: 38-42°C for 3-4 minutes</li>
        <li>Always end with cold to reduce inflammation</li>
      </ul>
      
      <h2>Best Used After</h2>
      <p>Contrast therapy is particularly effective following high-intensity training sessions, competitions, or any activity that causes significant muscle fatigue.</p>
    `,
  };

  return (
    <div className="min-h-screen bg-gradient-1 text-foreground pb-24">
      {/* Hero Image Section */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={article.heroImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay for Back Button */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
        
        {/* Back Button */}
        <button
          onClick={() => onNavigate('main-app')}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
        </button>

        {/* Video Play Button (if video type) */}
        {article.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 shadow-xl">
              <Play className="w-8 h-8 text-primary ml-1" strokeWidth={2} fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      {/* Content Card (Overlapping Hero) */}
      <div className="max-w-md mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          {/* Category Badge */}
          <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-3">
            <span className="text-xs font-semibold text-primary uppercase">{article.category}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              <span>{article.readTime} min Read</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" strokeWidth={1.5} />
              <span>By {article.author}</span>
            </div>
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              fontSize: '15px',
              lineHeight: '1.7',
            }}
          />
        </div>
      </div>

      {/* Actionable Footer (if related program exists) */}
      {article.relatedProgramId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-0.5">Try this therapy:</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {article.relatedProgramName}
                </p>
              </div>
              <button
                onClick={() => onNavigate('program-detail')}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-all shadow-md flex-shrink-0"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
