'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

export default function ProfessionalPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}) {
  const generatePageNumbers = () => {
    const pages = []
    const delta = 2 // Number of pages to show on each side of current page

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > delta + 3) {
        pages.push('ellipsis-start')
      }

      // Add pages around current page
      const start = Math.max(2, currentPage - delta)
      const end = Math.min(totalPages - 1, currentPage + delta)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - delta - 2) {
        pages.push('ellipsis-end')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <motion.div 
      className={`pagination-professional ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Previous Button */}
      <motion.button
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
        whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
        transition={{ type: "spring", bounce: 0.3 }}
      >
        <ChevronLeft size={18} />
      </motion.button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
          return (
            <div key={`ellipsis-${index}`} className="pagination-ellipsis">
              <MoreHorizontal size={16} />
            </div>
          )
        }

        return (
          <motion.button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
            whileHover={{ scale: currentPage !== page ? 1.05 : 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {page}
          </motion.button>
        )
      })}

      {/* Next Button */}
      <motion.button
        className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
        whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
        transition={{ type: "spring", bounce: 0.3 }}
      >
        <ChevronRight size={18} />
      </motion.button>

      {/* Page Info */}
      <motion.div 
        className="ml-4 text-sm text-white/80 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Page {currentPage} of {totalPages}
      </motion.div>
    </motion.div>
  )
}

// Enhanced Pagination Component with More Features
export function AdvancedPagination({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = '',
  showItemsPerPage = true,
  showTotalItems = true
}) {
  const itemsPerPageOptions = [5, 10, 20, 50, 100]
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <motion.div 
      className={`flex flex-col lg:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl backdrop-blur-sm shadow-xl ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Items per page selector */}
      {showItemsPerPage && (
        <motion.div 
          className="flex items-center gap-3 text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm font-medium">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="select select-sm bg-white/20 border-white/30 text-white backdrop-blur-sm focus:bg-white/30 focus:border-white/50"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option} className="text-gray-800">
                {option}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Pagination Controls */}
      <ProfessionalPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {/* Total items info */}
      {showTotalItems && (
        <motion.div 
          className="text-white/90 text-sm font-medium"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Showing {startItem}-{endItem} of {totalItems} items
        </motion.div>
      )}
    </motion.div>
  )
}
