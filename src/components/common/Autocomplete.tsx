'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'

export interface AutocompleteOption {
  value: string
  label: string
  description?: string
}

interface AutocompleteProps {
  options: AutocompleteOption[]
  value: string
  onChange: (value: string) => void
  onSearch?: (search: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  emptyMessage?: string
  loading?: boolean
}

export function Autocomplete({
  options,
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm kiếm...',
  disabled = false,
  required = false,
  className = '',
  emptyMessage = 'Không tìm thấy kết quả',
  loading = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Find selected option label
  const selectedOption = options.find((opt) => opt.value === value)

  // Filter options based on search (only if no onSearch callback - meaning client-side filter)
  const filteredOptions = onSearch
    ? options
    : options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opt.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opt.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )

  // Debounce search callback
  useEffect(() => {
    if (!onSearch) return
    const timer = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && filteredOptions[highlightIndex]) {
          handleSelect(filteredOptions[highlightIndex].value)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        setHighlightIndex(-1)
        break
    }
  }

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightIndex(-1)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearchTerm('')
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-500 bg-white dark:bg-gray-700'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400'
        }`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setHighlightIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            autoFocus
            disabled={disabled}
          />
        ) : (
          <span
            className={`flex-1 truncate ${
              selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
            }`}
          >
            {selectedOption?.label || placeholder}
          </span>
        )}
        {value && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        ) : (
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required={required}
          className="sr-only"
          tabIndex={-1}
          onChange={() => {}}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Đang tìm kiếm...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  index === highlightIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : option.value === value
                    ? 'bg-gray-50 dark:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Autocomplete
