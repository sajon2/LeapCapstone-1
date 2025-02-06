// app/_layout.js
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './AuthContext'; // Adjust path as needed
import { Redirect } from 'expo-router';



interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login if not authenticated
    return <Redirect href={{pathname: "./components/Login"}} />;
  }

  return children;
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Home' }} />
          <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
          <Stack.Screen name="login" options={{ title: 'Login' }} />
          <Stack.Screen name="admin-dashboard" options={{ title: 'Admin Dashboard' }} />
          <Stack.Screen name="employee-dashboard" options={{ title: 'Employee Dashboard' }}/>
          <Stack.Screen name="user-dashboard" options={{ title: 'User Dashboard' }} />
          <Stack.Screen name="bar/[barId]" options={{ title: 'Bar Page' }} />
          <Stack.Screen name="bar/[barId]/manage-employees" options={{ title: 'Manage Employees' }} />
          <Stack.Screen name="bar/[barId]/manage-queue" options={{ title: 'Manage Queue' }} />
          <Stack.Screen name="queue/waiting/[barId]" options={{ title: 'Waiting Page' }} />
          <Stack.Screen name="venue/[barId]" options={{ title: 'Venue Profile' }} />
          <Stack.Screen name="bar/[barId]/queue" options={{ title: 'Queue Page' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}