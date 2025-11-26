import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "react-i18next";

const Newsletter = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if email already exists
      const { data: existingSubscriber } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('email', email)
        .single();

      if (existingSubscriber) {
        toast({
          title: "Already subscribed!",
          description: "This email is already subscribed to our newsletter.",
          variant: "default"
        });
        setEmail("");
        setIsSubmitting(false);
        return;
      }

      // Insert new subscriber
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) {
        console.error('Newsletter subscription error:', error);
        toast({
          title: "Subscription failed",
          description: "Please try again later or contact support.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Thank you for subscribing!",
          description: "You'll receive automation tips and updates from Waselify soon."
        });
        setEmail("");
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section id="newsletter" className="bg-white py-0">
      <div className="section-container opacity-0 animate-on-scroll">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="pulse-chip">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-waselify-500 text-white mr-2">05</span>
              <span>{t('newsletter.chip')}</span>
            </div>
          </div>
          
          <h2 className="text-5xl font-display font-bold mb-4 text-left">{t('newsletter.title')}</h2>
          <p className="text-xl text-gray-700 mb-10 text-left">
            {t('newsletter.subtitle')}
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-grow">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('newsletter.placeholder')} className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-waselify-500 text-gray-700" required />
            </div>
            <button type="submit" disabled={isSubmitting} className="bg-waselify-500 hover:bg-waselify-600 text-white font-medium py-4 px-10 rounded-full transition-all duration-300 md:ml-4">
              {isSubmitting ? t('common.loading') : t('newsletter.submit')}
            </button>
          </form>
        </div>
      </div>
    </section>;
};
export default Newsletter;