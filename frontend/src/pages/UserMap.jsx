import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import AccessibilityMap from '../components/AccessibilityMap';

const UserMap = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex pt-16">
        <SideBar />

        <div className="flex-1 p-6">
          <AccessibilityMap />
        </div>
      </div>
    </div>
  );
};

export default UserMap;
