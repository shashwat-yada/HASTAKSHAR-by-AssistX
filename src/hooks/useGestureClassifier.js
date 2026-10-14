import { useCallback, useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as knnClassifier from "@tensorflow-models/knn-classifier";

const STORAGE_KEY = "hastakshar.knn.v1";

/**
 * useGestureClassifier — a "teachable machine"-style trainable classifier
 * that lives entirely in the browser: no server, no Python training step.
 * Add a few labeled examples per sign, then predict live. Examples persist
 * to localStorage so a trained set survives page reloads.
 */
export function useGestureClassifier() {
  const classifierRef = useRef(null);
  const [counts, setCounts] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    classifierRef.current = knnClassifier.create();
    tryRestore();
    setReady(true);
    return () => classifierRef.current?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshCounts() {
    setCounts(classifierRef.current?.getClassExampleCount() || {});
  }

  function tryRestore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const dataset = {};
      Object.entries(parsed).forEach(([label, { data, shape }]) => {
        dataset[label] = tf.tensor(data, shape);
      });
      classifierRef.current.setClassifierDataset(dataset);
      refreshCounts();
    } catch {
      // ignore corrupt/missing storage
    }
  }

  function persist() {
    const dataset = classifierRef.current.getClassifierDataset();
    const serializable = {};
    Object.entries(dataset).forEach(([label, tensor]) => {
      serializable[label] = { data: Array.from(tensor.dataSync()), shape: tensor.shape };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }

  const addExample = useCallback((features, label) => {
    if (!label) return;
    tf.tidy(() => {
      const tensor = tf.tensor1d(features);
      classifierRef.current.addExample(tensor, label);
    });
    refreshCounts();
    persist();
  }, []);

  const predict = useCallback(async (features, k = 5) => {
    if (!classifierRef.current || classifierRef.current.getNumClasses() === 0) return null;
    const tensor = tf.tensor1d(features);
    const result = await classifierRef.current.predictClass(tensor, k);
    tensor.dispose();
    return result; // { label, confidences: { [label]: 0..1 } }
  }, []);

  const clearLabel = useCallback((label) => {
    classifierRef.current.clearClass(label);
    refreshCounts();
    persist();
  }, []);

  const clearAll = useCallback(() => {
    classifierRef.current.clearAllClasses();
    localStorage.removeItem(STORAGE_KEY);
    refreshCounts();
  }, []);

  return { ready, counts, addExample, predict, clearLabel, clearAll };
}
