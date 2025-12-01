import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Send, Lightbulb, Clock, DollarSign, Users, Target } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { translateText } from '@/lib/translation';
import { useAuth } from '@/contexts/AuthProvider';

interface CustomWorkflowRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomWorkflowRequestForm: React.FC<CustomWorkflowRequestFormProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, i18n } = useTranslation();
  
  const [formData, setFormData] = useState({
    workflowName: '',
    description: '',
    businessProblem: '',
    expectedOutcome: '',
    targetUsers: '',
    urgency: 'medium',
    timeline: '',
    technicalRequirements: '',
    integrations: '',
    additionalNotes: ''
  });

  const urgencyOptions = [
    { value: 'low', label: t('customRequestForm.urgencyOptions.low'), color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: t('customRequestForm.urgencyOptions.medium'), color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: t('customRequestForm.urgencyOptions.high'), color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: t('customRequestForm.urgencyOptions.urgent'), color: 'bg-red-100 text-red-800' }
  ];



  const timelineOptions = [
    { value: 'Within 1 week', label: t('customRequestForm.timelineOptions.within1Week') },
    { value: 'Within 2 weeks', label: t('customRequestForm.timelineOptions.within2Weeks') },
    { value: 'Within 1 month', label: t('customRequestForm.timelineOptions.within1Month') },
    { value: 'Within 3 months', label: t('customRequestForm.timelineOptions.within3Months') },
    { value: 'No specific deadline', label: t('customRequestForm.timelineOptions.noDeadline') },
    { value: 'To be discussed', label: t('customRequestForm.timelineOptions.toBeDiscussed') }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.workflowName.trim() || !formData.description.trim() || !formData.businessProblem.trim()) {
      toast({
        title: t('customRequestForm.toasts.missingInfoTitle'),
        description: t('customRequestForm.toasts.missingInfoDesc'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const needsTranslation = i18n.language !== 'en';
      const translateEndpointConfigured = Boolean((import.meta as any).env?.VITE_TRANSLATE_URL);

      let englishTranslation = {
        workflowName: formData.workflowName,
        description: formData.description,
        businessProblem: formData.businessProblem,
        expectedOutcome: formData.expectedOutcome,
        targetUsers: formData.targetUsers,
        technicalRequirements: formData.technicalRequirements,
        integrations: formData.integrations,
        additionalNotes: formData.additionalNotes
      };

      let autoTranslated = false;

      if (needsTranslation && translateEndpointConfigured) {
        try {
          const src = i18n.language;
          const tgt = 'en';
          const [workflowName, description, businessProblem, expectedOutcome, targetUsers, technicalRequirements, integrations, additionalNotes] = await Promise.all([
            translateText(formData.workflowName, src, tgt),
            translateText(formData.description, src, tgt),
            translateText(formData.businessProblem, src, tgt),
            translateText(formData.expectedOutcome, src, tgt),
            translateText(formData.targetUsers, src, tgt),
            translateText(formData.technicalRequirements, src, tgt),
            translateText(formData.integrations, src, tgt),
            translateText(formData.additionalNotes, src, tgt),
          ]);
          englishTranslation = { workflowName, description, businessProblem, expectedOutcome, targetUsers, technicalRequirements, integrations, additionalNotes };
          autoTranslated = (
            workflowName !== formData.workflowName ||
            description !== formData.description ||
            businessProblem !== formData.businessProblem ||
            expectedOutcome !== formData.expectedOutcome ||
            targetUsers !== formData.targetUsers ||
            technicalRequirements !== formData.technicalRequirements ||
            integrations !== formData.integrations ||
            additionalNotes !== formData.additionalNotes
          );
        } catch (e) {
          console.warn('Auto-translation failed; proceeding with original values.');
        }
      }

      const { error } = await supabase
        .from('workflow_access_requests')
        .insert({
          user_id: user?.id || null,
          workflow_id: 'custom', // Special ID for custom workflows
          workflow_name: `Custom: ${formData.workflowName}`,
          status: 'pending',
          company_name: formData.targetUsers || 'Not specified',
          industry: formData.businessProblem.substring(0, 100), // Use business problem as industry
          use_case: formData.description,

          timeline: formData.timeline,
          additional_requirements: JSON.stringify({
            businessProblem: formData.businessProblem,
            expectedOutcome: formData.expectedOutcome,
            targetUsers: formData.targetUsers,
            urgency: formData.urgency,
            technicalRequirements: formData.technicalRequirements,
            integrations: formData.integrations,
            additionalNotes: formData.additionalNotes,
            requestType: 'custom_workflow',
            submittedLanguage: i18n.language,
            englishTranslation,
            needsTranslation,
            translationSource: translateEndpointConfigured ? 'server' : 'none',
            autoTranslated
          }),
          requested_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: t('customRequestForm.toasts.submittedTitle'),
        description: t('customRequestForm.toasts.submittedDesc'),
      });

      // Reset form and close modal
      setFormData({
        workflowName: '',
        description: '',
        businessProblem: '',
        expectedOutcome: '',
        targetUsers: '',
        urgency: 'medium',
        timeline: '',
        technicalRequirements: '',
        integrations: '',
        additionalNotes: ''
      });
      onClose();

    } catch (error) {
      console.error('Error submitting custom workflow request:', error);
      toast({
        title: t('customRequestForm.toasts.failedTitle'),
        description: t('customRequestForm.toasts.failedDesc'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    const option = urgencyOptions.find(opt => opt.value === urgency);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-waselify-500" />
            {t('customRequestForm.dialogTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('customRequestForm.dialogDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">{t('customRequestForm.headerTitle')}</h3>
                <p className="text-blue-800 text-sm">
                  {t('customRequestForm.headerBody')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4" />
                {t('customRequestForm.basicInfo')}
              </h3>

              <div>
                <Label htmlFor="workflowName">{t('customRequestForm.workflowName')}</Label>
                <Input
                  id="workflowName"
                  value={formData.workflowName}
                  onChange={(e) => handleInputChange('workflowName', e.target.value)}
                  placeholder={t('customRequestForm.placeholders.workflowName')}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">{t('customRequestForm.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('customRequestForm.placeholders.description')}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessProblem">{t('customRequestForm.businessProblem')}</Label>
                <Textarea
                  id="businessProblem"
                  value={formData.businessProblem}
                  onChange={(e) => handleInputChange('businessProblem', e.target.value)}
                  placeholder={t('customRequestForm.placeholders.businessProblem')}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="expectedOutcome">{t('customRequestForm.expectedOutcome')}</Label>
                <Textarea
                  id="expectedOutcome"
                  value={formData.expectedOutcome}
                  onChange={(e) => handleInputChange('expectedOutcome', e.target.value)}
                  placeholder={t('customRequestForm.placeholders.expectedOutcome')}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="targetUsers">{t('customRequestForm.targetUsers')}</Label>
                <Input
                  id="targetUsers"
                  value={formData.targetUsers}
                  onChange={(e) => handleInputChange('targetUsers', e.target.value)}
                  placeholder={t('customRequestForm.placeholders.targetUsers')}
                />
              </div>
            </div>

            {/* Requirements & Timeline */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('customRequestForm.requirementsTimeline')}
              </h3>

              <div>
                <Label htmlFor="urgency">{t('customRequestForm.urgencyLevel')}</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={option.color}>{option.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>



              <div>
                <Label htmlFor="timeline">{t('customRequestForm.timeline')}</Label>
                <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('customRequestForm.timeline')} />
                  </SelectTrigger>
                  <SelectContent>
                    {timelineOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="technicalRequirements">{t('customRequestForm.technicalRequirements')}</Label>
                <Textarea
                  id="technicalRequirements"
                  value={formData.technicalRequirements}
                  onChange={(e) => handleInputChange('technicalRequirements', e.target.value)}
                  placeholder={t('customRequestForm.placeholders.technicalRequirements')}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="integrations">{t('customRequestForm.integrations')}</Label>
                <Textarea
                  id="integrations"
                  value={formData.integrations}
                  onChange={(e) => handleInputChange('integrations', e.target.value)}
                  placeholder={t('customRequestForm.placeholders.integrations')}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="additionalNotes">{t('customRequestForm.additionalNotes')}</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder={t('customRequestForm.placeholders.additionalNotes')}
              rows={4}
            />
          </div>

          {/* Current Urgency Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{t('customRequestForm.currentPriority')}</span>
                <Badge className={getUrgencyColor(formData.urgency)}>
                  {urgencyOptions.find(opt => opt.value === formData.urgency)?.label}
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                {t('customRequestForm.priorityHint')}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-waselify-500 hover:bg-waselify-600"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('customRequestForm.submitting')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('customRequestForm.submit')}
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
              {t('customRequestForm.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomWorkflowRequestForm; 
