import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { RootStackScreenProps } from "./RootNavigator";
import HomeScreen from "../Screens/HomeScreen";
import CartScreen from "../Screens/CartScreen";
import PaymentScreen from "../Screens/PaymentScreen";
import ProfileScreen from "../Screens/ProfileScreen";
import ProductDetails from "../Screens/ProductDetails";
import AdminScreen from "../Screens/AdminScreen";
import AdminProductScreen from "../Screens/AdminScreens/AdminProductScreen";
import AdminCategoryScreen from "../Screens/AdminScreens/AdminCategoryScreen";
import AddressScreen from "../Screens/AddressScreen";
import { Entypo, AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useContext } from "react";
import { UserType } from "../Components/LoginRegisterComponent/UserContext";
import { StyleSheet, View, Text } from "react-native";

export type TabsStackParams = {
    Home: undefined;
    Payment: undefined;
    Profile: undefined;
    Admin: undefined;
    AdminProduct: undefined;
    AdminCategory: undefined;
    Cart: {
        _id?: string;
        images?: [string];
        name?: string;
        price?: number;
        color?: string;
        size?: string;
        quantity?: number;
    } | undefined;  // Make the entire params optional
    ProductDetails: {
        _id: string;
        name: string;
        price: number;
        oldPrice?: number;
        description?: string;
        images: string[];
        inStock?: boolean;
        quantity?: number;
    };
    AddressScreen: undefined;
};
const TabsStack = createBottomTabNavigator<TabsStackParams>();

export type TabsStackScreenProps<T extends keyof TabsStackParams> = CompositeScreenProps<
    BottomTabScreenProps<TabsStackParams, T>,
    RootStackScreenProps<"TabsStack">
>;

const TabsNavigator = () => {
    const { isAdmin } = useContext(UserType);

    return (
        <TabsStack.Navigator 
            screenOptions={{ 
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
                tabBarItemStyle: styles.tabBarItem,
                tabBarActiveTintColor: '#00970a',
                tabBarInactiveTintColor: '#000',
            }}
        >
            <TabsStack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused, color }) => (
                        <View style={styles.tabIconContainer}>
                            {focused ? (
                                <Entypo name="home" size={24} color={color} />
                            ) : (
                                <AntDesign name="home" size={24} color={color} />
                            )}
                            <Text style={[styles.tabLabel, { color }]}>Home</Text>
                        </View>
                    )
                }}
            />

            <TabsStack.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused, color }) => (
                        <View style={styles.tabIconContainer}>
                            <AntDesign name="shoppingcart" size={24} color={color} />
                            <Text style={[styles.tabLabel, { color }]}>Cart</Text>
                        </View>
                    )
                }}
            />

            <TabsStack.Screen
                name="Payment"
                component={PaymentScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused, color }) => (
                        <View style={styles.tabIconContainer}>
                            {focused ? (
                                <Ionicons name="copy" size={24} color={color} />
                            ) : (
                                <Ionicons name="copy-outline" size={24} color={color} />
                            )}
                            <Text style={[styles.tabLabel, { color }]}>Orders</Text>
                        </View>
                    )
                }}
            />

            <TabsStack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused, color }) => (
                        <View style={styles.tabIconContainer}>
                            {focused ? (
                                <Ionicons name="person" size={24} color={color} />
                            ) : (
                                <Ionicons name="person-outline" size={24} color={color} />
                            )}
                            <Text style={[styles.tabLabel, { color }]}>Profile</Text>
                        </View>
                    )
                }}
            />

            {isAdmin && (
                <TabsStack.Screen
                    name="Admin"
                    component={AdminScreen}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused, color }) => (
                            <View style={styles.tabIconContainer}>
                                <MaterialIcons name="admin-panel-settings" size={24} color={color} />
                                <Text style={[styles.tabLabel, { color }]}>Admin</Text>
                            </View>
                        )
                    }}
                />
            )}

            {/* Hide these screens from tab bar but make them available for navigation */}
            <TabsStack.Screen
                name="AdminProduct"
                component={AdminProductScreen}
                options={{
                    headerShown: false,
                    tabBarButton: () => null,
                }}
            />

            <TabsStack.Screen
                name="AdminCategory"
                component={AdminCategoryScreen}
                options={{
                    headerShown: false,
                    tabBarButton: () => null,
                }}
            />

            <TabsStack.Screen
                name="ProductDetails"
                component={ProductDetails}
                options={{
                    headerShown: false,
                    tabBarButton: () => null,
                }}
            />

            <TabsStack.Screen
                name="AddressScreen"
                component={AddressScreen}
                options={{
                    headerShown: false,
                    tabBarButton: () => null,
                }}
            />
        </TabsStack.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: 65,
        paddingBottom: 10,
        paddingTop: 5,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabBarItem: {
        flex: 1,
        height: 50,
        padding: 0,
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabIconContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 3,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default TabsNavigator;