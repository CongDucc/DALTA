import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserContextType = {
    getUserId: string;
    getUserName: string;
    isAdmin: boolean;
    setGetUserId: React.Dispatch<React.SetStateAction<string>>;
    setGetUserName: React.Dispatch<React.SetStateAction<string>>;
    setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser: () => Promise<void>;
};

export const UserType = createContext<UserContextType>({
    getUserId: '',
    getUserName: '',
    isAdmin: false,
    setGetUserId: () => { },
    setGetUserName: () => { },
    setIsAdmin: () => { },
    logoutUser: async () => { },
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [getUserId, setGetUserId] = useState<string>('');
    const [getUserName, setGetUserName] = useState<string>('');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Add a centralized logout function
    const logoutUser = async (): Promise<void> => {
        try {
            // Clear AsyncStorage
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userName');
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('isAdmin');

            // Clear context state
            setGetUserId('');
            setGetUserName('');
            setIsAdmin(false);

            console.log("User logged out successfully - Context cleared");
        } catch (error) {
            console.error('Failed to logout user:', error);
            throw error; // Re-throw to allow error handling in components
        }
    };

    useEffect(() => {
        // Load user data from AsyncStorage when the app starts
        const loadUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const userName = await AsyncStorage.getItem('userName');
                const adminStatus = await AsyncStorage.getItem('isAdmin');

                console.log("Loading from AsyncStorage - userId:", userId);
                console.log("Loading from AsyncStorage - userName:", userName);
                console.log("Loading from AsyncStorage - isAdmin:", adminStatus);

                if (userId) {
                    setGetUserId(userId);
                }

                if (userName) {
                    setGetUserName(userName);
                }

                if (adminStatus) {
                    setIsAdmin(adminStatus === 'true');
                }
            } catch (error) {
                console.error('Failed to load user data from storage', error);
            }
        };

        loadUserData();
    }, []);

    return (
        <UserType.Provider value={{
            getUserId,
            getUserName,
            isAdmin,
            setGetUserId,
            setGetUserName,
            setIsAdmin,
            logoutUser
        }}>
            {children}
        </UserType.Provider>
    );
};
