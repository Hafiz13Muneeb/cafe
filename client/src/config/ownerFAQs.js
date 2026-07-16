// src/config/ownerFAQs.js - Static FAQs shown to the owner in ChatWidget
// These are for the cafe owner's reference (not shown to customers)

export const ownerFAQs = [
  {
    id: 1,
    question: 'How do I add a new menu item?',
    answer:
      'Go to your Dashboard, click "Add New" under Menu Items. Fill in the title, price, category, upload an image, and click "Add Item". Your new item will appear on the public menu instantly.',
  },
  {
    id: 2,
    question: 'How can I update my cafe details?',
    answer:
      'Click the Settings icon (gear) in the top‑right corner. In the "Cafe Settings" tab, you can update your cafe name, WhatsApp number, table numbers, and slug.',
  },
  {
    id: 3,
    question: 'How do I change the theme colours?',
    answer:
      'Go to Settings → Appearance. You can set custom primary/secondary colours using the colour pickers. Toggle between Light and Dark mode as well. 3‑digit hex codes like #111 are also supported.',
  },
  {
    id: 4,
    question: 'How do I generate a QR code for my menu?',
    answer:
      'Your QR code is displayed on the Dashboard. You can download it as a PNG or copy the menu link to share it. Place the QR code on your tables for customers to scan.',
  },
  {
    id: 5,
    question: 'How do I track orders and analytics?',
    answer:
      'You can track all your analytics (views, orders, revenue) directly from the Analytics section in your Dashboard. Every customer view and order attempt is automatically tracked.',
  },
];