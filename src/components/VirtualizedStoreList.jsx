import React, { useCallback, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import StoreCard from './StoreCard';
import { MapPin } from 'lucide-react';

const VirtualizedStoreList = ({ stores }) => {
  const [listHeight, setListHeight] = useState(600);
  const [itemHeight, setItemHeight] = useState(280);
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const padding = width < 640 ? 32 : 48;
      const availableWidth = width - padding;
      
      let columns = 1;
      if (width >= 1024) {
        columns = 3;
      } else if (width >= 640) {
        columns = 2;
      }
      
      setColumnCount(columns);
      setItemHeight(width < 640 ? 240 : 280);
      
      const headerHeight = 400;
      const availableHeight = window.innerHeight - headerHeight;
      setListHeight(Math.max(400, availableHeight));
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const rowCount = Math.ceil(stores.length / columnCount);

  const Row = useCallback(({ index, style }) => {
    const startIndex = index * columnCount;
    const items = [];
    
    for (let i = 0; i < columnCount; i++) {
      const storeIndex = startIndex + i;
      if (storeIndex < stores.length) {
        items.push(
          <div key={storeIndex} className="px-2 sm:px-3">
            <StoreCard store={stores[storeIndex]} />
          </div>
        );
      }
    }
    
    return (
      <div style={style} className="flex px-2 sm:px-3 py-2">
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