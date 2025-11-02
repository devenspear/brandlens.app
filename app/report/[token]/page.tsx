import { reportGenerator } from '@/lib/services/report-generator';
import { BrandAuditReport } from '@/lib/types';
import { notFound } from 'next/navigation';
import { FC } from 'react';

// Import child components
import ReportHeader from './components/ReportHeader';
import ExecutiveSummary from './components/ExecutiveSummary';
import ModelPerspectives from './components/ModelPerspectives';
import ConsensusAnalysis from './components/ConsensusAnalysis';
import PositioningGrid from './components/PositioningGrid';
import MessagingScores from './components/MessagingScores';
import HumanVLLMComparison from './components/HumanVLLMComparison';
import Recommendations from './components/Recommendations';
import ReportDashboard from './components/ReportDashboard';
import PrintStyles from './components/PrintStyles';

interface ReportPageProps {
  params: { token: string };
}

const ReportPage: FC<ReportPageProps> = async ({ params }) => {
  const report = await reportGenerator.getReportByToken(params.token);

  if (!report) {
    notFound();
  }

  return (
    <PrintStyles>
      <div className="min-h-screen bg-white print:bg-white">
        <main className="max-w-7xl mx-auto px-6 py-10 print:px-0 print:py-0">
        {/* Report Header */}
        <div className="avoid-break">
          <ReportHeader report={report} />
        </div>

        {/* Executive Dashboard - Key Metrics */}
        <div className="avoid-break mt-10">
          <ReportDashboard report={report} />
        </div>

        {/* Executive Summary & Top Actions */}
        <div className="page-break mt-12 avoid-break">
          <ExecutiveSummary summary={report.executiveSummary} />
        </div>

        {/* Model Perspectives - Always show all 3 */}
        <div className="page-break mt-12 avoid-break">
          <ModelPerspectives perspectives={report.modelPerspectives} />
        </div>

        {/* Main Content Grid */}
        <div className="mt-12 space-y-12">
          <div className="avoid-break">
            <ConsensusAnalysis consensus={report.consensus} />
          </div>

          <div className="avoid-break">
            <PositioningGrid positioning={report.positioning} />
          </div>

          <div className="avoid-break">
            <MessagingScores scores={report.messaging} />
          </div>

          {report.humanVLLM && (
            <div className="avoid-break">
              <HumanVLLMComparison comparison={report.humanVLLM} />
            </div>
          )}

          <div className="avoid-break">
            <Recommendations recommendations={report.recommendations} />
          </div>
        </div>
      </main>
    </div>
    </PrintStyles>
  );
};

export default ReportPage;

