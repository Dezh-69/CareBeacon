import { useParams, useNavigate } from 'react-router';
import { Dashboard } from '../Dashboard';
import { auth } from '../../../lib/firebase';
import { ArrowLeft } from 'lucide-react';

export function AdminImpersonate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = auth.currentUser;

  if (!user || !id) {
    return <div>Missing user or family ID</div>;
  }

  return (
    <div className="relative size-full">
      {/* Top sticky banner for admin */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-warning text-warning-foreground px-4 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/families')}
            className="p-1 hover:bg-black/10 rounded-full transition"
            title="Return to Admin Dashboard"
          >
            <ArrowLeft className="size-5" />
          </button>
          <span className="text-sm font-semibold uppercase tracking-wider">
            Admin Impersonation Mode
          </span>
        </div>
        <span className="text-xs font-medium opacity-90">
          Viewing Family: {id}
        </span>
      </div>

      {/* Render the actual Dashboard but push it down slightly to account for the banner */}
      <div className="pt-10 size-full">
        <Dashboard 
          user={user} 
          impersonatedFamilyId={id} 
          onLogout={() => {}} 
        />
      </div>
    </div>
  );
}
