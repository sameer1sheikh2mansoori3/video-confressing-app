import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/store";
import LogoutIcon from '@mui/icons-material/Logout';
import SharedButton from "../shared/ui/Button";
export default function Dashboard() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="dashboard">
      <h1>Dashboard</h1>

      <p>Welcome, {user?.username || "User"}!</p>

      <p>{user?.email}</p>

      <SharedButton onClick={handleLogout} text="Logout"><LogoutIcon /></SharedButton>
    </main>
  );
}