'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface DataStreamItem {
  id: string;
  type: string;
  content: string;
  timestamp: number;
  [key: string]: unknown;
}

interface DataStreamContext {
  dataStream: DataStreamItem[] | null;
  setDataStream: (stream: DataStreamItem[] | null | ((prev: DataStreamItem[] | null) => DataStreamItem[] | null)) => void;
}

const DataStreamContext = createContext<DataStreamContext | null>(null);

export function DataStreamProvider({ children }: { children: ReactNode }) {
  const [dataStream, setDataStream] = useState<DataStreamItem[] | null>(null);

  return (
    <DataStreamContext.Provider value={{ dataStream, setDataStream }}>
      {children}
    </DataStreamContext.Provider>
  );
}

export function useDataStream() {
  const context = useContext(DataStreamContext);
  if (!context) {
    throw new Error('useDataStream must be used within a DataStreamProvider');
  }
  return context;
}

export function DataStreamHandler() {
  // This component handles data stream processing
  return null;
}
