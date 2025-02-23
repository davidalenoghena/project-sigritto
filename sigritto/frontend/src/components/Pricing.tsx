import React from 'react';

const plans = [
  {
    name: 'Free Plan',
    price: '$0',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
  {
    name: 'Pro Plan',
    price: '$49/month',
    features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
  },
  {
    name: 'Enterprise Plan',
    price: 'Contact Us',
    features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
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
              {plan.name === 'Enterprise Plan' ? (
                <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={() => alert('Contacting Dev Team...')}>Contact Us</button>
              ) : (
                <button className="bg-blue-500 text-white py-2 px-4 rounded">Get Started</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}