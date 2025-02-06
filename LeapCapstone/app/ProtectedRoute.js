// app/components/ProtectedRoute.js
import React from 'react';
import { Redirect } from 'expo-router'; // Correct import
import { useAuth } from './AuthContext'; // Adjust the path if needed
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Destructure loading state

    //Show a loading spinner if necessary.
  if (loading) {
    return (
        <View style = {styles.loadingContainer}>
            <ActivityIndicator size="large" />
        </View>
    )
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Redirect href={{pathname: "/login"}} />;
  }

  return children;
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default ProtectedRoute;