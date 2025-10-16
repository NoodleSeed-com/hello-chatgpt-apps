import React from 'react';
import ReactDOM from 'react-dom/client';

interface NoodleSeedListProps {
  businessType?: string;
}

const NoodleSeedList: React.FC<NoodleSeedListProps> = ({ businessType }) => {
  const features = [
    { title: 'Natural Language Processing', description: 'Advanced NLP for understanding customer queries', score: 98 },
    { title: 'Machine Learning Models', description: 'Custom ML models tailored to your industry', score: 95 },
    { title: 'Real-time Analytics', description: 'Live dashboards and performance metrics', score: 92 },
    { title: 'API Integration', description: 'Seamless integration with existing systems', score: 90 },
    { title: 'Security & Compliance', description: 'Enterprise-grade security and data protection', score: 100 },
  ];

  return (
    <div className="noodleseed-list">
      <style>{`
        .noodleseed-list {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          background: #f7f8fa;
          border-radius: 12px;
        }
        .list-header {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #1a1a1a;
        }
        .list-item {
          background: white;
          padding: 16px;
          margin-bottom: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .item-content {
          flex: 1;
        }
        .item-title {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }
        .item-description {
          font-size: 14px;
          color: #7f8c8d;
        }
        .item-score {
          font-size: 24px;
          font-weight: bold;
          color: #27ae60;
          margin-left: 20px;
        }
      `}</style>

      <div className="list-header">
        Top NoodleSeed Features
        {businessType && <div style={{ fontSize: '16px', marginTop: '5px', color: '#666' }}>
          Optimized for {businessType}
        </div>}
      </div>

      {features.map((feature, index) => (
        <div key={index} className="list-item">
          <div className="item-content">
            <div className="item-title">{feature.title}</div>
            <div className="item-description">{feature.description}</div>
          </div>
          <div className="item-score">{feature.score}%</div>
        </div>
      ))}
    </div>
  );
};

// Mount the component
const root = document.getElementById('noodleseed-root');
if (root) {
  const reactRoot = ReactDOM.createRoot(root);
  const businessType = (window as any).__NOODLESEED_DATA__?.businessType;
  reactRoot.render(<NoodleSeedList businessType={businessType} />);
}

export default NoodleSeedList;