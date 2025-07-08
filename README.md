# Seattle Coffee Store Locator

A modern, responsive React application for finding Seattle Coffee Company stores across South Africa and Namibia. Features location-based search, distance calculation, and integrated map navigation.

## 🌟 Features

- **📍 Location Services**: Share your location to find nearby stores sorted by distance
- **🔍 Smart Search**: Search by store name, address, province, or category
- **🗺️ Multi-Map Integration**: Open locations in Google Maps, Waze, or Apple Maps
- **📱 Responsive Design**: Optimized for mobile, tablet, and desktop
- **⚡ Performance Optimized**: Progressive loading with caching for fast load times
- **🏪 Complete Database**: 297+ Seattle Coffee store locations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd seattle-coffee-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# The build artifacts will be stored in the `build/` directory
```

## 🏗️ Architecture

### Project Structure

```
src/
├── components/           # React components
│   ├── StoreCard.jsx    # Individual store display
│   └── TopBar.jsx       # Application header
├── pages/               # Main pages
│   └── LocationsPage.jsx # Store listing and search
├── hooks/               # Custom React hooks
│   └── useLocation.js   # Location management
├── utils/               # Utility functions
│   ├── mapUtils.js      # Distance calculations
│   ├── coordinateMapper.js # Store coordinate mapping
│   ├── storageUtils.js  # Local storage management
│   ├── storeUtils.js    # Store filtering and utilities
│   ├── constants.js     # Application constants
│   └── index.js         # Utility exports
├── data/                # Static data
│   └── fallbackStores.js # Emergency fallback stores
└── App.jsx             # Main application component
```

### Key Technologies

- **React 18**: Modern React with hooks and concurrent features
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Beautiful, customizable icons
- **Geolocation API**: Browser-based location services
- **Local Storage**: Client-side caching for performance

## 🔧 Technical Implementation

### Location Services

The app uses a progressive location strategy:

1. **Test Mode**: Uses Bergvliet coordinates for development
2. **Geolocation API**: Requests user's actual location
3. **Fallback**: Graceful degradation if location unavailable

### Data Loading Strategy

Three-tier loading approach for optimal performance:

1. **Immediate**: Load 10 fallback stores instantly
2. **Cache**: Check for cached complete database
3. **Fresh Data**: Fetch complete 297-store database

### Coordinate Mapping

Advanced coordinate assignment system:
- **Precise Coordinates**: 50+ major cities with exact coordinates
- **Province Fallbacks**: Regional defaults for unmatched stores
- **Final Fallback**: Ensures every store gets coordinates

### Distance Calculations

Uses the Haversine formula for accurate distance calculations between coordinates, accounting for Earth's curvature.

## 🎯 Features Deep Dive

### Store Search & Filtering

- **Text Search**: Name, address, province, category matching
- **Region Filter**: Filter by province/region
- **Real-time Results**: Instant filtering as you type

### Map Integration

Three map options for maximum compatibility:
- **Google Maps**: Full-featured web maps
- **Waze**: Navigation-focused with traffic
- **Apple Maps**: Native iOS integration

### Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: Tailored layouts for different screen sizes
- **Touch-Friendly**: Large buttons and intuitive gestures

## 🛠️ Development

### Code Quality Standards

- **Modular Architecture**: Separated concerns with utility functions
- **Custom Hooks**: Reusable logic with `useLocation`
- **Performance Optimized**: Memoization and efficient re-renders
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Accessibility**: ARIA labels and keyboard navigation

### Adding New Features

1. **Utilities**: Add reusable logic to `/src/utils/`
2. **Components**: Create modular components in `/src/components/`
3. **Hooks**: Extract stateful logic to `/src/hooks/`
4. **Constants**: Add configuration to `/src/utils/constants.js`

### Performance Considerations

- **Code Splitting**: Dynamic imports for fallback stores
- **Caching**: 24-hour local storage cache
- **Debouncing**: Search input optimization
- **Memoization**: React.useMemo for expensive operations

## 📱 Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

The app is ready for deployment to any static hosting service:

- **Netlify**: Drop the `build/` folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Use `npm run build` and deploy `/build`
- **AWS S3**: Upload build artifacts to S3 bucket

## 📊 Data Sources

- **Store Database**: 297 Seattle Coffee locations
- **Coordinates**: Manually curated precise coordinates
- **Fallback Data**: Emergency dataset for reliability

## 🔄 Future Enhancements

- **Real-time Hours**: Live store hours integration
- **Reviews**: Customer ratings and reviews
- **Favorites**: Save favorite store locations
- **Offline Mode**: PWA capabilities for offline access
- **Push Notifications**: Location-based store alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the GitHub Issues page
- Review the code documentation
- Test with the built-in development tools

---

Built with ❤️ for Seattle Coffee Company customers across South Africa and Namibia.