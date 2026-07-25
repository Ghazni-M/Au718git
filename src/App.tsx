/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useLocation,
} from 'react-router-dom';

// Providers
import { AuthProvider } from './lib/auth';
import { LanguageProvider } from './lib/LanguageContext';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';

// Public Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Investment } from './pages/Investment';
import { Custom } from './pages/Custom';
import { Consultation } from './pages/Consultation';
import { Locations } from './pages/Locations';

// Admin Pages
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminCategories } from './pages/AdminCategories';
import { AdminInquiries } from './pages/AdminInquiries';
import { AdminUsers } from './pages/AdminUsers';
import { AdminNewsletter } from './pages/AdminNewsletter';
import { AdminSettings } from './pages/AdminSettings';

/* -------------------------------------------------------------------------- */
/*                                SCROLL TOP                                  */
/* -------------------------------------------------------------------------- */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return null;
}

/* -------------------------------------------------------------------------- */
/*                              PUBLIC LAYOUT                                 */
/* -------------------------------------------------------------------------- */

function PublicLayout() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <Outlet />
      </main>

      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                404 PAGE                                    */
/* -------------------------------------------------------------------------- */

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-deep text-white px-6">
      <div className="text-center">
        <h1 className="text-7xl md:text-8xl font-bold text-gold mb-4">
          404
        </h1>

        <p className="text-xl md:text-2xl mb-8">
          Page Not Found
        </p>

        <a
          href="/"
          className="inline-flex items-center px-8 py-3 bg-gold text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   APP                                      */
/* -------------------------------------------------------------------------- */

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <ScrollToTop />

            <Routes>
              {/* ====================================================================== */}
              {/* PUBLIC WEBSITE ROUTES                                                  */}
              {/* ====================================================================== */}

              <Route element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/investment" element={<Investment />} />
                <Route path="/custom" element={<Custom />} />
                <Route path="/consultation" element={<Consultation />} />
                <Route path="/locations" element={<Locations />} />
              </Route>

              {/* ====================================================================== */}
              {/* ADMIN LOGIN                                                            */}
              {/* ====================================================================== */}

              <Route
                path="/admin/login"
                element={<AdminLogin />}
              />

              {/* ====================================================================== */}
              {/* PROTECTED ADMIN ROUTES                                                 */}
              {/* ====================================================================== */}

              <Route element={<ProtectedAdminRoute />}>
                <Route
                  path="/admin"
                  element={<AdminLayout />}
                >
                  <Route
                    index
                    element={<AdminDashboard />}
                  />

                  <Route
                    path="products"
                    element={<AdminProducts />}
                  />

                  <Route
                    path="categories"
                    element={<AdminCategories />}
                  />

                  <Route
                    path="inquiries"
                    element={<AdminInquiries />}
                  />

                  <Route
                    path="users"
                    element={<AdminUsers />}
                  />

                  <Route
                    path="newsletter"
                    element={<AdminNewsletter />}
                  />

                  <Route
                    path="settings"
                    element={<AdminSettings />}
                  />
                </Route>
              </Route>

              {/* ====================================================================== */}
              {/* 404                                                                     */}
              {/* ====================================================================== */}

              <Route
                path="*"
                element={<NotFound />}
              />
            </Routes>

            <Toaster
              position="top-right"
              theme="dark"
              richColors
              closeButton
            />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}