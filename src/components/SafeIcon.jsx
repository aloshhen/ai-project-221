/**
 * SafeIcon Component - Dynamic icon component with full Lucide React support
 * Supports ALL icons from lucide-react library via kebab-case naming
 * Prevents runtime errors with automatic fallback to HelpCircle
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Converts kebab-case to PascalCase
 * @example kebabToPascal('shopping-cart') => 'ShoppingCart'
 * @example kebabToPascal('arrow-right') => 'ArrowRight'
 */
const kebabToPascal = (str) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

/**
 * SafeIcon - Renders ANY icon from lucide-react with automatic fallback
 * 
 * Dynamically resolves icon components from the full Lucide library.
 * If an icon doesn't exist, falls back to HelpCircle with a warning.
 * 
 * @example
 * <SafeIcon name="home" size={24} />
 * <SafeIcon name="shopping-cart" className="text-blue-500" />
 * <SafeIcon name="tiktok" size={32} /> // Will work if TikTok exists in lucide-react
 * <SafeIcon name="invalid-icon" /> // Falls back to HelpCircle
 */
export const SafeIcon = ({
  name,
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
}) => {
  // Convert kebab-case to PascalCase
  const pascalName = kebabToPascal(name);
  
  // Dynamically get icon component from lucide-react
  const IconComponent = (LucideIcons as any)[pascalName];
  
  // Fallback: use HelpCircle if icon not found
  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[SafeIcon] Icon "${name}" (${pascalName}) not found in lucide-react. ` +
        `Falling back to HelpCircle. Check https://lucide.dev/icons for valid names.`
      );
    }
    
    const FallbackIcon = LucideIcons.HelpCircle;
    return (
      <FallbackIcon
        size={size}
        color={color}
        className={className}
        strokeWidth={strokeWidth}
      />
    );
  }
  
  // Render valid icon
  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
};


export default SafeIcon;
