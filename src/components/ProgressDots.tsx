export default function ProgressDots() {
  return (
    <div className="flex justify-center items-center gap-2 py-4">
      <div 
        className="w-2 h-2 rounded-full bg-secondary"
        style={{
          animation: 'dot-blink 1.4s ease-in-out infinite',
          animationDelay: '0s',
        }}
      />
      <div 
        className="w-2 h-2 rounded-full bg-secondary"
        style={{
          animation: 'dot-blink 1.4s ease-in-out infinite',
          animationDelay: '0.2s',
        }}
      />
      <div 
        className="w-2 h-2 rounded-full bg-secondary"
        style={{
          animation: 'dot-blink 1.4s ease-in-out infinite',
          animationDelay: '0.4s',
        }}
      />
    </div>
  );
}
