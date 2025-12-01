import { useState, useEffect } from 'react';
import { X, Send, Building, User, Mail, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrencySync } from '@/lib/currency';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_setup_cost?: number;
  estimated_monthly_cost?: number;
  complexity_level?: string;
}

interface RequestAccessFormProps {
  workflow: WorkflowTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  requirements: string;
}

const RequestAccessForm = ({ workflow, isOpen, onClose }: RequestAccessFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    requirements: '',
  });

  // Load user profile when form opens
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isOpen) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          // Pre-fill form with existing data
          setFormData(prev => ({
            ...prev,
            fullName: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            company: profile.company || '',
            position: profile.position || '',
          }));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [isOpen]);

  if (!isOpen || !workflow) return null;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on what's missing from profile
    const missingFields = [];
    
    if (!userProfile?.full_name && !formData.fullName) {
      missingFields.push('Full Name');
    }
    if (!userProfile?.email && !formData.email) {
      missingFields.push('Email');
    }
    if (!userProfile?.phone && !formData.phone) {
      missingFields.push('Phone Number');
    }
    if (!userProfile?.company && !formData.company) {
      missingFields.push('Company Name');
    }
    if (!formData.requirements.trim()) {
      missingFields.push('Project Requirements');
    }
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Information",
        description: `Please fill in the following fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Get current user (optional - allow anonymous requests)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      // If user is logged in, update their profile with the form data
      if (user && (formData.fullName || formData.email || formData.phone || formData.company || formData.position)) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: formData.fullName || userProfile?.full_name || '',
            email: formData.email || userProfile?.email || '',
            phone: formData.phone || userProfile?.phone || '',
            company: formData.company || userProfile?.company || '',
            position: formData.position || userProfile?.position || '',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Error updating profile:', profileError);
          // Don't fail the entire request if profile update fails
        } else {
          console.log('Profile updated successfully');
        }
      }

      // Create access request (works with or without authentication)
      const { error } = await supabase
        .from('workflow_access_requests')
        .insert({
          user_id: userId,
          workflow_id: workflow.id,
          workflow_name: workflow.name,
          status: 'pending',
          company_name: formData.company,
          contact_name: formData.fullName,
          contact_email: formData.email,
          phone_number: formData.phone,
          position_title: formData.position,
          industry: formData.position, // Using position as industry for now
          use_case: formData.requirements,
          additional_requirements: formData.requirements,
          // Store additional form data in request_message for admin reference
          request_message: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            position: formData.position,
            requirements: formData.requirements,
            workflow_name: workflow.name,
            workflow_category: workflow.category,
            estimated_setup_cost: workflow.estimated_setup_cost,
            estimated_monthly_cost: workflow.estimated_monthly_cost,
            complexity_level: workflow.complexity_level,
            is_anonymous: !user // Track if this is an anonymous request
          })
        });

      // Also save to workflow request history for tracking duration (only if user is logged in)
      if (user) {
        const { error: historyError } = await supabase
          .from('workflow_request_history')
          .insert({
            user_id: user.id,
            workflow_id: workflow.id,
            workflow_name: workflow.name,
            status: 'pending',
            form_data: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              company: formData.company,
              position: formData.position,
              requirements: formData.requirements,
              workflow_name: workflow.name,
              workflow_category: workflow.category,
              estimated_setup_cost: workflow.estimated_setup_cost,
              estimated_monthly_cost: workflow.estimated_monthly_cost,
              complexity_level: workflow.complexity_level
            }
          });

        if (historyError) {
          console.error('Error saving to request history:', historyError);
        }
      }

      if (error) {
        if (error.code === '42P01') { // Table doesn't exist
          console.log('workflow_access_requests table does not exist, logging request');
          // For now, just log the request
          console.log('Workflow access request:', {
            user_id: userId,
            workflow_id: workflow.id,
            workflow_name: workflow.name,
            formData,
            is_anonymous: !user
          });
        } else {
          throw error;
        }
      }

      toast({
        title: "Request submitted successfully!",
        description: "We'll contact you within 24 hours to discuss your requirements.",
        variant: "default",
      });

      // Reset form and close modal
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        requirements: '',
      });
      onClose();

    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error submitting request",
        description: "Please try again or contact support directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Request Access</h2>
              <p className="text-gray-600 mt-1">Tell us about your requirements for</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-waselify-100 text-waselify-800">
                  {workflow.category}
                </Badge>
                <span className="font-semibold text-gray-900">{workflow.name}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Workflow Summary */}
          <Card className="mb-6 bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Workflow Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">{workflow.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Setup Cost:</span>
                                     <span className="ml-2 font-semibold">{formatCurrencySync(workflow.estimated_setup_cost || 0, undefined, workflow.complexity_level)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Monthly Cost:</span>
                                     <span className="ml-2 font-semibold">{formatCurrencySync(workflow.estimated_monthly_cost || 0, undefined, workflow.complexity_level)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Complexity:</span>
                  <span className="ml-2 font-semibold capitalize">{workflow.complexity_level || 'Medium'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Information - Only show if user doesn't have profile data */}
          {(!userProfile || !userProfile.full_name) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User size={20} />
                Personal Information <span className="text-red-500">*</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@company.com"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phone Number - Only show if not in profile */}
          {(!userProfile || !userProfile.phone) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Phone size={20} />
                Contact Information <span className="text-red-500">*</span>
              </h3>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+966 50 123 4567"
                  required
                />
              </div>
            </div>
          )}

          {/* Company Information - Only show if user doesn't have profile data */}
          {(!userProfile || !userProfile.company) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building size={20} />
                Company Information <span className="text-red-500">*</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Your company name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position/Title</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="e.g., Operations Manager"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Show user info if profile exists */}
          {userProfile && userProfile.full_name && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User size={20} />
                Your Information
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Name:</strong> {userProfile.full_name}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Phone:</strong> {userProfile.phone || 'Not provided'}</p>
                <p><strong>Company:</strong> {userProfile.company || 'Not provided'}</p>
                <p><strong>Position:</strong> {userProfile.position || 'Not provided'}</p>
              </div>
            </div>
          )}

            {/* Project Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} />
                Project Requirements <span className="text-red-500">*</span>
              </h3>
              
              <div>
                <Label htmlFor="requirements">Specific Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Describe your specific requirements, current processes, and what you hope to achieve with this automation..."
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-waselify-500 hover:bg-waselify-600"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestAccessForm; 
