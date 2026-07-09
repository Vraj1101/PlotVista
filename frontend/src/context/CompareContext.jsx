/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";


const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (property) => {
    if (
      compareList.find((item) => item._id === property._id)
    ) {
      return;
    }

    if (compareList.length >= 3) {
      toast.error("Maximum 3 properties can be compared");
      return;
    }

    setCompareList([...compareList, property]);
  };

  const removeFromCompare = (id) => {
    setCompareList(
      compareList.filter((item) => item._id !== id)
    );
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () =>
  useContext(CompareContext);