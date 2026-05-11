import { useState, useRef, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import useItemsStore from "@/contexts/ItemsContext";
import type { Item } from "@/types/Item";

export default function AddBar() {
    const { items, addItem, addItembyName } = useItemsStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter items based on ID or name
    const filteredItems = items.filter((item: Item) => {
        if (!searchTerm) return false;
        const term = searchTerm.toLowerCase();
        return (
            item.id.toString().includes(term) ||
            item.name.toLowerCase().includes(term)
        );
    }).slice(0, 8); // Limit to top 8 suggestions

    const handleAddItem = (id: number) => {
        addItem(id);
        setSearchTerm("");
        setIsOpen(false);
    };

    const handleAddItemByName = (name: string) => {
        addItembyName(name);
        setSearchTerm("");
        setIsOpen(false);
    }

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex-1 max-w-xl relative" ref={dropdownRef}>
            <div className="relative flex items-center">
                <Search className="absolute left-3 text-gray-400" size={18} />
                <input
                    type="text"
                    value={searchTerm}
                    autoFocus
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (searchTerm) setIsOpen(true);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            const exactMatch = items.find((item: Item) => item.id.toString() === searchTerm);
                            if (exactMatch) {
                                handleAddItem(exactMatch.id);
                            } else if (filteredItems.length > 0) {
                                handleAddItem(filteredItems[0].id);
                            } else if (searchTerm !== '' && !Number.isNaN(+searchTerm)) {
                                handleAddItem(+searchTerm);
                            } else if (searchTerm != '') {
                                handleAddItemByName(searchTerm);
                            }
                        }
                    }}
                    placeholder="Поиск по ID или названию..."
                    className="w-full bg-[#f0f2f1] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
                />
            </div>

            {/* Dropdown helper */}
            {isOpen && filteredItems.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <ul className="max-h-[300px] overflow-y-auto">
                        {filteredItems.map((item: Item) => (
                            <li
                                key={item.id}
                                onClick={() => handleAddItem(item.id)}
                                className="group flex justify-between items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                                        {item.name}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        ID: {item.id.toString()} • В наличии: {item.amount} шт.
                                    </span>
                                </div>
                                <div className="text-gray-300 group-hover:text-gray-600 transition-colors">
                                    <Plus size={18} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}