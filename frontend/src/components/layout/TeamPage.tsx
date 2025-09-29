import { useApp } from '../../context/AppContext';

export default function TeamPage() {
  const { state } = useApp();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">This page will show team members and collaboration tools.</p>
        <p className="text-sm text-gray-500 mt-2">Currently logged in as: {state.user?.role}</p>
      </div>
    </div>
  );
}
