import React, { createContext, useContext, useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/shared/utils/cn"

const SelectContext = createContext()

const Select = ({ value, onValueChange, children, ...props }) => {
  const [internalValue, setInternalValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    if (onValueChange) {
      onValueChange(newValue)
    }
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <SelectContext.Provider value={{
      value: currentValue,
      onValueChange: handleValueChange,
      isOpen,
      setIsOpen
    }}>
      <div ref={selectRef} className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = useContext(SelectContext)

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 transition-all duration-200 ease-out hover:border-slate-400 hover:shadow-sm",
        isOpen && "ring-2 ring-blue-500 ring-offset-1 border-blue-500 shadow-md",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className={cn(
        "h-4 w-4 opacity-60 transition-transform duration-200 ease-out",
        isOpen && "rotate-180"
      )} />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, ...props }) => {
  const { value } = useContext(SelectContext)
  
  return (
    <span {...props}>
      {value || placeholder}
    </span>
  )
}

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen } = useContext(SelectContext)
  const contentRef = useRef(null)

  // Auto-scroll functionality when dropdown opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Small delay to ensure the dropdown is rendered and positioned
      const timeoutId = setTimeout(() => {
        if (contentRef.current) {
          const dropdown = contentRef.current
          const rect = dropdown.getBoundingClientRect()

          // Find the modal content container (parent with overflow-y-auto)
          let scrollableContainer = dropdown.closest('[class*="overflow-y-auto"]') ||
                                   dropdown.closest('[class*="overflow-auto"]') ||
                                   dropdown.closest('.overflow-y-auto') ||
                                   dropdown.closest('.overflow-auto')

          if (scrollableContainer) {
            // Get the container's bounding rect and scroll position
            const containerRect = scrollableContainer.getBoundingClientRect()
            const containerScrollTop = scrollableContainer.scrollTop
            const containerHeight = scrollableContainer.clientHeight

            // Calculate dropdown position relative to container
            const dropdownTop = rect.top - containerRect.top + containerScrollTop
            const dropdownBottom = dropdownTop + rect.height

            // Check if dropdown extends beyond container
            if (dropdownBottom > containerScrollTop + containerHeight) {
              // Calculate how much to scroll within the container
              const scrollAmount = dropdownBottom - (containerScrollTop + containerHeight) + 20 // 20px padding

              // Smooth scroll the container to make dropdown fully visible
              scrollableContainer.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
              })
            }
          } else {
            // Fallback to window scroll if no container found
            const windowHeight = window.innerHeight
            if (rect.bottom > windowHeight) {
              const scrollAmount = rect.bottom - windowHeight + 20
              window.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
              })
            }
          }
        }
      }, 50) // Small delay to ensure DOM is updated

      return () => clearTimeout(timeoutId)
    }
  }, [isOpen])

  return (
    <div
      ref={(el) => {
        contentRef.current = el
        if (ref) ref.current = el
      }}
      className={cn(
        "absolute z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-xl w-full top-full mt-1 transition-all duration-300 ease-out backdrop-blur-sm",
        isOpen
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto animate-in slide-in-from-top-2 fade-in-0 zoom-in-95"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none animate-out slide-out-to-top-2 fade-out-0 zoom-out-95",
        className
      )}
      style={{
        transformOrigin: 'top center',
        animationFillMode: 'forwards'
      }}
      {...props}
    >
      <div className="p-1.5">
        {children}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { value: currentValue, onValueChange } = useContext(SelectContext)
  const isSelected = currentValue === value

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm outline-none transition-all duration-200 ease-out",
        "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-900 hover:shadow-md hover:scale-[1.02]",
        "focus:bg-gradient-to-r focus:from-gray-100 focus:to-gray-50 focus:text-gray-900 focus:shadow-sm",
        isSelected && "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-900 font-semibold shadow-sm",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center transition-all duration-200">
        {isSelected && (
          <Check className="h-4 w-4 text-blue-600 animate-in zoom-in-50 duration-200" />
        )}
      </span>
      {children}
    </div>
  )
})

SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
