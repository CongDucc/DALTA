import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { TabsStackScreenProps } from '../Navigation/TabsNavigation';
import HeadersComponent from '../Components/HeaderComponents/HeaderComponent';
import { UserType } from '../Components/LoginRegisterComponent/UserContext';
import { CartState } from '../TypesCheck/productCartTypes';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminScreen = ({ navigation }: TabsStackScreenProps<"Admin">) => {
    const { isAdmin, getUserName } = useContext(UserType);
    const [isLoading, setIsLoading] = useState(false);
    const [productCount, setProductCount] = useState(0);
    const [categoryCount, setCategoryCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const cart = useSelector((state: CartState) => state.cart.cart);

    useEffect(() => {
        const checkAdminStatus = async () => {
            const adminStatus = await AsyncStorage.getItem('isAdmin');
            if (adminStatus !== 'true') {
                Alert.alert(
                    "Không có quyền truy cập",
                    "Bạn không có quyền truy cập trang quản trị",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.navigate("TabsStack", { screen: "Home" })
                        }
                    ]
                );
            } else {
                fetchDashboardData();
            }
        };

        checkAdminStatus();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch product count
            const productsRes = await axios.get('http://192.168.0.103:9000/product/getAllProducts');
            setProductCount(productsRes.data.length);

            // Fetch category count
            const categoriesRes = await axios.get('http://192.168.0.103:9000/category');
            setCategoryCount(categoriesRes.data.length);

            // These endpoints would need to be implemented
            // For now we'll use placeholder values
            setUserCount(5);
            setOrderCount(10);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu tổng quan');
        } finally {
            setIsLoading(false);
        }
    };

    const goToPreviousScreen = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate("Home");
        }
    };

    const gotoCartScreen = () => {
        if (cart.length === 0) {
            Alert.alert('Thông báo', 'Giỏ hàng trống');
        } else {
            navigation.navigate("TabsStack", { screen: "Cart" });
        }
    };

    const handleManageProducts = () => {
        navigation.navigate("AdminProduct");
    };

    const handleManageCategories = () => {
        navigation.navigate("AdminCategory");
    };

    const handleManageUsers = () => {
        // Navigate to user management screen
        Alert.alert('Thông báo', 'Tính năng đang phát triển');
    };

    const handleManageOrders = () => {
        // Navigate to order management screen
        Alert.alert('Thông báo', 'Tính năng đang phát triển');
    };

    return (
        <SafeAreaView style={styles.container}>
            <HeadersComponent
                pageTitle="Trang quản trị"
                goToPrevios={goToPreviousScreen}
                gotoCartScreen={gotoCartScreen}
                cartLength={cart.length}
            />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2ECC71" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <ScrollView style={styles.contentContainer}>
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeText}>Xin chào, {getUserName}</Text>
                        <Text style={styles.adminBadge}>Admin</Text>
                    </View>

                    <View style={styles.dashboardContainer}>
                        <Text style={styles.sectionTitle}>Tổng quan</Text>

                        <View style={styles.statsContainer}>
                            <View style={[styles.statCard, { backgroundColor: '#2ECC71' }]}>
                                <FontAwesome5 name="box" size={24} color="#fff" />
                                <Text style={styles.statNumber}>{productCount}</Text>
                                <Text style={styles.statLabel}>Sản phẩm</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: '#3498DB' }]}>
                                <MaterialIcons name="category" size={24} color="#fff" />
                                <Text style={styles.statNumber}>{categoryCount}</Text>
                                <Text style={styles.statLabel}>Danh mục</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: '#9B59B6' }]}>
                                <FontAwesome5 name="users" size={24} color="#fff" />
                                <Text style={styles.statNumber}>{userCount}</Text>
                                <Text style={styles.statLabel}>Người dùng</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: '#F39C12' }]}>
                                <MaterialIcons name="shopping-bag" size={24} color="#fff" />
                                <Text style={styles.statNumber}>{orderCount}</Text>
                                <Text style={styles.statLabel}>Đơn hàng</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.menuContainer}>
                        <Text style={styles.sectionTitle}>Quản lý</Text>

                        <TouchableOpacity style={styles.menuItem} onPress={handleManageProducts}>
                            <FontAwesome5 name="box" size={22} color="#2ECC71" style={styles.menuIcon} />
                            <Text style={styles.menuText}>Quản lý sản phẩm</Text>
                            <MaterialIcons name="arrow-forward-ios" size={16} color="#aaa" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleManageCategories}>
                            <MaterialIcons name="category" size={22} color="#3498DB" style={styles.menuIcon} />
                            <Text style={styles.menuText}>Quản lý danh mục</Text>
                            <MaterialIcons name="arrow-forward-ios" size={16} color="#aaa" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleManageUsers}>
                            <FontAwesome5 name="users" size={22} color="#9B59B6" style={styles.menuIcon} />
                            <Text style={styles.menuText}>Quản lý người dùng</Text>
                            <MaterialIcons name="arrow-forward-ios" size={16} color="#aaa" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleManageOrders}>
                            <MaterialIcons name="shopping-bag" size={22} color="#F39C12" style={styles.menuIcon} />
                            <Text style={styles.menuText}>Quản lý đơn hàng</Text>
                            <MaterialIcons name="arrow-forward-ios" size={16} color="#aaa" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === "android" ? 20 : 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    welcomeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    adminBadge: {
        backgroundColor: '#2ECC71',
        color: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        fontWeight: 'bold',
    },
    dashboardContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        padding: 16,
        borderRadius: 10,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#fff',
        marginTop: 4,
    },
    menuContainer: {
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuIcon: {
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
});

export default AdminScreen;
