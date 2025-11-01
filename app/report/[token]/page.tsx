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

interface ReportPageProps {
  params: { token: string };
}

const ReportPage: FC<ReportPageProps> = async ({ params }) => {
  const report = await reportGenerator.getReportByToken(params.token);

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <ReportHeader report={report} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <ExecutiveSummary summary={report.executiveSummary} />
            <ModelPerspectives perspectives={report.modelPerspectives} />
            <ConsensusAnalysis consensus={report.consensus} />
            <PositioningGrid positioning={report.positioning} />
            <MessagingScores scores={report.messaging} />
            {report.humanVLLM && <HumanVLLMComparison comparison={report.humanVLLM} />}
          </div>

          <div className="lg:col-span-1 space-y-8">
            <Recommendations recommendations={report.recommendations} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;

