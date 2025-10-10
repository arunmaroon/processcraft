import React, { useState, useEffect } from 'react';
import { Brain, FileText, Edit3, Save, CheckCircle, Download, RefreshCw, Eye } from 'lucide-react';
import PRDEditor from './PRDEditor';

interface DetailedPRDGeneratorProps {
  project: any;
  onPRDGenerated: (prd: any) => void;
  onPRDFinalized: (prd: any) => void;
}

export default function DetailedPRDGenerator({ project, onPRDGenerated, onPRDFinalized }: DetailedPRDGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPRD, setGeneratedPRD] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generateDetailedPRD = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/prd-generation/generate-detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: project,
          template: 'comprehensive'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGeneratedPRD(data.content);
          onPRDGenerated(data);
        } else {
          throw new Error(data.error || 'Failed to generate PRD');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error generating detailed PRD:', error);
      // Fallback to template-based generation
      const fallbackPRD = generateFallbackDetailedPRD(project);
      setGeneratedPRD(fallbackPRD);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackDetailedPRD = (project: any) => {
    return `
      <h1>Product Requirements Document: ${project.name}</h1>
      
      <h2>1. Executive Summary</h2>
      <p>This PRD outlines the development of <strong>${project.name}</strong>, a comprehensive solution designed to address key user needs and achieve significant business objectives. This document serves as the foundation for product development, design, and implementation decisions.</p>
      
      <h2>2. Product Overview</h2>
      <h3>2.1 Product Description</h3>
      <p>${project.description || 'A comprehensive digital solution designed to meet user needs and drive business value.'}</p>
      
      <h3>2.2 Target Audience</h3>
      <ul>
        <li><strong>Primary Users:</strong> End users who will directly interact with the product</li>
        <li><strong>Secondary Users:</strong> Administrators and support staff</li>
        <li><strong>Stakeholders:</strong> Business leaders and decision makers</li>
      </ul>
      
      <h2>3. Business Goals</h2>
      <h3>3.1 Primary Objectives</h3>
      <ul>
        <li>Increase user engagement and retention</li>
        <li>Drive revenue growth through improved user experience</li>
        <li>Establish market leadership in the target segment</li>
        <li>Reduce operational costs through automation</li>
      </ul>
      
      <h3>3.2 Success Metrics</h3>
      <ul>
        <li><strong>User Acquisition:</strong> 10,000+ new users in first 6 months</li>
        <li><strong>User Engagement:</strong> 80%+ monthly active users</li>
        <li><strong>Revenue Growth:</strong> 150% YoY increase</li>
        <li><strong>User Satisfaction:</strong> 4.5+ star rating</li>
      </ul>
      
      <h2>4. User Stories</h2>
      <h3>4.1 Primary User Stories</h3>
      <ul>
        <li><strong>As a new user,</strong> I want to easily onboard and understand the product so that I can start using it immediately.</li>
        <li><strong>As a returning user,</strong> I want to quickly access my data and continue where I left off.</li>
        <li><strong>As a power user,</strong> I want advanced features and customization options to optimize my workflow.</li>
        <li><strong>As a mobile user,</strong> I want a responsive experience that works seamlessly across all devices.</li>
      </ul>
      
      <h3>4.2 Admin User Stories</h3>
      <ul>
        <li><strong>As an administrator,</strong> I want to manage users and content effectively.</li>
        <li><strong>As a support agent,</strong> I want to quickly resolve user issues and provide assistance.</li>
        <li><strong>As a business analyst,</strong> I want comprehensive analytics and reporting capabilities.</li>
      </ul>
      
      <h2>5. Functional Requirements</h2>
      <h3>5.1 Core Features</h3>
      <ul>
        <li><strong>User Authentication & Management</strong>
          <ul>
            <li>User registration and login</li>
            <li>Password reset and recovery</li>
            <li>Profile management</li>
            <li>Role-based access control</li>
          </ul>
        </li>
        <li><strong>Content Management</strong>
          <ul>
            <li>Create, read, update, delete operations</li>
            <li>File upload and storage</li>
            <li>Content categorization and tagging</li>
            <li>Search and filtering capabilities</li>
          </ul>
        </li>
        <li><strong>Communication Features</strong>
          <ul>
            <li>Real-time messaging</li>
            <li>Notification system</li>
            <li>Email integration</li>
            <li>Social sharing capabilities</li>
          </ul>
        </li>
      </ul>
      
      <h3>5.2 Advanced Features</h3>
      <ul>
        <li>Analytics and reporting dashboard</li>
        <li>API integration capabilities</li>
        <li>Third-party service integrations</li>
        <li>Advanced search and filtering</li>
        <li>Customization and personalization</li>
      </ul>
      
      <h2>6. Non-Functional Requirements</h2>
      <h3>6.1 Performance Requirements</h3>
      <ul>
        <li><strong>Response Time:</strong> Page load times under 2 seconds</li>
        <li><strong>Throughput:</strong> Support 1000+ concurrent users</li>
        <li><strong>Availability:</strong> 99.9% uptime SLA</li>
        <li><strong>Scalability:</strong> Handle 10x user growth without performance degradation</li>
      </ul>
      
      <h3>6.2 Security Requirements</h3>
      <ul>
        <li>End-to-end encryption for sensitive data</li>
        <li>Multi-factor authentication support</li>
        <li>Regular security audits and penetration testing</li>
        <li>GDPR and privacy compliance</li>
        <li>Secure API endpoints with rate limiting</li>
      </ul>
      
      <h3>6.3 Usability Requirements</h3>
      <ul>
        <li>Intuitive user interface design</li>
        <li>Mobile-responsive design</li>
        <li>Accessibility compliance (WCAG 2.1 AA)</li>
        <li>Multi-language support</li>
        <li>Comprehensive user documentation</li>
      </ul>
      
      <h2>7. Technical Architecture</h2>
      <h3>7.1 Frontend Technology</h3>
      <ul>
        <li><strong>Framework:</strong> React with TypeScript</li>
        <li><strong>Styling:</strong> Tailwind CSS with custom components</li>
        <li><strong>State Management:</strong> Redux Toolkit</li>
        <li><strong>Testing:</strong> Jest and React Testing Library</li>
      </ul>
      
      <h3>7.2 Backend Technology</h3>
      <ul>
        <li><strong>Runtime:</strong> Node.js with Express</li>
        <li><strong>Database:</strong> PostgreSQL with Redis caching</li>
        <li><strong>Authentication:</strong> JWT with refresh tokens</li>
        <li><strong>File Storage:</strong> AWS S3 or similar cloud storage</li>
      </ul>
      
      <h3>7.3 Infrastructure</h3>
      <ul>
        <li><strong>Hosting:</strong> AWS or Azure cloud platform</li>
        <li><strong>CDN:</strong> CloudFront for static assets</li>
        <li><strong>Monitoring:</strong> Application performance monitoring</li>
        <li><strong>CI/CD:</strong> Automated deployment pipeline</li>
      </ul>
      
      <h2>8. User Experience Design</h2>
      <h3>8.1 Design Principles</h3>
      <ul>
        <li><strong>User-Centered:</strong> Design based on user research and feedback</li>
        <li><strong>Consistent:</strong> Maintain design consistency across all interfaces</li>
        <li><strong>Accessible:</strong> Ensure accessibility for all users</li>
        <li><strong>Scalable:</strong> Design system that grows with the product</li>
      </ul>
      
      <h3>8.2 Key User Flows</h3>
      <ul>
        <li>User onboarding and registration flow</li>
        <li>Core feature usage workflows</li>
        <li>Error handling and recovery flows</li>
        <li>Help and support access flows</li>
      </ul>
      
      <h2>9. Data Requirements</h2>
      <h3>9.1 Data Models</h3>
      <ul>
        <li>User profiles and authentication data</li>
        <li>Content and media storage</li>
        <li>Analytics and usage tracking data</li>
        <li>Configuration and settings data</li>
      </ul>
      
      <h3>9.2 Data Privacy</h3>
      <ul>
        <li>User consent management</li>
        <li>Data retention policies</li>
        <li>Right to be forgotten implementation</li>
        <li>Data anonymization for analytics</li>
      </ul>
      
      <h2>10. Integration Requirements</h2>
      <h3>10.1 Third-Party Integrations</h3>
      <ul>
        <li>Payment processing (Stripe, PayPal)</li>
        <li>Email services (SendGrid, Mailchimp)</li>
        <li>Analytics (Google Analytics, Mixpanel)</li>
        <li>Social media APIs</li>
      </ul>
      
      <h3>10.2 API Requirements</h3>
      <ul>
        <li>RESTful API design</li>
        <li>GraphQL endpoint for complex queries</li>
        <li>Webhook support for real-time updates</li>
        <li>API documentation and versioning</li>
      </ul>
      
      <h2>11. Testing Strategy</h2>
      <h3>11.1 Testing Types</h3>
      <ul>
        <li><strong>Unit Testing:</strong> Individual component testing</li>
        <li><strong>Integration Testing:</strong> API and service integration</li>
        <li><strong>End-to-End Testing:</strong> Complete user journey testing</li>
        <li><strong>Performance Testing:</strong> Load and stress testing</li>
        <li><strong>Security Testing:</strong> Vulnerability assessment</li>
      </ul>
      
      <h3>11.2 Quality Assurance</h3>
      <ul>
        <li>Automated testing pipeline</li>
        <li>Code review process</li>
        <li>User acceptance testing</li>
        <li>Beta testing program</li>
      </ul>
      
      <h2>12. Deployment & Launch</h2>
      <h3>12.1 Release Strategy</h3>
      <ul>
        <li><strong>Alpha Release:</strong> Internal testing and validation</li>
        <li><strong>Beta Release:</strong> Limited user testing</li>
        <li><strong>Soft Launch:</strong> Gradual rollout to target users</li>
        <li><strong>Full Launch:</strong> Public release with marketing</li>
      </ul>
      
      <h3>12.2 Go-to-Market Plan</h3>
      <ul>
        <li>Marketing and promotion strategy</li>
        <li>User onboarding and support</li>
        <li>Feedback collection and iteration</li>
        <li>Success metrics tracking</li>
      </ul>
      
      <h2>13. Future Roadmap</h2>
      <h3>13.1 Phase 2 Features</h3>
      <ul>
        <li>Advanced analytics and insights</li>
        <li>AI-powered recommendations</li>
        <li>Mobile app development</li>
        <li>Enterprise features and integrations</li>
      </ul>
      
      <h3>13.2 Long-term Vision</h3>
      <ul>
        <li>Platform expansion and scaling</li>
        <li>International market entry</li>
        <li>Advanced AI and machine learning</li>
        <li>Ecosystem development</li>
      </ul>
      
      <h2>14. Risk Assessment</h2>
      <h3>14.1 Technical Risks</h3>
      <ul>
        <li><strong>Scalability Challenges:</strong> Mitigation through cloud architecture</li>
        <li><strong>Security Vulnerabilities:</strong> Regular security audits and updates</li>
        <li><strong>Performance Issues:</strong> Continuous monitoring and optimization</li>
      </ul>
      
      <h3>14.2 Business Risks</h3>
      <ul>
        <li><strong>Market Competition:</strong> Focus on unique value proposition</li>
        <li><strong>User Adoption:</strong> Comprehensive user research and testing</li>
        <li><strong>Regulatory Changes:</strong> Compliance monitoring and adaptation</li>
      </ul>
      
      <h2>15. Success Criteria</h2>
      <h3>15.1 Key Performance Indicators (KPIs)</h3>
      <ul>
        <li><strong>User Metrics:</strong> DAU, MAU, retention rates</li>
        <li><strong>Business Metrics:</strong> Revenue, conversion rates, LTV</li>
        <li><strong>Technical Metrics:</strong> Uptime, response times, error rates</li>
        <li><strong>User Satisfaction:</strong> NPS, CSAT, user feedback scores</li>
      </ul>
      
      <h3>15.2 Success Timeline</h3>
      <ul>
        <li><strong>Month 1-3:</strong> Product development and testing</li>
        <li><strong>Month 4-6:</strong> Beta launch and user feedback</li>
        <li><strong>Month 7-9:</strong> Full launch and user acquisition</li>
        <li><strong>Month 10-12:</strong> Growth optimization and scaling</li>
      </ul>
      
      <h2>16. Glossary</h2>
      <ul>
        <li><strong>API:</strong> Application Programming Interface</li>
        <li><strong>CDN:</strong> Content Delivery Network</li>
        <li><strong>DAU:</strong> Daily Active Users</li>
        <li><strong>GDPR:</strong> General Data Protection Regulation</li>
        <li><strong>JWT:</strong> JSON Web Token</li>
        <li><strong>LTV:</strong> Lifetime Value</li>
        <li><strong>MAU:</strong> Monthly Active Users</li>
        <li><strong>NPS:</strong> Net Promoter Score</li>
        <li><strong>SLA:</strong> Service Level Agreement</li>
        <li><strong>WCAG:</strong> Web Content Accessibility Guidelines</li>
      </ul>
      
      <hr style="margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb;" />
      
      <p style="color: #6b7280; font-size: 0.875rem; text-align: center;">
        <em>This PRD was generated using ProcessCraft AI and can be edited using the built-in editor.</em><br />
        <em>Last updated: ${new Date().toLocaleDateString()}</em>
      </p>
    `;
  };

  const handleContentChange = (content: string) => {
    setGeneratedPRD(content);
  };

  const handleSave = () => {
    // Save to localStorage
    const prdData = {
      content: generatedPRD,
      projectId: project.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`detailed-prd-${project.id}`, JSON.stringify(prdData));
    console.log('PRD saved successfully');
  };

  const handleFinalize = () => {
    const finalPRD = {
      id: `prd-${Date.now()}`,
      content: generatedPRD,
      projectId: project.id,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onPRDFinalized(finalPRD);
  };

  // Load existing PRD on mount
  useEffect(() => {
    const savedPRD = localStorage.getItem(`detailed-prd-${project.id}`);
    if (savedPRD) {
      try {
        const prdData = JSON.parse(savedPRD);
        setGeneratedPRD(prdData.content);
      } catch (error) {
        console.error('Error loading saved PRD:', error);
      }
    }
  }, [project.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">PRD Generator</h2>
            <p className="text-gray-500 text-sm">AI-powered product requirements generation</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!generatedPRD && (
            <button
              onClick={generateDetailedPRD}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating PRD...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>Generate Detailed PRD</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* PRD Editor */}
      {generatedPRD && (
        <div className="h-[800px]">
          <PRDEditor
            content={generatedPRD}
            onContentChange={handleContentChange}
            onSave={handleSave}
            onFinalize={handleFinalize}
            isEditing={!showPreview}
            onToggleEdit={() => setShowPreview(!showPreview)}
          />
        </div>
      )}

      {/* Generation Status */}
      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Generating Detailed PRD</h3>
              <p className="text-blue-600">AI is creating a comprehensive Product Requirements Document...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



