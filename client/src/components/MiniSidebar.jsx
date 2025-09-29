// // MiniSidebar.jsx
// // Toggleable sidebar with RBAC-based links, RTL compatibility, and i18n

// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';

// const MiniSidebar = () => {
//   const [isOpen, setIsOpen] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);
//   const { t, i18n } = useTranslation();

//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   const role = user?.role;

//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       setIsOpen(!mobile);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const toggleSidebar = () => setIsOpen(prev => !prev);
//   const isRTL = i18n.language === 'ar';

//   return (
//     <>
//       <div
//         className="sidebar"
//         style={{
//           ...(isRTL
//             ? { right: isOpen ? '0px' : '-100px', left: 'auto' }
//             : { left: isOpen ? '0px' : '-100px', right: 'auto' }),
//           transition: 'all 0.4s ease',
//           zIndex: 1000
//         }}
//       >
//         <button
//             onClick={toggleSidebar}
//             className={!isOpen ? 'sidebar-closed-toggle' : ''}
//             style={{
//               position: isOpen ? 'absolute' : 'fixed',
//               top: '50%',
//               ...(isRTL
//                 ? { left: isOpen ? '-20px' : 'auto', right: isOpen ? 'auto' : '0' }
//                 : { right: isOpen ? '-20px' : 'auto', left: isOpen ? 'auto' : '0' }),
//               transform: 'translateY(-50%)',
//               width: '36px',
//               height: '36px',
//               borderRadius: '50%',
//               backgroundColor: '#0D234B',
//               color: '#fff',
//               border: 'none',
//               fontSize: '18px',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
//               cursor: 'pointer',
//               zIndex: 1001
//             }}
//           >

//           <i
//             className={`bi ${
//               isRTL
//                 ? isOpen ? 'bi-chevron-right' : 'bi-chevron-left'
//                 : isOpen ? 'bi-chevron-left' : 'bi-chevron-right'
//             }`}
//           ></i>
//         </button>

//         <Link to="/" className="sidebar-link">
//           <div className="icon-label">
//             <span role="img" aria-label="Home">🏠</span>
//             <span className="label">{t('sidebar.home')}</span>
//           </div>
//         </Link>

//         {role === 'staff' && (
//           <Link to="/metrics" className="sidebar-link">
//             <div className="icon-label">
//               <span role="img" aria-label="Metrics">📊</span>
//               <span className="label">{t('sidebar.metrics')}</span>
//             </div>
//           </Link>
//         )}

//         <Link to="/ticket-booking" className="sidebar-link">
//           <div className="icon-label">
//             <span role="img" aria-label="Tickets">🎟️</span>
//             <span className="label">{t('sidebar.tickets')}</span>
//           </div>
//         </Link>

//         {role !== 'visitor' && (
//           <Link to="/venue-booking" className="sidebar-link">
//             <div className="icon-label">
//               <span role="img" aria-label="Venues">🏛️</span>
//               <span className="label">{t('sidebar.venues')}</span>
//             </div>
//           </Link>
//         )}

//         <Link to="/my-bookings" className="sidebar-link">
//           <div className="icon-label">
//             <span role="img" aria-label="My Bookings">📝</span>
//             <span className="label">{t('sidebar.myBookings')}</span>
//           </div>
//         </Link>
//       </div>
//     </>
//   );
// };

// export default MiniSidebar;
