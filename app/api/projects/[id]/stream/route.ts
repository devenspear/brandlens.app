import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Create a readable stream for Server-Sent Events
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        try {
          const project = await prisma.project.findUnique({
            where: { id },
            include: {
              llmRuns: {
                orderBy: { createdAt: 'desc' },
              },
              reports: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          });

          if (!project) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'Project not found' })}\n\n`)
            );
            controller.close();
            return;
          }

          // Build detailed progress data
          const progressData = {
            id: project.id,
            url: project.url,
            status: project.status,
            progressMessage: project.progressMessage || 'Initializing...',
            progressPercent: project.progressPercent || 0,
            reportUrl: project.reports[0] ? `/report/${project.reports[0].urlToken}` : null,

            // Provider statuses
            providers: {
              OPENAI: getProviderStatus(project.llmRuns, 'OPENAI'),
              ANTHROPIC: getProviderStatus(project.llmRuns, 'ANTHROPIC'),
              GOOGLE: getProviderStatus(project.llmRuns, 'GOOGLE'),
            },

            // Overall LLM summary
            llmSummary: {
              total: project.llmRuns.length,
              completed: project.llmRuns.filter(r => r.status === 'COMPLETED').length,
              failed: project.llmRuns.filter(r => r.status === 'FAILED').length,
              running: project.llmRuns.filter(r => r.status === 'RUNNING').length,
            },
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`));

          // If completed or failed, close the stream
          if (project.status === 'COMPLETED' || project.status === 'FAILED') {
            controller.close();
            return;
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
          );
          controller.close();
        }
      };

      // Send initial update
      await sendUpdate();

      // Poll every 500ms for updates
      const interval = setInterval(async () => {
        await sendUpdate();
      }, 500);

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, 600000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function getProviderStatus(llmRuns: any[], provider: string) {
  const run = llmRuns.find(r => r.provider === provider);

  if (!run) {
    return { status: 'WAITING', step: null, model: null };
  }

  return {
    status: run.status || 'RUNNING',
    model: run.model,
    tokensUsed: run.tokensUsed || 0,
    cost: run.cost || 0,
    createdAt: run.createdAt,
    error: run.error || null,
  };
}
