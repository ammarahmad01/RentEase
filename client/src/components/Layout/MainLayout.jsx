
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from 'sonner';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default MainLayout;
