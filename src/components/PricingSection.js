import React from 'react';

const PricingSection = () => {
  const pricingPlans = [
    {
      name: 'Basic',
      price: '29',
      period: 'month',
      description: 'Perfect for beginners starting their fitness journey',
      features: [
        'Access to gym facilities',
        'Basic fitness assessment',
        'Access to standard equipment',
        '2 group classes per month',
        'Locker room access'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      name: 'Premium',
      price: '59',
      period: 'month',
      description: 'Our most popular plan for serious fitness enthusiasts',
      features: [
        'Full 24/7 gym access',
        'Complete fitness assessment',
        'Access to all equipment',
        'Unlimited group classes',
        'Personal trainer (2 sessions)',
        'Nutrition consultation',
        'Locker room & sauna access'
      ],
      buttonText: 'Get Started',
      popular: true
    },
    {
      name: 'Elite',
      price: '99',
      period: 'month',
      description: 'The ultimate fitness experience with premium perks',
      features: [
        'VIP 24/7 gym access',
        'Advanced fitness assessment',
        'Priority class booking',
        'Personal trainer (5 sessions)',
        'Custom nutrition plan',
        'Recovery sessions',
        'All amenities access',
        'Exclusive events'
      ],
      buttonText: 'Get Started',
      popular: false
    }
  ];

  return (
    <div className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Membership <span className="text-orange-500">Plans</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            Choose the plan that fits your fitness goals and lifestyle
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-lg shadow-lg border transition-transform duration-300 hover:-translate-y-2 ${
                plan.popular 
                  ? 'bg-black border-orange-500 ring-4 ring-orange-500 ring-opacity-20' 
                  : 'bg-gray-800 border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="bg-orange-500 text-white text-sm font-bold uppercase py-1 px-4 rounded-full inline-block mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4 flex items-end">
                <span className="text-4xl font-extrabold">${plan.price}</span>
                <span className="text-gray-400 ml-1">/{plan.period}</span>
              </div>
              <p className="text-gray-300 mb-6">{plan.description}</p>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg className="h-5 w-5 text-orange-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-3 px-4 rounded-md shadow font-medium transition-colors duration-300 ${
                  plan.popular 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-white hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection; 