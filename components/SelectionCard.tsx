import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CardConfig } from '../types';
import { Link } from 'react-router-dom';

interface SelectionCardProps {
  config: CardConfig;
  onClick?: () => void; // Optional click handler to override default link behavior
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ config, onClick }) => {
  const { title, description, Icon, themeColor, href } = config;

  // Dynamic styling based on theme
  const getThemeStyles = () => {
    switch (themeColor) {
      case 'blue':
        return 'bg-blue-50 text-blue-600 hover:shadow-blue-200 border-blue-100';
      case 'yellow':
        return 'bg-amber-50 text-amber-600 hover:shadow-orange-200 border-amber-100';
      case 'purple':
        return 'bg-purple-50 text-purple-600 hover:shadow-purple-200 border-purple-100';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getIconBg = () => {
    switch (themeColor) {
      case 'blue': return 'bg-white text-blue-500';
      case 'yellow': return 'bg-white text-amber-500';
      case 'purple': return 'bg-white text-purple-500';
    }
  };

  const CardContent = (
    <div className={`
      relative h-full p-8 rounded-3xl border-2 transition-all duration-300
      flex flex-col items-center text-center group cursor-pointer
      hover:-translate-y-2 hover:shadow-xl
      ${getThemeStyles()}
    `}>
      <div className={`
        w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm
        transition-transform duration-300 group-hover:scale-110
        ${getIconBg()}
      `}>
        <Icon size={40} strokeWidth={2} />
      </div>
      
      <h3 className="text-2xl font-bold mb-3 text-slate-800">
        {title}
      </h3>
      
      <p className="text-slate-500 mb-8 leading-relaxed font-medium">
        {description}
      </p>

      <div className="mt-auto flex items-center gap-2 font-bold opacity-80 group-hover:opacity-100 transition-opacity">
        <span>신청하기</span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );

  // If onClick is provided (e.g., for Teachers), use a div instead of a Link
  if (onClick) {
    return (
      <div onClick={onClick} role="button" className="w-full">
        {CardContent}
      </div>
    );
  }

  // Otherwise, behave like a Next.js Link
  return (
    <Link to={href} className="w-full block">
      {CardContent}
    </Link>
  );
};