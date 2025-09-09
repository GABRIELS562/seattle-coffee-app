import React, { useCallback, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import StoreCard from './StoreCard';
import { MapPin } from 'lucide-react';

const VirtualizedStoreList = ({ stores }) => {
  const [listHeight, setListHeight] = useState(600);
  const [itemHeight, setItemHeight] = useState(320);
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const padding = width < 640 ? 32 : width < 768 ? 48 : 64;
      const availableWidth = width - padding;
      
      let columns = 1;
      let height = 320; // Increased base height for better content display
      
      if (width >= 1024) {
        columns = 3;
        height = 340;
      } else if (width >= 640) {
        columns = 2;
        height = 330;
      } else {
        columns = 1;
        height = 320; // Adequate height for mobile content
      }
      
      setColumnCount(columns);
      setItemHeight(height);
      
      // Better responsive height calculation
      const headerHeight = width < 640 ? 350 : 400;
      const availableHeight = window.innerHeight - headerHeight;
      const minHeight = width < 640 ? 400 : 500;
      setListHeight(Math.max(minHeight, availableHeight));
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const rowCount = Math.ceil(stores.length / columnCount);

  const Row = useCallback(({ index, style }) => {
    const startIndex = index * columnCount;
    const items = [];
    const gapClass = columnCount === 1 ? 'gap-3' : columnCount === 2 ? 'gap-4' : 'gap-6';
    const paddingClass = columnCount === 1 ? 'px-2' : columnCount === 2 ? 'px-3' : 'px-4';
    
    for (let i = 0; i < columnCount; i++) {
      const storeIndex = startIndex + i;
      if (storeIndex < stores.length) {
        items.push(
          <div key={storeIndex} className="flex-1">
            <StoreCard store={stores[storeIndex]} />
          </div>
        );
      } else {
        // Add empty placeholder to maintain grid structure
        items.push(
          <div key={`empty-${i}`} className="flex-1">
            {/* Empty placeholder */}
          </div>
        );
      }
    }
    
    return (
      <div style={style} className={`flex ${gapClass} ${paddingClass} py-3`}>
        {items}
      </div>
    );
  }, [stores, columnCount]);

  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No stores found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <List
      height={listHeight}
      itemCount={rowCount}
      itemSize={itemHeight}
      width="100%"
      className="scrollbar-thin"
    >
      {Row}
    </List>
  );
};

export default VirtualizedStoreList;