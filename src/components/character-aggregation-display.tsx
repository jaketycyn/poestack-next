import React, { useCallback, useState } from "react";
import { GenericAggregation } from "../__generated__/resolvers-types";
import { useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { StyledTooltip } from "./styled-tooltip";

export default function CharacterAggreationDisplay({
  aggregation,
  allKeys,
  totalMatches,
  localSearchString,
  includedRows = [],
  excludedRows = [],
  onSelectionChanged = (e) => {},
}: {
  aggregation: GenericAggregation | undefined | null;
  allKeys: string[];
  totalMatches: number;
  localSearchString: string;
  includedRows?: any[];
  excludedRows?: any[];
  onSelectionChanged?: (e) => void;
}) {
  if (!aggregation) {
    return <>Loading...</>;
  }

  const valueMap = {};
  for (const v of aggregation.values) {
    valueMap[v?.key ?? ""] = v.value;
  }

  const mappedRow = allKeys
    .map((key) => {
      const value = valueMap[key] ?? 0;
      return { key: key, value: value };
    })
    .filter(
      (e) =>
        !!e.key &&
        e.key !== "" &&
        !excludedRows.includes(e.key) &&
        (localSearchString.length === 0 ||
          e.key.toLowerCase().indexOf(localSearchString.toLowerCase()) >= 0)
    )
    .sort((a, b) => b.value - a.value);

  const Row = ({ index, key, style }) => (
    <div
      key={key}
      style={style}
      className="grid grid-cols-skillSidebar  items-center hover:bg-skin-primary text-xs space-x-1 pr-2 cursor-pointer"
      onClick={() => {
        onSelectionChanged?.(mappedRow[index]);
      }}
    >
      <div
        className={` truncate capitalize ${
          includedRows.includes(mappedRow[index].key)
            ? "bg-skin-primary  text-skin-accent"
            : ""
        }`}
      >
        <StyledTooltip
          texts={[`${mappedRow[index].key}`]}
          placement="left"
          className="capitalize mr-2"
        >
          <li className="list-none truncate">{mappedRow[index].key}</li>
        </StyledTooltip>
      </div>
      <div className={"text-right "}>
        {+(((mappedRow[index]?.value ?? 0) / totalMatches) * 100).toFixed(2)}%
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col flex-1 h-full">
        <div className="flex flex-col space-y-2">
          {excludedRows.map((e) => (
            <>
              <div
                key={e.key}
                className="bg-red-800 text-skin-base text-xs space-x-1 pr-2 cursor-pointer capitalize "
                onClick={() => {
                  onSelectionChanged({ key: e, value: 0 });
                }}
              >
                {e}
              </div>
            </>
          ))}
        </div>

        <div className="flex flex-col flex-1 ">
          <AutoSizer>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
                itemCount={mappedRow.length}
                itemSize={20}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>
    </>
  );
}
