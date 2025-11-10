// src/hooks/useSmartLoader.js
import { useEffect, useState } from "react";

const useSmartLoader = (fetchFunction) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const start = performance.now();

    const fetchData = async () => {
      try {
        const result = await fetchFunction();
        setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        const end = performance.now();
        const duration = end - start;

        // Keep minimum skeleton time for very fast responses (300ms)
        const minDelay = 600;
        const delay = Math.max(minDelay - duration, 0);

        setTimeout(() => {
          setLoading(false);
        }, delay);
      }
    };

    fetchData();
  }, []);

  return { loading, data };
};

export default useSmartLoader;
