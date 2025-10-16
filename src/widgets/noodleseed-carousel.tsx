import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

interface NoodleSeedCarouselProps {
  businessType?: string;
}

const NoodleSeedCarousel: React.FC<NoodleSeedCarouselProps> = ({ businessType }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const solutions = [
    {
      title: 'Customer Service AI',
      description: 'Automate 80% of customer inquiries with intelligent chatbots',
      icon: '💬',
      color: '#667eea'
    },
    {
      title: 'Sales Intelligence',
      description: 'Predict customer behavior and optimize sales strategies',
      icon: '📈',
      color: '#764ba2'
    },
    {
      title: 'Content Generation',
      description: 'Create personalized content at scale with AI',
      icon: '✍️',
      color: '#f093fb'
    },
    {
      title: 'Process Automation',
      description: 'Streamline operations with intelligent workflow automation',
      icon: '⚙️',
      color: '#4facfe'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % solutions.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + solutions.length) % solutions.length);
  };

  return (
    <div className="noodleseed-carousel">
      <style>{`
        .noodleseed-carousel {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .carousel-header {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
          color: #1a1a1a;
        }
        .carousel-container {
          position: relative;
          overflow: hidden;
          height: 300px;
        }
        .carousel-track {
          display: flex;
          transition: transform 0.3s ease;
        }
        .carousel-item {
          min-width: 100%;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .carousel-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .carousel-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .carousel-description {
          font-size: 16px;
          color: #7f8c8d;
          max-width: 400px;
        }
        .carousel-controls {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }
        .carousel-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .carousel-button:hover {
          background: #5a67d8;
        }
        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }
        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #e0e0e0;
          transition: background 0.2s;
        }
        .carousel-dot.active {
          background: #667eea;
        }
      `}</style>

      <div className="carousel-header">
        AI Solutions for {businessType || 'Your Business'}
      </div>

      <div className="carousel-container">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {solutions.map((solution, index) => (
            <div key={index} className="carousel-item" style={{ background: `linear-gradient(135deg, ${solution.color}22, ${solution.color}11)` }}>
              <div className="carousel-icon">{solution.icon}</div>
              <div className="carousel-title">{solution.title}</div>
              <div className="carousel-description">{solution.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-controls">
        <button className="carousel-button" onClick={prevSlide}>Previous</button>
        <button className="carousel-button" onClick={nextSlide}>Next</button>
      </div>

      <div className="carousel-dots">
        {solutions.map((_, index) => (
          <div
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

// Mount the component
const root = document.getElementById('noodleseed-root');
if (root) {
  const reactRoot = ReactDOM.createRoot(root);
  const businessType = (window as any).__NOODLESEED_DATA__?.businessType;
  reactRoot.render(<NoodleSeedCarousel businessType={businessType} />);
}

export default NoodleSeedCarousel;