import React from 'react';
import ReactDOM from 'react-dom/client';

interface NoodleSeedPlatformProps {
  businessType?: string;
}

const NoodleSeedPlatform: React.FC<NoodleSeedPlatformProps> = ({ businessType }) => {
  return (
    <div className="noodleseed-platform">
      <style>{`
        .noodleseed-platform {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }
        .platform-header {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .platform-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
        .feature-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .feature-description {
          font-size: 14px;
          opacity: 0.9;
        }
      `}</style>

      <div className="platform-header">
        NoodleSeed AI Platform
        {businessType && <div style={{ fontSize: '18px', marginTop: '5px' }}>For {businessType}</div>}
      </div>

      <div className="platform-content">
        <div className="feature-card">
          <div className="feature-title">🤖 AI Assistant</div>
          <div className="feature-description">
            Intelligent chatbot trained on your business data
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-title">📊 Analytics</div>
          <div className="feature-description">
            Real-time insights and customer behavior analysis
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-title">🔄 Automation</div>
          <div className="feature-description">
            Streamline workflows with AI-powered automation
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-title">🎯 Personalization</div>
          <div className="feature-description">
            Deliver tailored experiences to each customer
          </div>
        </div>
      </div>
    </div>
  );
};

// Mount the component
const root = document.getElementById('noodleseed-root');
if (root) {
  const reactRoot = ReactDOM.createRoot(root);
  // Get business type from global context if available
  const businessType = (window as any).__NOODLESEED_DATA__?.businessType;
  reactRoot.render(<NoodleSeedPlatform businessType={businessType} />);
}

export default NoodleSeedPlatform;