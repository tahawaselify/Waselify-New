import { X } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const ContactModal = ({ isOpen, onClose, title = "Get in Touch" }: ContactModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Content */}
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-display font-semibold text-gray-900">
            {title}
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Email Support</p>
              <p className="text-lg font-semibold text-gray-900">
                support@waselify.com
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            We typically respond within 24 hours during business days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactModal; 