import React, { useState } from 'react';
import { DeltaEngine, DeltaEngineX } from '../api/deltaEngine';

interface ObjectWithId {
  id: string;
}

interface UseDelta<T extends ObjectWithId> {
  initializer(): Promise<T[]>;
  predicate(x: T): boolean;
}

export function useDeltaX<T extends ObjectWithId>(
  engine: DeltaEngineX<T>,
  deps: React.DependencyList,
) {
  const [data, setData] = useState<T[]>([]);
  React.useEffect(() => {
    engine.fetch().then(setData);
  }, deps);

  const createFn = (x: T) => {
    setData((xs) => [...xs, x]);
  };

  const deleteFn = (y: T) => {
    setData((xs) => xs.filter((x) => x.id !== y.id));
  };

  React.useEffect(() => {
    engine.on('create', createFn);
    engine.on('delete', deleteFn);
    return () => {
      engine.off('create', createFn);
      engine.off('delete', deleteFn);
    };
  }, deps);

  return {
    data,
  };
}

export function useDeltaEngine<T extends ObjectWithId>(
  engine: DeltaEngine<T>,
  deps: React.DependencyList,
) {
  const [data, setData] = useState<T[]>([]);
  React.useEffect(() => {
    engine.fetch().then(setData);
  }, deps);

  React.useEffect(() => {
    const createFn = engine.onCreate((x) => {
      setData((xs) => [...xs, x]);
    });
    const deleteFn = engine.onDelete((y) => {
      setData((xs) => xs.filter((x) => x.id !== y.id));
    });
    return () => {
      engine.offCreate(createFn);
      engine.offDelete(deleteFn);
    };
  }, deps);

  return {
    data,
  };
}

export function useDelta<T extends ObjectWithId>(
  { initializer, predicate }: UseDelta<T>,
  deps: React.DependencyList,
) {
  const [data, setData] = useState<T[]>([]);

  React.useEffect(() => {
    initializer().then(setData);
  }, deps);

  return {
    data,
    setData,
    create(x: T) {
      if (predicate(x)) {
        setData((xs) => [...xs, x]);
      }
    },
    delete(d: T) {
      if (predicate(d)) {
        setData((xs) => xs.filter((x) => x.id !== d.id));
      }
    },
  };
}
