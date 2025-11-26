#!/usr/bin/env python3
"""
Script to add workflow control system to all remaining dashboard files
"""

import os
import re
from pathlib import Path

# List of all real dashboard files (not sample ones) that need workflow control
ALL_DASHBOARD_FILES = [
    "src/pages/LocalRAGDashboard.tsx",
    "src/pages/OdooSalesDashboard.tsx",
    "src/pages/LocalChatbotDashboard.tsx",
    "src/pages/WebsiteChatbotDashboard.tsx",
    "src/pages/WhatsAppDietitianDashboard.tsx",
    "src/pages/CustomerSupportAutomationDashboard.tsx",
    "src/pages/GmailCampaignDashboard.tsx",
    "src/pages/LeadGenerationDashboard.tsx",
    "src/pages/WhatsAppResponderDashboard.tsx",
    "src/pages/WhatsAppChatbotDashboard.tsx",
    "src/pages/JobApplicationDashboard.tsx",
    "src/pages/FinancialReportsDashboard.tsx",
    "src/pages/HRServiceDashboard.tsx",
    "src/pages/AutomatedLeadGenerationDashboard.tsx",
    "src/pages/GmailAutoResponderDashboard.tsx",
    "src/pages/SocialMediaContentDashboard.tsx",
    "src/pages/ClientOnboardingDashboard.tsx",
    "src/pages/InvoiceCollectionDashboard.tsx",
    "src/pages/WhatsAppProductCatalogDashboard.tsx",
    "src/pages/RAGChatbotDashboard.tsx"
]

# Workflow name mappings for all dashboards
WORKFLOW_NAMES = {
    "LocalRAGDashboard.tsx": "Local AI Chatbot for Documents (Powered by RAG)",
    "OdooSalesDashboard.tsx": "AI Chatbot for Odoo Sales",
    "LocalChatbotDashboard.tsx": "Local Chatbot",
    "WebsiteChatbotDashboard.tsx": "AI Website Chatbot",
    "WhatsAppDietitianDashboard.tsx": "WhatsApp Dietitian Assistant",
    "CustomerSupportAutomationDashboard.tsx": "Automated Customer Support",
    "GmailCampaignDashboard.tsx": "Gmail Outreach with Auto Follow-Up",
    "LeadGenerationDashboard.tsx": "Generate Leads With Google Maps",
    "WhatsAppResponderDashboard.tsx": "WhatsApp Responder",
    "WhatsAppChatbotDashboard.tsx": "Automated WhatsApp Chat Assistant",
    "JobApplicationDashboard.tsx": "Handling Job Application Submissions with AI",
    "FinancialReportsDashboard.tsx": "Generate Monthly Financial Reports",
    "HRServiceDashboard.tsx": "Automated HR Service System",
    "AutomatedLeadGenerationDashboard.tsx": "Automated Lead Generation",
    "GmailAutoResponderDashboard.tsx": "Gmail AI Auto-Responder",
    "SocialMediaContentDashboard.tsx": "AI-Powered Social Media Content Generator & Publisher",
    "ClientOnboardingDashboard.tsx": "Client Onboarding Automation",
    "InvoiceCollectionDashboard.tsx": "Smart Invoice Collection System",
    "WhatsAppProductCatalogDashboard.tsx": "Whatsapp Product Catalog Bot",
    "RAGChatbotDashboard.tsx": "AI Chatbot for Company Documents"
}

def get_workflow_name(filename):
    """Get workflow name from filename"""
    return WORKFLOW_NAMES.get(filename, filename.replace("Dashboard.tsx", "").replace(".tsx", ""))

