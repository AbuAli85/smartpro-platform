import { useAuth } from "@/_core/hooks/useAuth";

export type UserRole = "user" | "admin" | "sanad_owner" | "sanad_staff" | "sme_owner" | "gig_worker" | "government_official";

export interface RolePermissions {
  // Office Management
  canCreateOffice: boolean;
  canManageOffice: boolean;
  canViewOfficeAnalytics: boolean;
  canManageStaff: boolean;
  
  // Booking Management
  canCreateBooking: boolean;
  canManageBookings: boolean;
  canViewAllBookings: boolean;
  
  // Service Marketplace
  canPostServiceRequest: boolean;
  canSubmitBids: boolean;
  canManageServiceRequests: boolean;
  
  // Content & Templates
  canManageTemplates: boolean;
  canViewTemplates: boolean;
  
  // Admin Functions
  canAccessAdminPanel: boolean;
  canManageUsers: boolean;
  canVerifyOffices: boolean;
  canViewSystemAnalytics: boolean;
  
  // Chat & Communication
  canAccessChatInbox: boolean;
  canManageCannedResponses: boolean;
  canViewChatAnalytics: boolean;
  
  // Translation Services
  canRequestTranslation: boolean;
  canProvideTranslation: boolean;
  canManageTranslations: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  user: {
    canCreateOffice: false,
    canManageOffice: false,
    canViewOfficeAnalytics: false,
    canManageStaff: false,
    canCreateBooking: true,
    canManageBookings: false,
    canViewAllBookings: false,
    canPostServiceRequest: true,
    canSubmitBids: false,
    canManageServiceRequests: false,
    canManageTemplates: false,
    canViewTemplates: true,
    canAccessAdminPanel: false,
    canManageUsers: false,
    canVerifyOffices: false,
    canViewSystemAnalytics: false,
    canAccessChatInbox: false,
    canManageCannedResponses: false,
    canViewChatAnalytics: false,
    canRequestTranslation: true,
    canProvideTranslation: false,
    canManageTranslations: false,
  },
  
  sanad_owner: {
    canCreateOffice: true,
    canManageOffice: true,
    canViewOfficeAnalytics: true,
    canManageStaff: true,
    canCreateBooking: true,
    canManageBookings: true,
    canViewAllBookings: false,
    canPostServiceRequest: false,
    canSubmitBids: true,
    canManageServiceRequests: false,
    canManageTemplates: true,
    canViewTemplates: true,
    canAccessAdminPanel: false,
    canManageUsers: false,
    canVerifyOffices: false,
    canViewSystemAnalytics: false,
    canAccessChatInbox: true,
    canManageCannedResponses: true,
    canViewChatAnalytics: true,
    canRequestTranslation: true,
    canProvideTranslation: false,
    canManageTranslations: false,
  },
  
  sanad_staff: {
    canCreateOffice: false,
    canManageOffice: false,
    canViewOfficeAnalytics: true,
    canManageStaff: false,
    canCreateBooking: false,
    canManageBookings: true,
    canViewAllBookings: false,
    canPostServiceRequest: false,
    canSubmitBids: false,
    canManageServiceRequests: false,
    canManageTemplates: false,
    canViewTemplates: true,
    canAccessAdminPanel: false,
    canManageUsers: false,
    canVerifyOffices: false,
    canViewSystemAnalytics: false,
    canAccessChatInbox: true,
    canManageCannedResponses: false,
    canViewChatAnalytics: false,
    canRequestTranslation: true,
    canProvideTranslation: false,
    canManageTranslations: false,
  },
  
  sme_owner: {
    canCreateOffice: false,
    canManageOffice: false,
    canViewOfficeAnalytics: false,
    canManageStaff: false,
    canCreateBooking: true,
    canManageBookings: false,
    canViewAllBookings: false,
    canPostServiceRequest: true,
    canSubmitBids: false,
    canManageServiceRequests: true,
    canManageTemplates: false,
    canViewTemplates: true,
    canAccessAdminPanel: false,
    canManageUsers: false,
    canVerifyOffices: false,
    canViewSystemAnalytics: false,
    canAccessChatInbox: false,
    canManageCannedResponses: false,
    canViewChatAnalytics: false,
    canRequestTranslation: true,
    canProvideTranslation: false,
    canManageTranslations: false,
  },
  
  gig_worker: {
    canCreateOffice: false,
    canManageOffice: false,
    canViewOfficeAnalytics: false,
    canManageStaff: false,
    canCreateBooking: false,
    canManageBookings: false,
    canViewAllBookings: false,
    canPostServiceRequest: false,
    canSubmitBids: false,
    canManageServiceRequests: false,
    canManageTemplates: false,
    canViewTemplates: true,
    canAccessAdminPanel: false,
    canManageUsers: false,
    canVerifyOffices: false,
    canViewSystemAnalytics: false,
    canAccessChatInbox: false,
    canManageCannedResponses: false,
    canViewChatAnalytics: false,
    canRequestTranslation: true,
    canProvideTranslation: true,
    canManageTranslations: false,
  },
  
  government_official: {
    canCreateOffice: false,
    canManageOffice: false,
    canViewOfficeAnalytics: false,
    canManageStaff: false,
    canCreateBooking: false,
    canManageBookings: false,
    canViewAllBookings: true,
    canPostServiceRequest: false,
    canSubmitBids: false,
    canManageServiceRequests: false,
    canManageTemplates: false,
    canViewTemplates: true,
    canAccessAdminPanel: false,
    canManageUsers: false,
    canVerifyOffices: true,
    canViewSystemAnalytics: true,
    canAccessChatInbox: false,
    canManageCannedResponses: false,
    canViewChatAnalytics: false,
    canRequestTranslation: true,
    canProvideTranslation: false,
    canManageTranslations: false,
  },
  
  admin: {
    canCreateOffice: true,
    canManageOffice: true,
    canViewOfficeAnalytics: true,
    canManageStaff: true,
    canCreateBooking: true,
    canManageBookings: true,
    canViewAllBookings: true,
    canPostServiceRequest: true,
    canSubmitBids: true,
    canManageServiceRequests: true,
    canManageTemplates: true,
    canViewTemplates: true,
    canAccessAdminPanel: true,
    canManageUsers: true,
    canVerifyOffices: true,
    canViewSystemAnalytics: true,
    canAccessChatInbox: true,
    canManageCannedResponses: true,
    canViewChatAnalytics: true,
    canRequestTranslation: true,
    canProvideTranslation: true,
    canManageTranslations: true,
  },
};

export function useRoleAccess() {
  const { user } = useAuth();
  
  const role = (user?.role as UserRole) || "user";
  const permissions = ROLE_PERMISSIONS[role];
  
  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  };
  
  const hasAnyPermission = (...permissionKeys: (keyof RolePermissions)[]): boolean => {
    return permissionKeys.some(key => permissions[key]);
  };
  
  const hasAllPermissions = (...permissionKeys: (keyof RolePermissions)[]): boolean => {
    return permissionKeys.every(key => permissions[key]);
  };
  
  const hasRole = (...roles: UserRole[]): boolean => {
    return roles.includes(role);
  };
  
  return {
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
}
