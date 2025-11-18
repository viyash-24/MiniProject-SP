import React, { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left hover:text-blue-600 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-5 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQsPage = () => {
  const faqs = [
    {
      category: 'General',
      questions: [
        {
          question: 'What is Smart Parking?',
          answer: 'Smart Parking is a digital platform that helps you find, reserve, and pay for parking spaces in busy urban areas. Our system provides real-time information about available parking slots, making your parking experience hassle-free.'
        },
        {
          question: 'How does Smart Parking work?',
          answer: 'Simply log in to our platform, browse available parking areas near your location, select a parking spot, register your vehicle, and make a payment. You can pay online or at the parking facility. Once you are done parking, you can exit through our system which automatically updates slot availability.'
        },
        {
          question: 'Do I need to create an account?',
          answer: 'Yes, you need to create an account to use Smart Parking. This allows us to manage your vehicle registrations, payment history, and provide a personalized experience. Registration is quick and can be done using Google or email.'
        }
      ]
    },
    {
      category: 'Parking',
      questions: [
        {
          question: 'How do I find available parking spots?',
          answer: 'After logging in, go to the "Find Parking" section. You will see a list of all available parking areas with real-time slot availability. Each parking area shows the number of free slots, location, and pricing information.'
        },
        {
          question: 'Can I reserve a parking spot in advance?',
          answer: 'Currently, our system works on a first-come, first-served basis. However, you can view real-time availability before heading to a parking area. Advanced reservation features are planned for future updates.'
        },
        {
          question: 'What types of vehicles are supported?',
          answer: 'We support various vehicle types including cars, bikes, scooters, vans, trucks, and more. Each vehicle type may have different parking rates which are clearly displayed in the parking charges section.'
        },
        {
          question: 'What happens if a parking area is full?',
          answer: 'If a parking area shows 0 available slots, you can browse other nearby parking areas. Our system updates slot availability in real-time, so you always have accurate information.'
        }
      ]
    },
    {
      category: 'Payments',
      questions: [
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept multiple payment methods including credit/debit cards through our secure Stripe integration, as well as cash payments at the parking facility. All online payments are encrypted and secure.'
        },
        {
          question: 'How are parking fees calculated?',
          answer: 'Parking fees are based on vehicle type and duration. Each parking area has standard rates per hour or per day. You can view the applicable charges for your vehicle type before making a payment.'
        },
        {
          question: 'Can I get a receipt for my payment?',
          answer: 'Yes, after successful payment, a receipt is automatically generated and sent to your registered email address. You can also view your payment history in your account dashboard.'
        },
        {
          question: 'Is my payment information secure?',
          answer: 'Absolutely. We use Stripe, an industry-leading payment processor, to handle all online transactions. Your payment information is encrypted and never stored on our servers. We follow PCI DSS compliance standards.'
        }
      ]
    },
    {
      category: 'Account & Profile',
      questions: [
        {
          question: 'How do I register my vehicle?',
          answer: 'You can register your vehicle from the Payment section. Simply enter your vehicle number plate, select the vehicle type, and provide optional contact details. You can register multiple vehicles under one account.'
        },
        {
          question: 'Can I update my profile information?',
          answer: 'Yes, you can update your profile information at any time. Contact our support team if you need to change your email address or other critical account details.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot password?" on the login page. Enter your registered email address and we will send you instructions to reset your password.'
        }
      ]
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          question: 'The website is not loading properly. What should I do?',
          answer: 'Try clearing your browser cache and cookies, then refresh the page. Make sure you are using an updated version of a modern browser like Chrome, Firefox, Safari, or Edge. If the issue persists, contact our support team.'
        },
        {
          question: 'I made a payment but did not receive confirmation. What should I do?',
          answer: 'First, check your email inbox and spam folder for the payment confirmation. If you still have not received it, contact our support team with your vehicle number and payment details. We will verify your payment and assist you.'
        },
        {
          question: 'How do I report a problem with a parking area?',
          answer: 'You can contact us through the Contact Us page with details about the issue. Include the parking area name, location, and description of the problem. Our team will investigate and resolve it promptly.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about Smart Parking
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
                  {idx + 1}
                </span>
                {category.category}
              </h2>
              <div>
                {category.questions.map((faq, faqIdx) => (
                  <FAQItem
                    key={faqIdx}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Still have questions?</h3>
          <p className="text-gray-700 mb-6">
            Cannot find the answer you are looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;
