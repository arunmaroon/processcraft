import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Briefcase, 
  Brain, 
  AlertTriangle,
  RefreshCw,
  Activity,
  Target,
  PieChart
} from 'lucide-react';

interface AnalyticsData {
  totalPersonas: number;
  personaGenerations: number;
  averageQualityScore: number;
  topRegions: Array<{ region: string; count: number }>;
  topOccupations: Array<{ occupation: string; count: number }>;
  ageDistribution: Record<string, number>;
  techSavvinessDistribution: Record<string, number>;
}

interface RealTimeData {
  timeWindow: number;
  totalEvents: number;
  personaGenerations: number;
  personaInteractions: number;
  eventsByHour: Record<string, number>;
  topInteractionTypes: Array<{ type: string; count: number }>;
  qualityTrends: Record<string, number>;
}

interface BiasReport {
  regionalBias: {
    score: number;
    distribution: Record<string, number>;
    recommendation: string;
  };
  ageBias: {
    score: number;
    distribution: Record<string, number>;
    recommendation: string;
  };
  occupationBias: {
    score: number;
    distribution: Record<string, number>;
    recommendation: string;
  };
  overallBiasScore: number;
}

const RealTimeAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [biasReport, setBiasReport] = useState<BiasReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState(3600000); // 1 hour

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin-research/analytics');
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const response = await fetch(`/api/admin-research/analytics/realtime?timeWindow=${selectedTimeWindow}`);
      const data = await response.json();
      if (data.success) {
        setRealTimeData(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const fetchBiasReport = async () => {
    try {
      const response = await fetch('/api/admin-research/analytics/bias');
      const data = await response.json();
      if (data.success) {
        setBiasReport(data.biasReport);
      }
    } catch (error) {
      console.error('Error fetching bias report:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAnalytics(),
      fetchRealTimeData(),
      fetchBiasReport()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedTimeWindow]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedTimeWindow]);

  const getBiasColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-100';
    if (score < 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Analytics</h2>
          <p className="text-gray-600">Monitor AI persona generation and quality metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeWindow}
            onChange={(e) => setSelectedTimeWindow(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={900000}>Last 15 minutes</option>
            <option value={3600000}>Last 1 hour</option>
            <option value={86400000}>Last 24 hours</option>
            <option value={604800000}>Last 7 days</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              autoRefresh
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Personas</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalPersonas || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Generations</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.personaGenerations || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Quality Score</p>
              <p className={`text-2xl font-bold ${getQualityColor(analytics?.averageQualityScore || 0)}`}>
                {analytics?.averageQualityScore?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Real-time Events</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeData?.totalEvents || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Regional Distribution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics?.topRegions?.map((region, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{region.region}</span>
              <span className="text-sm font-bold text-blue-600">{region.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Occupation Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Briefcase className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Occupation Distribution</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics?.topOccupations?.map((occupation, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{occupation.occupation}</span>
              <span className="text-sm font-bold text-green-600">{occupation.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bias Detection */}
      {biasReport && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Bias Detection</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Regional Bias</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBiasColor(biasReport.regionalBias.score)}`}>
                  {biasReport.regionalBias.score.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-600">{biasReport.regionalBias.recommendation}</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Age Bias</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBiasColor(biasReport.ageBias.score)}`}>
                  {biasReport.ageBias.score.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-600">{biasReport.ageBias.recommendation}</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Occupation Bias</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBiasColor(biasReport.occupationBias.score)}`}>
                  {biasReport.occupationBias.score.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-600">{biasReport.occupationBias.recommendation}</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Bias Score</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBiasColor(biasReport.overallBiasScore)}`}>
                {biasReport.overallBiasScore.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Activity */}
      {realTimeData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Events by Hour</h4>
              <div className="space-y-2">
                {Object.entries(realTimeData.eventsByHour).map(([hour, count]) => (
                  <div key={hour} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{hour}:00</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${(count / Math.max(...Object.values(realTimeData.eventsByHour))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Top Interaction Types</h4>
              <div className="space-y-2">
                {realTimeData.topInteractionTypes.map((interaction, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{interaction.type}</span>
                    <span className="text-sm font-medium text-gray-900">{interaction.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeAnalytics;
