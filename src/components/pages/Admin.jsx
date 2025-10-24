import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';
import '../../styles/pages/_admin.scss';

// Icon components (using Unicode symbols for better compatibility)
const Icons = {
  Users: () => <span className="icon">👥</span>,
  Admin: () => <span className="icon">👑</span>,
  Active: () => <span className="icon">✅</span>,
  Articles: () => <span className="icon">📰</span>,
  Check: () => <span className="icon">✓</span>,
  Cross: () => <span className="icon">✗</span>,
  Settings: () => <span className="icon">⚙️</span>,
  Shield: () => <span className="icon">🛡️</span>,
  Edit: () => <span className="icon">✏️</span>,
  Delete: () => <span className="icon">🗑️</span>,
  Tag: () => <span className="icon">🏷️</span>,
  Crown: () => <span className="icon">👑</span>,
  Search: () => <span className="icon">🔍</span>,
  Filter: () => <span className="icon">🔽</span>,
  Refresh: () => <span className="icon">🔄</span>
};

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Check if current user is admin or super admin
  const isAuthorized = user && (user.id === 1 || user.permissions?.can_manage_users);

  useEffect(() => {
    if (isAuthorized) {
      fetchUsersAndStats();
    }
  }, [isAuthorized]);

  const fetchUsersAndStats = async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        userAPI.getAllUsersPermissions(),
        userAPI.getAdminDashboardStats()
      ]);
      
      console.log('Users Response:', usersResponse);
      console.log('Stats Response:', statsResponse);
      
      // Handle different response structures
      const users = usersResponse?.users || usersResponse?.data?.users || usersResponse || [];
      const stats = statsResponse?.data || statsResponse || {};
      
      setUsers(Array.isArray(users) ? users : []);
      setDashboardStats(stats);
      setError('');
    } catch (err) {
      console.error('Admin data fetch error:', err);
      setError('Failed to fetch admin data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (userId, permission) => {
    try {
      const userToUpdate = users.find(u => u.user_id === userId);
      const newPermissions = {
        ...userToUpdate.permissions,
        [permission]: !userToUpdate.permissions[permission]
      };

      await userAPI.updateUserPermissions(userId, newPermissions);
      
      // Update local state
      setUsers(users.map(u => 
        u.user_id === userId 
          ? { ...u, permissions: newPermissions }
          : u
      ));
      
      setSuccessMessage(`Updated ${permission} for user ${userToUpdate.username}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update permission: ' + (err.response?.data?.error || err.message));
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.user_id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      setError('Please select users and an action');
      return;
    }

    try {
      const updates = selectedUsers.map(userId => ({
        user_id: userId,
        permissions: {
          [bulkAction]: true
        }
      }));

      await userAPI.bulkUpdatePermissions(updates);
      
      setSuccessMessage(`Bulk updated ${bulkAction} for ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setBulkAction('');
      fetchUsersAndStats(); // Refresh data
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to perform bulk action: ' + (err.response?.data?.error || err.message));
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRevokeBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      setError('Please select users and an action');
      return;
    }

    try {
      const updates = selectedUsers.map(userId => ({
        user_id: userId,
        permissions: {
          [bulkAction]: false
        }
      }));

      await userAPI.bulkUpdatePermissions(updates);
      
      setSuccessMessage(`Bulk revoked ${bulkAction} for ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setBulkAction('');
      fetchUsersAndStats(); // Refresh data
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to perform bulk action: ' + (err.response?.data?.error || err.message));
      setTimeout(() => setError(''), 5000);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="admin-page">
        <div className="error-message">
          Access Denied: You don't have permission to access this page.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-content">
          <div className="title-section">
            <Icons.Settings />
            <h1>Admin Dashboard</h1>
            {user.id === 1 && (
              <span className="super-admin-badge">
                <Icons.Crown />
                Super Admin
              </span>
            )}
          </div>
          <button 
            className="refresh-btn"
            onClick={fetchUsersAndStats}
            disabled={loading}
          >
            <Icons.Refresh />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <Icons.Cross />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="success-message">
          <Icons.Check />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card users-card">
          <div className="stat-icon">
            <Icons.Users />
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <span className="stat-number">{dashboardStats.total_users || 0}</span>
          </div>
        </div>
        <div className="stat-card admin-card">
          <div className="stat-icon">
            <Icons.Admin />
          </div>
          <div className="stat-content">
            <h3>Admin Users</h3>
            <span className="stat-number">{dashboardStats.admin_users || 0}</span>
          </div>
        </div>
        <div className="stat-card active-card">
          <div className="stat-icon">
            <Icons.Active />
          </div>
          <div className="stat-content">
            <h3>Active Users</h3>
            <span className="stat-number">{dashboardStats.active_users || 0}</span>
          </div>
        </div>
        <div className="stat-card articles-card">
          <div className="stat-icon">
            <Icons.Articles />
          </div>
          <div className="stat-content">
            <h3>Total Articles</h3>
            <span className="stat-number">{dashboardStats.total_articles || 0}</span>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bulk-actions">
        <div className="section-header">
          <Icons.Shield />
          <h3>Bulk Permission Management</h3>
          {selectedUsers.length > 0 && (
            <span className="selected-count">{selectedUsers.length} users selected</span>
          )}
        </div>
        <div className="bulk-controls">
          <button 
            onClick={handleSelectAll}
            className="select-all-btn"
          >
            <Icons.Check />
            {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
          </button>
          
          <div className="permission-selector">
            <Icons.Filter />
            <select 
              value={bulkAction} 
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-action-select"
            >
              <option value="">Select Permission Type</option>
              <option value="can_manage_users">👥 Can Manage Users</option>
              <option value="can_delete_articles">🗑️ Can Delete Articles</option>
              <option value="can_edit_tags">🏷️ Can Edit Tags</option>
            </select>
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedUsers.length === 0}
              className="bulk-grant-btn"
            >
              <Icons.Check />
              Grant ({selectedUsers.length})
            </button>
            
            <button 
              onClick={handleRevokeBulkAction}
              disabled={!bulkAction || selectedUsers.length === 0}
              className="bulk-revoke-btn"
            >
              <Icons.Cross />
              Revoke ({selectedUsers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="users-section">
        <div className="section-header">
          <Icons.Users />
          <h3>User Permissions Management</h3>
          <span className="user-count">{users.length} total users</span>
        </div>
        <div className="users-table">
          <div className="table-header">
            <div className="header-cell">
              <input
                type="checkbox"
                checked={selectedUsers.length === users.length && users.length > 0}
                onChange={handleSelectAll}
                className="select-all-checkbox"
              />
            </div>
            <div className="header-cell">ID</div>
            
            <div className="header-cell">Email</div>
            <div className="header-cell">
              <Icons.Shield />
              Manage Users
            </div>
            <div className="header-cell">
              <Icons.Delete />
              Delete Articles
            </div>
            <div className="header-cell">
              <Icons.Tag />
              Edit Tags
            </div>
            <div className="header-cell">Status</div>
          </div>
          
          {users.map(user => (
            <div key={user.user_id} className={`table-row ${user.user_id === 1 ? 'super-admin-row' : ''}`}>
              <div className="table-cell">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.user_id)}
                  onChange={() => handleUserSelection(user.user_id)}
                  disabled={user.user_id === 1} // Can't select super admin
                />
              </div>
              <div className="table-cell">
                <span className="user-id">#{user.user_id}</span>
                {user.user_id === 1 && (
                  <span className="super-admin-label">
                    <Icons.Crown />
                  </span>
                )}
              </div>
              {/* <div className="table-cell">
                <div className="user-info">
                  <span className="username">{user.username}</span>
                </div>
              </div> */}
              <div className="table-cell">
                <span className="email">{user.email}</span>
              </div>
              <div className="table-cell">
                <button
                  className={`permission-toggle ${user.permissions?.can_manage_users ? 'active' : ''}`}
                  onClick={() => handlePermissionToggle(user.user_id, 'can_manage_users')}
                  disabled={user.user_id === 1} // Super admin always has all permissions
                  title={user.user_id === 1 ? 'Super admin has all permissions' : 'Toggle manage users permission'}
                >
                  {user.permissions?.can_manage_users ? <Icons.Check /> : <Icons.Cross />}
                  <span>{user.permissions?.can_manage_users ? 'Yes' : 'No'}</span>
                </button>
              </div>
              <div className="table-cell">
                <button
                  className={`permission-toggle ${user.permissions?.can_delete_articles ? 'active' : ''}`}
                  onClick={() => handlePermissionToggle(user.user_id, 'can_delete_articles')}
                  disabled={user.user_id === 1}
                  title={user.user_id === 1 ? 'Super admin has all permissions' : 'Toggle delete articles permission'}
                >
                  {user.permissions?.can_delete_articles ? <Icons.Check /> : <Icons.Cross />}
                  <span>{user.permissions?.can_delete_articles ? 'Yes' : 'No'}</span>
                </button>
              </div>
              <div className="table-cell">
                <button
                  className={`permission-toggle ${user.permissions?.can_edit_tags ? 'active' : ''}`}
                  onClick={() => handlePermissionToggle(user.user_id, 'can_edit_tags')}
                  disabled={user.user_id === 1}
                  title={user.user_id === 1 ? 'Super admin has all permissions' : 'Toggle edit tags permission'}
                >
                  {user.permissions?.can_edit_tags ? <Icons.Check /> : <Icons.Cross />}
                  <span>{user.permissions?.can_edit_tags ? 'Yes' : 'No'}</span>
                </button>
              </div>
              <div className="table-cell">
                <span className={`status ${user.is_active ? 'active' : 'inactive'}`}>
                  {user.is_active ? <Icons.Active /> : <Icons.Cross />}
                  <span>{user.is_active ? 'Active' : 'Inactive'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {users.length === 0 && (
          <div className="empty-state">
            <Icons.Users />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
