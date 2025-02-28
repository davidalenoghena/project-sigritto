//import React from 'react';

const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      features: [
        'Up to 3 signers',
        'Basic transaction management',
        'Email notifications',
      ],
    },
    {
      name: 'Premium Plan',
      features: [
        'Up to 10 signers',
        'Advanced transaction management',
        'Priority email support',
        'Custom transaction limits',
      ],
    },
    {
      name: 'Enterprise Plan',
      features: [
        'Unlimited signers',
        'Full transaction management',
        'Dedicated account manager',
        'Custom integrations',
        '24/7 support',
      ],
    },
  ];
  
  export default function Pricing() {
    return (
      <section className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        <div className="relative z-10 py-16">
          <h2 className="text-4xl font-bold text-white text-center mb-8">Pricing Plans</h2>
          <div className="flex justify-center space-x-8">
            {plans.map((plan) => (
              <div key={plan.name} className="bg-white/[0.1] p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-2xl font-semibold text-white mb-4">{plan.name}</h3>
                <p className="text-3xl font-bold text-white mb-4">{plan.price}</p>
                <ul className="text-white mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="mb-2">{feature}</li>
                  ))}
                </ul>
                {plan.name === 'Free Plan' ? (
                  <button className="bg-purple-600 text-white py-2 px-4 rounded">Get Started</button>
                ) : (
                  <button className="bg-grey-600 text-gray-400 py-2 px-4 rounded" disabled>Coming Soon</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }