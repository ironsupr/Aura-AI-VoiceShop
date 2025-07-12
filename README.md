# 🛍️ Aura AI VoiceShop

A modern e-commerce platform with AI-powered voice shopping capabilities built with React, TypeScript, and Vite.

## ✨ Features

- **🎤 Voice Shopping**: AI-powered voice assistant for hands-free shopping experience
- **📱 Modern UI**: Clean, responsive design built with Tailwind CSS
- **🛒 Shopping Cart**: Full cart management with add, remove, and update functionality
- **🔍 Product Search**: Advanced search and filtering capabilities
- **🎯 Product Details**: Detailed product pages with specifications and reviews
- **💳 Checkout Process**: Streamlined checkout with multiple payment options
- **👤 User Authentication**: Secure login and user management
- **📋 Order Tracking**: Real-time order status and tracking
- **🎁 Deals & Offers**: Special promotions and daily deals

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ironsupr/Aura-AI-VoiceShop.git
cd Aura-AI-VoiceShop
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State Management**: React Context API

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   ├── ProductCard.tsx # Product display card
│   ├── VoiceAssistant.tsx    # AI voice assistant
│   └── VoiceSearchModal.tsx  # Voice search modal
├── context/            # React context providers
│   ├── CartContext.tsx # Shopping cart state
│   └── VoiceContext.tsx # Voice assistant state
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── ProductListingPage.tsx  # Product catalog
│   ├── ProductDetailPage.tsx   # Product details
│   ├── CartPage.tsx    # Shopping cart
│   ├── CheckoutPage.tsx # Checkout process
│   └── LoginPage.tsx   # User authentication
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## 🎤 Voice Commands

The AI voice assistant supports various commands:

- **Search**: "Find iPhones", "Show me laptops", "Search for headphones"
- **Cart**: "Show my cart", "Add to cart", "Remove from cart"
- **Navigation**: "Go to checkout", "Show deals", "View my orders"
- **Orders**: "Track my order", "Order status", "My recent orders"

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

This project uses:
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code linting
- Prettier for code formatting

## 🎨 Customization

### Styling
The project uses Tailwind CSS for styling. You can customize the theme by modifying `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
      },
    },
  },
}
```

### Voice Features
Voice functionality is managed through the `VoiceContext`. You can extend voice commands by modifying the context provider and adding new command handlers.

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` folder to Netlify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🐛 Issues

If you encounter any issues or have suggestions, please [create an issue](https://github.com/ironsupr/Aura-AI-VoiceShop/issues) on GitHub.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the fast build tool
- Tailwind CSS for the utility-first CSS framework
- Lucide React for the beautiful icons

## 📧 Contact

For questions or support, please contact:
- GitHub: [@ironsupr](https://github.com/ironsupr)
- Repository: [Aura-AI-VoiceShop](https://github.com/ironsupr/Aura-AI-VoiceShop)

---

Made with ❤️ by the Aura AI VoiceShop team
