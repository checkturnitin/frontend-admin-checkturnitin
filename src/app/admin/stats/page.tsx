import React from 'react';
import Link from 'next/link';
import { IconUsers, IconCreditCard, IconShoppingCart, IconUserPlus } from "@tabler/icons-react";

const StatsPage = () => {
  const stats = [
    { name: 'Users', href: '/admin/stats/users', icon: IconUsers },
    { name: 'Credits', href: '/admin/stats/credits', icon: IconCreditCard },
    { name: 'Purchases', href: '/admin/stats/purchases', icon: IconShoppingCart },
  ];

  return (
    <div className="container mx-auto p-8 bg-black min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Statistics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.name}>
            <div className="rounded-xl p-6 bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-blue-900 rounded-full">
                  <stat.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-center text-white">{stat.name}</h2>
                <p className="text-gray-400 text-center">View statistics</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StatsPage;