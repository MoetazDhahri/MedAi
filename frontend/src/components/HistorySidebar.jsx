// frontend/src/components/HistorySidebar.jsx
// (Content from previous generation - includes placeholderHistory, search, collapse logic)
import React, { useState } from 'react';
import { BookOpenIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder chat history data - Replace with real session data when available
const placeholderHistory = [
  { id: 'session-1', title: 'Placeholder: Consult Notes', timestamp: '2024-05-20T10:00:00Z' },
  { id: 'session-2', title: 'Placeholder: Follow-up Qs', timestamp: '2024-05-21T15:30:00Z' },
  { id: 'session-3', title: 'Placeholder: Symptom check', timestamp: '2024-05-23T18:45:00Z' },
];

// Note: onSelectChat and onDeleteChat receive session IDs
const HistorySidebar = ({ onSelectChat, onDeleteChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredHistory = placeholderHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const variants = { // Animation variants for collapse/expand
        open: { width: '280px', opacity: 1 },
        collapsed: { width: '60px', opacity: 0.9 }, // Adjust collapsed width
    };

   const itemVariants = { // Staggered animation for list items
       hidden: { opacity: 0, x: -20 },
       visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.3 }}),
       exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

  // Function to handle clicking on a history item
  const handleItemClick = (sessionId) => {
     if (!isCollapsed) {
         console.log("HistorySidebar: Clicked session", sessionId, "(placeholder action)");
         onSelectChat(sessionId); // Call the handler passed from parent
     }
   };

  // Function to handle clicking the delete button on an item
   const handleDeleteClick = (e, sessionId) => {
       e.stopPropagation(); // Prevent triggering handleItemClick
       console.log("HistorySidebar: Deleting session", sessionId, "(placeholder action)");
       onDeleteChat(sessionId); // Call the handler passed from parent
    };


  return (
    <motion.div
      // Animation logic
      initial={false} // Prevent initial animation on load if desired
      animate={isCollapsed ? 'collapsed' : 'open'}
      variants={variants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      // Styling
      className="bg-gradient-to-b from-gray-50 to-gray-100 h-screen flex flex-col border-r border-gray-200 shadow-md overflow-hidden flex-shrink-0" // Added flex-shrink-0
     >
      {/* Header with Collapse Toggle */}
       <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-200 transition-all duration-300 flex-shrink-0`}>
         {!isCollapsed && <h2 className="text-xl font-semibold text-indigo-800 whitespace-nowrap">History</h2>}
        <button
           onClick={() => setIsCollapsed(!isCollapsed)}
           className="text-gray-500 hover:text-indigo-600 p-1 rounded hover:bg-gray-200"
           title={isCollapsed ? "Expand History" : "Collapse History"}
        >
           <BookOpenIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Search Bar (Only when expanded) */}
      <AnimatePresence>
         {!isCollapsed && (
          <motion.div
             // Animation for search bar appearance/disappearance
             initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
             className="p-3 border-b border-gray-200 flex-shrink-0" // Added flex-shrink-0
           >
             <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type="text" placeholder="Search history..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                 />
             </div>
           </motion.div>
         )}
      </AnimatePresence>


       {/* Chat Session List */}
      <div className="flex-1 overflow-y-auto">
         <AnimatePresence> {/* Animate list item changes */}
         {filteredHistory.length > 0 ? (
           filteredHistory.map((chat, index) => (
              <motion.div
                  key={chat.id} variants={itemVariants} initial="hidden" animate="visible" exit="exit" custom={index} layout
                  className={`m-2 p-3 rounded-lg hover:bg-indigo-100 cursor-pointer group transition-colors duration-200 ${isCollapsed ? 'flex justify-center tooltip' : ''}`} // Added tooltip class possibility
                  data-tip={isCollapsed ? chat.title : undefined} // Add tooltip text when collapsed
                  onClick={() => handleItemClick(chat.id)}
                 >
                  {!isCollapsed ? (
                      <div className="flex justify-between items-center">
                          <div>
                              <h3 className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-700">{chat.title}</h3>
                              <p className="text-xs text-gray-500">{new Date(chat.timestamp).toLocaleString()}</p>
                          </div>
                         {/* Delete button (only visible on hover when expanded) */}
                           <button
                             onClick={(e) => handleDeleteClick(e, chat.id)}
                             className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                             title="Delete (Action Placeholder)"
                           >
                               <TrashIcon className="w-4 h-4" />
                           </button>
                      </div>
                  ) : (
                      // Minimal view when collapsed (e.g., Icon or Initial)
                     <span className="text-indigo-700 font-bold text-lg p-1">
                         {/* Using BookOpenIcon as placeholder, replace if needed */}
                          <BookOpenIcon className="w-5 h-5" title={chat.title}/>
                     </span>
                  )}
                </motion.div>
              ))
            ) : (
                // Display message if no history / no search results (only when expanded)
                !isCollapsed && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No matches found.' : 'No placeholder history.'}
                 </motion.div>
                )
            )}
          </AnimatePresence>
      </div>
     </motion.div>
  );
};

export default HistorySidebar;