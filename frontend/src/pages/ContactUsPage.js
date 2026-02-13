import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  const isValidPhone = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    return !digits || (digits.length >= 7 && digits.length <= 15);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {};
    const trimmedName = String(formData.name || '').trim();
    const trimmedEmail = String(formData.email || '').trim();
    const trimmedPhone = String(formData.phone || '').trim();
    const trimmedSubject = String(formData.subject || '').trim();
    const trimmedMessage = String(formData.message || '').trim();
    
    if (!trimmedName) errors.name = 'Full name is required';
    if (!trimmedEmail) errors.email = 'Email is required';
    else if (!isValidEmail(trimmedEmail)) errors.email = 'Please enter a valid email address';
    if (trimmedPhone && !isValidPhone(trimmedPhone)) errors.phone = 'Please enter a valid phone number';
    if (!trimmedSubject) errors.subject = 'Subject is required';
    if (!trimmedMessage) errors.message = 'Message is required';
    else if (trimmedMessage.length < 10) errors.message = 'Message must be at least 10 characters';
    
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success('Thank you for contacting us! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setFieldErrors({});
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 page-fade-in">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-slate-50 mb-4">Get in Touch</h1>
          <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Have questions or need assistance? Fill out the form below or contact us directly.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 p-10 card-elevated">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-50 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe' },
                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'john@example.com' },
                { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
                { label: 'Subject', name: 'subject', type: 'text', placeholder: 'How can we help?' }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3 border bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      fieldErrors[field.name] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-700'
                    }`}
                  />
                  {fieldErrors[field.name] && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors[field.name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Tell us more about your inquiry..."
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                    fieldErrors.message ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.message && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 btn-soft"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg p-8 card-elevated">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p className="mb-2"><span className="font-semibold">Address:</span> 123 Parking St, City Center</p>
              <p className="mb-2"><span className="font-semibold">Email:</span> support@smartparking.com</p>
              <p className="mb-2"><span className="font-semibold">Phone:</span> +1 (555) 123-4567</p>
              <p className="mb-2"><span className="font-semibold">Business Hours:</span> Mon-Fri: 9AM - 6PM</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 p-8 text-gray-900 dark:text-slate-50 card-elevated">
              <h3 className="text-xl font-bold mb-4">Need Immediate Help?</h3>
              <p className="mb-4">For urgent parking issues or technical support, call our 24/7 hotline:</p>
              <p className="text-2xl font-bold text-blue-600">+1 (555) 999-0000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
