import {
  View,
  Text,
  Platform,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { TabsStackScreenProps } from '../Navigation/TabsNavigation';
import HeadersComponent from '../Components/HeaderComponents/HeaderComponent';
import { CartState } from '../TypesCheck/productCartTypes';
import { useSelector, useDispatch } from 'react-redux';
import DisplayMessage from '../Components/ProductDetails/DisplayMessage';
import { UserType } from '../Components/LoginRegisterComponent/UserContext';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { clearCart } from '../redux/CartReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }: TabsStackScreenProps<"Profile">) => {
  const cart = useSelector((state: CartState) => state.cart.cart);
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState("");
  const { getUserId, setGetUserId, getUserName, setGetUserName, logoutUser, isAdmin } = useContext(UserType);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const userId = await AsyncStorage.getItem('userId');
        setIsAuthenticated(!!userId);
        console.log("ProfileScreen - Auth status:", !!userId);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [getUserId]);

  useEffect(() => {
    if (isAuthenticated) {
      const loadUserData = async () => {
        try {
          const userName = await AsyncStorage.getItem('userName');
          const userId = await AsyncStorage.getItem('userId');

          if (userId && !getUserId) {
            setGetUserId(userId);
          }

          if (userName && !getUserName) {
            setGetUserName(userName);
          }

          console.log("ProfileScreen - Loaded user data:", { userId, userName });
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };

      loadUserData();
    }
  }, [isAuthenticated]);

  const gotoCartScreen = () => {
    if (cart.length === 0) {
      setMessage("Cart is empty. Please add products to cart.");
      setDisplayMessage(true);
      setTimeout(() => {
        setDisplayMessage(false);
      }, 3000);
    } else {
      navigation.navigate("TabsStack", { screen: "Cart" });
    }
  };

  const goToPreviousScreen = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Đăng xuất",
          onPress: async () => {
            try {
              setIsLoading(true);

              await logoutUser();

              dispatch(clearCart());

              setIsAuthenticated(false);

              setMessage("Đã đăng xuất thành công");
              setDisplayMessage(true);
              setTimeout(() => {
                setDisplayMessage(false);
              }, 3000);

              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });

              navigation.navigate("TabsStack", { screen: "Home" });
            } catch (error) {
              console.error('Error during logout:', error);
              setMessage("Đăng xuất thất bại. Vui lòng thử lại.");
              setDisplayMessage(true);
              setTimeout(() => {
                setDisplayMessage(false);
              }, 3000);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const navigateToLogin = () => {
    navigation.navigate("UserLogin", {
      screenTitle: "Đăng nhập/Đăng ký",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobileNo: ""
    });
  };

  const navigateToAddressScreen = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Cần đăng nhập",
        "Vui lòng đăng nhập để quản lý địa chỉ của bạn",
        [{ text: "Đăng nhập", onPress: navigateToLogin }, { text: "Hủy", style: "cancel" }]
      );
      return;
    }
    navigation.navigate("AddressScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      {displayMessage && <DisplayMessage message={message} visible={() => setDisplayMessage(!displayMessage)} />}
      <HeadersComponent gotoCartScreen={gotoCartScreen} cartLength={cart.length} goToPrevios={goToPreviousScreen} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ECC71" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('../../assets/profile-avatar.jpg')}
                style={styles.avatar}
                defaultSource={require('../../assets/profile-avatar.jpg')}
              />
            </View>

            {isAuthenticated ? (
              <View style={styles.userInfoContainer}>
                <Text style={styles.welcomeText}>Xin chào,</Text>
                <Text style={styles.usernameText}>{getUserName || "Khách hàng"}</Text>
                {isAdmin && (
                  <View style={styles.adminBadgeContainer}>
                    <Text style={styles.adminBadge}>Admin</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.loginPromptContainer}>
                <Text style={styles.loginPromptText}>Vui lòng đăng nhập để xem thông tin cá nhân</Text>
                <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
                  <Text style={styles.loginButtonText}>Đăng nhập / Đăng ký</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isAuthenticated ? (
            <>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Tài khoản</Text>

                <TouchableOpacity style={styles.optionItem}>
                  <FontAwesome name="user-circle" size={24} color="#2ECC71" style={styles.optionIcon} />
                  <Text style={styles.optionText}>Thông tin cá nhân</Text>
                  <MaterialIcons name="arrow-forward-ios" size={18} color="#aaa" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem}>
                  <FontAwesome name="history" size={24} color="#2ECC71" style={styles.optionIcon} />
                  <Text style={styles.optionText}>Lịch sử đơn hàng</Text>
                  <MaterialIcons name="arrow-forward-ios" size={18} color="#aaa" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={navigateToAddressScreen}>
                  <Ionicons name="location" size={24} color="#2ECC71" style={styles.optionIcon} />
                  <Text style={styles.optionText}>Địa chỉ của tôi</Text>
                  <MaterialIcons name="arrow-forward-ios" size={18} color="#aaa" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem}>
                  <Ionicons name="card" size={24} color="#2ECC71" style={styles.optionIcon} />
                  <Text style={styles.optionText}>Phương thức thanh toán</Text>
                  <MaterialIcons name="arrow-forward-ios" size={18} color="#aaa" />
                </TouchableOpacity>

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => navigation.navigate("Admin")}
                  >
                    <MaterialIcons name="admin-panel-settings" size={24} color="#2ECC71" style={styles.optionIcon} />
                    <Text style={styles.optionText}>Quản lý Admin</Text>
                    <MaterialIcons name="arrow-forward-ios" size={18} color="#aaa" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Cài đặt</Text>

                <TouchableOpacity style={styles.optionItem}>
                  <Ionicons name="notifications" size={24} color="#2ECC71" style={styles.optionIcon} />
                  <Text style={styles.optionText}>Thông báo</Text>
                  <MaterialIcons name="arrow-forward-ios" size={18} color="#aaa" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem}>
                  <Ionicons name="lock-closed" size={24} color="#2ECC71" style={styles.optionIcon} />
                  <Text style={styles.optionText}>Bảo mật & Quyền riêng tư</Text>
                  <MaterialIcons name="arrow-forward-ios" size={18} color="#aaa" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out" size={24} color="#fff" style={styles.logoutIcon} />
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.guestModeContainer}>
              <Image
                source={require('../../assets/profile-avatar.jpg')}
                style={styles.guestImage}
                resizeMode="contain"
              />
              <Text style={styles.guestModeText}>
                Đăng nhập để quản lý đơn hàng, cập nhật thông tin cá nhân và nhận các đề xuất sản phẩm phù hợp.
              </Text>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 20,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
  },
  userInfoContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  adminBadgeContainer: {
    marginTop: 5,
  },
  adminBadge: {
    backgroundColor: '#2ECC71',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  loginPromptContainer: {
    flex: 1,
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestModeContainer: {
    padding: 20,
    alignItems: 'center',
  },
  guestImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  guestModeText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default ProfileScreen;