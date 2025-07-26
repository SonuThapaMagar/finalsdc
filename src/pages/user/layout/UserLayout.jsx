import { Outlet } from 'react-router-dom';
import Navbar from '../pages/Navbar';

function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar showSearch={true} /> {/* Enable search if needed */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;