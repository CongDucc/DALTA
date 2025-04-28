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
import { Entypo, AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useContext } from "react";
import { UserType } from "../Components/LoginRegisterComponent/UserContext";

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
};
const TabsStack = createBottomTabNavigator<TabsStackParams>();

export type TabsStackScreenProps<T extends keyof TabsStackParams> = CompositeScreenProps<
    BottomTabScreenProps<TabsStackParams, T>,
    RootStackScreenProps<"TabsStack">
>;

const TabsNavigator = () => {
    const { isAdmin } = useContext(UserType);

    return (
        <TabsStack.Navigator screenOptions={{ tabBarShowLabel: false }}>
            <TabsStack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <Entypo name="home" size={24} color="#00970a" />
                        ) : (
                            <AntDesign name="home" size={24} color="#000" />
                        )
                }}
            />

            <TabsStack.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <AntDesign name="shoppingcart" size={24} color="#00970a" />
                        ) : (
                            <AntDesign name="shoppingcart" size={24} color="#000" />
                        )
                }}
            />

            <TabsStack.Screen
                name="Payment"
                component={PaymentScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => focused ? (
                        <Ionicons name="copy" size={24} color="#00970a" />
                    ) : (
                        <Ionicons name="copy-outline" size={24} color="#000" />
                    )
                }}
            />

            <TabsStack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => focused ? (
                        <Ionicons name="person" size={24} color="#00970a" />
                    ) : (
                        <Ionicons name="person-outline" size={24} color="#000" />
                    )
                }}
            />

            {isAdmin && (
                <TabsStack.Screen
                    name="Admin"
                    component={AdminScreen}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ focused }) => focused ? (
                            <MaterialIcons name="admin-panel-settings" size={24} color="#00970a" />
                        ) : (
                            <MaterialIcons name="admin-panel-settings" size={24} color="#000" />
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
                    tabBarButton: () => null, // Hides this tab from the tab bar
                }}
            />

            <TabsStack.Screen
                name="AdminCategory"
                component={AdminCategoryScreen}
                options={{
                    headerShown: false,
                    tabBarButton: () => null, // Hides this tab from the tab bar
                }}
            />

            <TabsStack.Screen
                name="ProductDetails"
                component={ProductDetails}
                options={{
                    headerShown: false,
                    tabBarButton: () => null, // Hides this tab from the tab bar
                }}
            />
        </TabsStack.Navigator>
    );
};

export default TabsNavigator;