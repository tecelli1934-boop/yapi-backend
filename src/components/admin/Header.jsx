import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-industrial p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-secondary-800">Yönetim Paneli</h1>
      <div className="text-secondary-600">
        Hoş geldin, <span className="font-bold text-primary-600">{user?.name}</span>
      </div>
    </header>
  );
};

export default Header;