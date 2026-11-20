"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type SearchableComboboxOption = {
  id: string;
  label: string;
};

interface SearchableComboboxProps {
  id?: string;
  options: SearchableComboboxOption[];
  value: string;
  onChange: (id: string, option: SearchableComboboxOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  icon?: ReactNode;
  emptyMessage?: string;
  className?: string;
}

function normalize(text: string) {
  return text
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Combobox con búsqueda en el mismo input: filtra opciones al escribir y
 * mantiene la selección sincronizada por id.
 */
export default function SearchableCombobox({
  id,
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
  error = false,
  icon,
  emptyMessage = "Sin resultados",
  className = "",
}: SearchableComboboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value],
  );

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Al cerrar, el input muestra la opción seleccionada; al abrir, se filtra por `query`.
  const inputValue = open ? query : (selectedOption?.label ?? "");

  const filteredOptions = useMemo(() => {
    if (!open) return options;
    const q = normalize(query.trim());
    if (!q) return options;
    return options.filter((o) => normalize(o.label).includes(q));
  }, [options, query, open]);

  const updateDropdownPosition = () => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateDropdownPosition();
  }, [open, query, filteredOptions.length]);

  useEffect(() => {
    if (!open) return;
    const onReposition = () => updateDropdownPosition();
    window.addEventListener("resize", onReposition);
    // Captura scroll de contenedores (p.ej. el cuerpo del modal).
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setQuery("");
      setActiveIndex(-1);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const closeDropdown = () => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  };

  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setActiveIndex(-1);
  };

  const selectOption = (option: SearchableComboboxOption) => {
    onChange(option.id, option);
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  };

  const handleInputChange = (valueText: string) => {
    setQuery(valueText);
    if (!open) setOpen(true);
    setActiveIndex(0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setQuery("");
        setActiveIndex(0);
        return;
      }
      setActiveIndex((i) =>
        filteredOptions.length === 0 ? -1 : Math.min(i + 1, filteredOptions.length - 1),
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return;
      setActiveIndex((i) => (filteredOptions.length === 0 ? -1 : Math.max(i - 1, 0)));
      return;
    }

    if (e.key === "Enter") {
      if (open && activeIndex >= 0 && filteredOptions[activeIndex]) {
        e.preventDefault();
        selectOption(filteredOptions[activeIndex]);
      }
      return;
    }

    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        closeDropdown();
      }
      return;
    }

    if (e.key === "Tab") {
      if (open) closeDropdown();
    }
  };

  const handleBlur = () => {
    // El cierre real por click fuera se maneja en mousedown; aquí revertimos
    // si el foco sale sin seleccionar (p.ej. Tab).
    setTimeout(() => {
      const active = document.activeElement;
      if (
        containerRef.current?.contains(active) ||
        listRef.current?.contains(active)
      ) {
        return;
      }
      if (open) {
        closeDropdown();
      }
    }, 0);
  };

  const showDropdown = open && !disabled && dropdownStyle;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {icon && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none z-10">
          {icon}
        </span>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        value={inputValue}
        placeholder={placeholder}
        onFocus={() => {
          openDropdown();
        }}
        onClick={() => {
          if (!open) openDropdown();
        }}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`w-full py-[9px] pr-8 border rounded-lg text-[13px] text-gray-900 outline-none bg-white box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? "border-red-500" : "border-gray-200"
        } ${icon ? "pl-8" : "pl-3"} ${
          disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "cursor-text"
        }`}
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>

      {showDropdown &&
        typeof document !== "undefined" &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            className="fixed z-[2000] max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1"
            style={{
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
            }}
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-[13px] text-gray-400 select-none">
                {emptyMessage}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.id === value;
                const isActive = index === activeIndex;
                return (
                  <li
                    key={option.id}
                    id={`${listId}-option-${option.id}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`px-3 py-2 text-[13px] cursor-pointer ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-gray-900"
                    } ${isSelected ? "font-semibold" : "font-normal"} hover:bg-blue-50`}
                    // mousedown para seleccionar antes del blur del input.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectOption(option);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    {option.label}
                  </li>
                );
              })
            )}
          </ul>,
          document.body,
        )}
    </div>
  );
}
