import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";

export default function StyledMultiSelect2({
  items,
  selected,
  onSelectChange,
}: {
  selected: any | any[] | undefined;
  items: any[];
  onSelectChange: (e: any[]) => void;
}) {
  const mappedSelected = [selected].flat().filter((e) => !!e);

  return (
    <div className="flex flex-row w-full">
      <Listbox
        value={mappedSelected}
        onChange={(s) => {
          onSelectChange?.(s);
        }}
        multiple
      >
        <div className="relative mt-1 grow">
          <Listbox.Button className="relative overflow-x-hidden bg-theme-color-2 text-white w-full cursor-default rounded-l-lg  py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 sm:text-sm">
            <span className="block truncate">
              {mappedSelected?.length < 1
                ? "...."
                : mappedSelected
                    ?.map((s) => s)
                    .join(", ")
                    .slice(0, 100)}
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-md bg-theme-color-2 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {items.map((item, itemIndex) => (
                <Listbox.Option
                  key={itemIndex}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 ${
                      active ? "bg-theme-color-3 text-white" : "text-white"
                    }`
                  }
                  value={item}
                >
                  {({ selected }) => (
                    <>
                      <div
                        className={`block grow text-white truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {selected ? "* " : ""}
                        {item}
                      </div>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      <button
        className="bg-theme-color-3 hover:bg-blue-700 py-1 px-1 text-white rounded-r-lg h-[36px] mt-[4px]"
        onClick={() => {
          if (selected?.length > 0) {
            onSelectChange?.([]);
          } else {
            onSelectChange?.(items);
          }
        }}
      >
        {selected?.length > 0 ? "Clear" : "All"}
      </button>
    </div>
  );
}
