import React from 'react';
import WorkflowExecutionDashboard from '@/components/WorkflowExecutionDashboard';
import BackButton from '@/components/BackButton';
import Navbar from '@/components/Navbar';

const TestWorkflowExecution: React.FC = () => {
  // This would be a real workflow ID from your database
  const testWorkflowId = 'test-workflow-123';
  const testWorkflowName = 'Lead Generation with Google Maps';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>
      
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Workflow Execution Test</h1>
          <p className="text-gray-600">
            This page demonstrates real-time n8n workflow execution monitoring.
            The dashboard shows live data from your n8n workflows.
          </p>
        </div>

        <WorkflowExecutionDashboard 
          workflowId={testWorkflowId}
          workflowName={testWorkflowName}
        />

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🚀 How It Works
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>• <strong>Execute Workflow:</strong> Click the "Execute Workflow" button to start an n8n workflow</p>
            <p>• <strong>Real-time Monitoring:</strong> Watch the execution progress in real-time</p>
            <p>• <strong>Live Results:</strong> See actual data from your n8n workflows</p>
            <p>• <strong>Error Handling:</strong> Retry failed executions or cancel running ones</p>
            <p>• <strong>Statistics:</strong> View performance metrics and success rates</p>
          </div>
        </div>

        <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            ⚠️ Setup Required
          </h3>
          <div className="text-yellow-800 space-y-2">
            <p>• <strong>n8n Server:</strong> Make sure your n8n server is running</p>
            <p>• <strong>Backend API:</strong> Start the backend server with <code>cd backend && npm start</code></p>
            <p>• <strong>Environment Variables:</strong> Set up N8N_URL and N8N_API_KEY</p>
            <p>• <strong>Workflow ID:</strong> Replace the test workflow ID with a real one from your database</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestWorkflowExecution; 