def add_workflow_control_system(filepath):
    """Add workflow control system to a dashboard file"""
    
    filename = os.path.basename(filepath)
    workflow_name = get_workflow_name(filename)
    
    print(f"Processing: {filename} -> {workflow_name}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if workflow control is already added
    if 'handleWorkflowRequest' in content:
        print(f"⚠️  {filename} already has workflow control system")
        return
    
    # Add imports
    if 'XCircle' not in content:
        # Find the lucide-react import and add new icons
        lucide_import_pattern = r'import \{([^}]+)\} from [\'"]lucide-react[\'"];'
        lucide_match = re.search(lucide_import_pattern, content)
        if lucide_match:
            existing_icons = lucide_match.group(1)
            if 'XCircle' not in existing_icons:
                # Add new icons to the import
                new_icons = existing_icons.rstrip() + ',\n  XCircle,\n  Database,\n  Settings'
                content = content.replace(existing_icons, new_icons)
    
    # Add supabase import if not present
    if 'supabase' not in content:
        # Find a good place to add the import (after other imports)
        import_pattern = r'import.*from.*[\'"]@/hooks/use-toast[\'"];'
        import_match = re.search(import_pattern, content)
        if import_match:
            content = content.replace(
                import_match.group(0),
                import_match.group(0) + '\nimport { supabase } from "@/lib/supabaseClient";'
            )
    
    # Add state variables
    if 'pendingRequests' not in content:
        # Find the state declarations and add new ones
        state_pattern = r'const \[([^,]+), set([^\]]+)\] = useState<[^>]+>\([^)]+\);'
        state_matches = list(re.finditer(state_pattern, content))
        if state_matches:
            # Add after the last state declaration
            last_state = state_matches[-1]
            content = content.replace(
                last_state.group(0),
                last_state.group(0) + '\n  const [pendingRequests, setPendingRequests] = useState<any[]>([]);\n  const [processedRequests, setProcessedRequests] = useState<any[]>([]);'
            )
    
    # Add useEffect calls
    if 'loadPendingRequests' not in content:
        # Find useEffect and add the calls
        useEffect_pattern = r'useEffect\(\(\) => \{([^}]+)\}, \[\]\);'
        useEffect_match = re.search(useEffect_pattern, content, re.DOTALL)
        if useEffect_match:
            existing_calls = useEffect_match.group(1)
            if 'loadPendingRequests' not in existing_calls:
                content = content.replace(
                    existing_calls,
                    existing_calls.rstrip() + '\n    loadPendingRequests();\n    loadProcessedRequests();'
                )
    
    # Add workflow control functions
    if 'loadPendingRequests' not in content:
        # Find a good place to add the functions (after existing functions)
        function_pattern = r'const ([a-zA-Z]+) = \(.*\) => \{'
        function_matches = list(re.finditer(function_pattern, content))
        if function_matches:
            # Add after the last function
            last_function = function_matches[-1]
            insert_pos = content.find('\n', last_function.end())
            if insert_pos != -1:
                workflow_functions = f'''

  const loadPendingRequests = async () => {{
    try {{
      const {{ data: {{ user }} }} = await supabase.auth.getUser();
      if (!user) return;

      const {{ data: requests, error }} = await supabase
        .from('workflow_control_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_name', '{workflow_name}')
        .eq('status', 'pending')
        .order('created_at', {{ ascending: false }});

      if (error) {{
        console.error('Error loading pending requests:', error);
        return;
      }}

      setPendingRequests(requests || []);
    }} catch (error) {{
      console.error('Error loading pending requests:', error);
    }}
  }};

  const loadProcessedRequests = async () => {{
    try {{
      const {{ data: {{ user }} }} = await supabase.auth.getUser();
      if (!user) return;

      const {{ data: requests, error }} = await supabase
        .from('workflow_control_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('workflow_name', '{workflow_name}');

      if (error) {{
        console.error('Error loading processed requests:', error);
        return;
      }}

      const processed = (requests || [])
        .filter(req => req.status !== 'pending')
        .sort((a, b) => new Date(b.processed_at || b.created_at).getTime() - new Date(a.processed_at || a.created_at).getTime())
        .slice(0, 5);

      setProcessedRequests(processed);
    }} catch (error) {{
      console.error('Error loading processed requests:', error);
    }}
  }};

  const handleWorkflowRequest = async (action: 'start' | 'stop' | 'modify') => {{
    try {{
      const {{ data: {{ user }} }} = await supabase.auth.getUser();
      if (!user) {{
        toast({{
          title: "Error",
          description: "You must be logged in to make requests",
          variant: "destructive",
        }});
        return;
      }}

      // Insert workflow control request into database
      const {{ error }} = await supabase
        .from('workflow_control_requests')
        .insert({{
          user_id: user.id,
          workflow_name: '{workflow_name}',
          request_type: action,
          status: 'pending',
          request_details: `User requested to ${{action}} the {workflow_name} workflow`,
          created_at: new Date().toISOString()
        }});

      if (error) {{
        console.error('Error creating workflow request:', error);
        toast({{
          title: "Error",
          description: "Failed to submit request. Please try again.",
          variant: "destructive",
        }});
        return;
      }}

      toast({{
        title: "Request Submitted",
        description: `Your request to ${{action}} the workflow has been sent to admin for approval.`,
        variant: "default",
      }});

      // Refresh requests
      loadPendingRequests();
      loadProcessedRequests();

    }} catch (error) {{
      console.error('Error handling workflow request:', error);
      toast({{
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      }});
    }}
  }};'''
                content = content[:insert_pos] + workflow_functions + content[insert_pos:]
    
    # Add workflow control UI sections
    if 'Workflow Control' not in content:
        # Find where to add the UI sections (after header, before stats)
        # Look for common patterns like "Stats Overview" or "Dashboard Status"
        ui_insert_patterns = [
            r'\{/\* Stats Overview \*/\}',
            r'\{/\* Dashboard Status \*/\}',
            r'\{/\* Live Dashboard Notice \*/\}',
            r'\{/\* Automation Status \*/\}',
            r'\{/\* Stats Grid \*/\}',
            r'\{/\* Main Content Grid \*/\}'
        ]
        
        insert_pos = -1
        for pattern in ui_insert_patterns:
            match = re.search(pattern, content)
            if match:
                insert_pos = match.start()
                break
        
        if insert_pos == -1:
            # If no pattern found, try to find a good place after the header
            header_pattern = r'\{/\* Header \*/\}'
            header_match = re.search(header_pattern, content)
            if header_match:
                # Find the end of the header section
                header_end = content.find('\n        </div>', header_match.end())
                if header_end != -1:
                    insert_pos = header_end + len('\n        </div>')
        
        if insert_pos != -1:
            workflow_ui = f'''

        {/* Dashboard Status */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <Database size={{20}} />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Ready for Data</h3>
              <p className="text-blue-800 text-sm">
                Your dashboard is ready to display real-time data once you start using the {workflow_name} workflow
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Control Request */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Control</CardTitle>
            <CardDescription>
              Request admin to start, stop, or modify your {workflow_name} workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={{() => handleWorkflowRequest('start')}}
                  className="h-auto p-4 flex flex-col items-center bg-waselify-500 hover:bg-waselify-600 text-white"
                >
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <span>Request Start</span>
                </Button>
                <Button 
                  onClick={{() => handleWorkflowRequest('stop')}}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
                >
                  <XCircle className="w-6 h-6 mb-2" />
                  <span>Request Stop</span>
                </Button>
                <Button 
                  onClick={{() => handleWorkflowRequest('modify')}}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
                >
                  <Settings className="w-6 h-6 mb-2" />
                  <span>Request Changes</span>
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>• <strong>Start:</strong> Request admin to activate your workflow</p>
                <p>• <strong>Stop:</strong> Request admin to pause your workflow</p>
                <p>• <strong>Changes:</strong> Request modifications to workflow settings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        {{pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Your workflow control requests awaiting admin approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {{pendingRequests.map((request) => (
                  <div key={{request.id}} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${{{
                        request.request_type === 'start' ? 'bg-green-500' :
                        request.request_type === 'stop' ? 'bg-red-500' : 'bg-blue-500'
                      }}}`}}></div>
                      <div>
                        <p className="font-medium capitalize">{{request.request_type}} Request</p>
                        <p className="text-sm text-muted-foreground">
                          {{new Date(request.created_at).toLocaleDateString()}}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Pending
                    </Badge>
                  </div>
                ))}}
              </div>
            </CardContent>
          </Card>
        )}}

        {/* Recent Processed Requests */}
        {{processedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                Your recently processed workflow control requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {{processedRequests.map((request) => (
                  <div key={{request.id}} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${{{
                        request.request_type === 'start' ? 'bg-green-500' :
                        request.request_type === 'stop' ? 'bg-red-500' : 'bg-blue-500'
                      }}}`}}></div>
                      <div>
                        <p className="font-medium capitalize">{{request.request_type}} Request</p>
                        <p className="text-sm text-muted-foreground">
                          {{new Date(request.created_at).toLocaleDateString()}}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={{request.status === 'approved' ? 'default' : 'destructive'}}
                      className={{{
                        request.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                      }}}
                    >
                      {{request.status === 'approved' ? 'Approved' : 'Rejected'}}
                    </Badge>
                  </div>
                ))}}
              </div>
            </CardContent>
          </Card>
        )}}'''
                content = content[:insert_pos] + workflow_ui + content[insert_pos:]
    
    # Write the updated content back to the file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {filename}")

def main():
    """Main function to update all remaining dashboard files"""
    print("🚀 Starting comprehensive dashboard updates...")
    
    for filepath in ALL_DASHBOARD_FILES:
        if os.path.exists(filepath):
            try:
                add_workflow_control_system(filepath)
            except Exception as e:
                print(f"❌ Error updating {filepath}: {e}")
        else:
            print(f"⚠️  File not found: {filepath}")
    
    print("🎉 All dashboard updates completed!")

if __name__ == "__main__":
    main()

