// Test component to verify role persistence
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

export default function RoleTestComponent() {
  const { roleChoice, loadRoleFromStorage, setRoleChoice, clearRoleChoice } = useAuthStore();

  useEffect(() => {
    loadRoleFromStorage();
  }, [loadRoleFromStorage]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-4">Role Persistence Test</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Current Role: </p>
        <p className="font-medium text-lg">
          {roleChoice || 'No role selected'}
        </p>
      </div>

      <div className="space-y-2">
        <button 
          onClick={() => setRoleChoice('client')}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Set as Client
        </button>
        
        <button 
          onClick={() => setRoleChoice('company')}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Set as Company
        </button>
        
        <button 
          onClick={clearRoleChoice}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Role
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Try refreshing the page - the role should persist!</p>
        <p>LocalStorage value: {localStorage.getItem('roleChoice') || 'null'}</p>
      </div>
    </div>
  );
}