// Icon reference for commonly used Heroicons in the project
// This file serves as a reference for available icons

import {
  // Navigation & UI
  HomeIcon,
  ShoppingBagIcon,
  WalletIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  
  // Product Categories
  RocketLaunchIcon,        // App Premium (replaces DevicePhoneMobileIcon for apps)
  PuzzlePieceIcon,         // Games (replaces GamepadIcon)
  DevicePhoneMobileIcon,   // Mobile Top-up
  CreditCardIcon,          // Cash Cards
  
  // Actions
  PlusIcon,
  MinusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  EyeIcon,
  
  // Status & Feedback
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  
  // Other Common Icons
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

// Solid versions for active states
import {
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  WalletIcon as WalletIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid'

// Export commonly used icon sets
export const NavigationIcons = {
  outline: {
    home: HomeIcon,
    products: ShoppingBagIcon,
    wallet: WalletIcon,
    orders: ClipboardDocumentListIcon,
    profile: UserIcon,
  },
  solid: {
    home: HomeIconSolid,
    products: ShoppingBagIconSolid,
    wallet: WalletIconSolid,
    orders: ClipboardDocumentListIconSolid,
    profile: UserIconSolid,
  }
}

export const ProductCategoryIcons = {
  appPremium: RocketLaunchIcon,
  game: PuzzlePieceIcon,
  mobile: DevicePhoneMobileIcon,
  cashCard: CreditCardIcon,
}

export const StatusIcons = {
  success: CheckCircleIcon,
  pending: ClockIcon,
  failed: XCircleIcon,
  refunded: ArrowPathIcon,
}

export const ActionIcons = {
  add: PlusIcon,
  remove: MinusIcon,
  edit: PencilIcon,
  view: EyeIcon,
  up: ArrowUpIcon,
  down: ArrowDownIcon,
}

// Icon usage examples for reference:
/*
// Basic usage:
<HomeIcon className="w-6 h-6" />

// With color:
<ShoppingBagIcon className="w-6 h-6 text-blue-600" />

// Active state (solid):
<HomeIconSolid className="w-6 h-6 text-primary-600" />

// In button:
<button className="p-2">
  <PlusIcon className="w-5 h-5" />
</button>

// Product category:
const CategoryIcon = ProductCategoryIcons.game
<CategoryIcon className="w-8 h-8 text-purple-600" />
*/
