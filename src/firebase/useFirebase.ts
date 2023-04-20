import { useState, useEffect } from "react";
import { database } from "./config";
import { ref, onValue, set, off, Unsubscribe } from "firebase/database";

export const useFirebase = (path: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const dbRef = ref(database, path);

    const listener: Unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      },
      (err: any) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      off(dbRef, "value", listener);
    };
  }, [path]);

  const setDataAtPath = async (newData: any) => {
    try {
      await set(ref(database, path), newData);
    } catch (err: any) {
      setError(err);
    }
  };

  return { data, loading, error, setDataAtPath };
};
