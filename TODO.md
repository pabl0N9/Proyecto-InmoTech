# TODO: Dashboard Role-Based Access Control

## Task: Organize dashboard access based on user roles
- Super Admin and Admin: Full access to all modules
- Employees: Access to all modules except "Seguridad" (users and roles)

## Information Gathered
- User roles: 'Super Admin', 'Admin', 'Empleado', 'Cliente', 'Propietario'
- Navigation items defined in `src/shared/utils/navigationData.js`
- Sidebar component renders navigation items in `src/shared/components/dashboard/Sidebar/Sidebar.jsx`
- AuthContext provides user authentication and role checking via `useAuth` hook
- Backend routes already protected with role-based middleware

## Plan
- Modify `Sidebar.jsx` to conditionally filter navigation items based on user role
- Import `useAuth` hook to access user roles
- Filter out 'seguridad' module for 'Empleado' role
- Ensure Super Admin and Admin see all modules

## Dependent Files to Edit
- `src/shared/components/dashboard/Sidebar/Sidebar.jsx`

## Followup Steps
- Test dashboard rendering for different user roles
- Verify that 'seguridad' module is hidden for employees
- Confirm that Super Admin and Admin can see all modules
- Ensure navigation still works correctly after filtering
