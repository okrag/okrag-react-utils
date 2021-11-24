import { useCallback, useEffect, useState } from "react";
import { debounce } from "okrag-utils";

type DebouncedFunction<FunctionType> = FunctionType & {
  clear: () => void;
};

export const useDebounce = <FunctionType extends Function>(func: FunctionType, deps: any[]) => {
  const [debouncedFunc, setDebouncedFunc] = useState<DebouncedFunction<FunctionType>>(
    () => (() => {}) as any,
  );

  // eslint-disable-next-line
  const memo = useCallback(func as any, [...deps]);

  useEffect(() => {
    const debounced = debounce(memo);
    setDebouncedFunc(() => debounced);
    return debounced.clear;
  }, [memo]);

  return debouncedFunc;
};
