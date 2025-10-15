"use client";
import React, { ReactNode, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import UserProfileSidebar from '../../components/UserProfileSidebar';
import NavbarMenu from '../../components/Navbar-Menu';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleWishlistClick = () => {};
  const handleCartClick = () => {};

  return (
    <ProtectedRoute>
      <>
        <UserProfileSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <NavbarMenu onWishlistClick={handleWishlistClick} onCartClick={handleCartClick} />

        <div className="min-h-screen bg-gray-50">
          <div className="pt-20">
            {children}
          </div>
        </div>
      </>
    </ProtectedRoute>
  );
}


