import {
  View,
  Text,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert
} from 'react-native'
import React, { useContext } from 'react'
import { TabsStackScreenProps } from '../Navigation/TabsNavigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import HeadersComponent from '../Components/HeaderComponents/HeaderComponent'
import DisplayMessage from '../Components/ProductDetails/DisplayMessage'
import { useSelector, useDispatch } from 'react-redux'
import { CartState, ProductListParams } from '../TypesCheck/productCartTypes'
import { getImageUrl } from '../middleware/HomeMiddleware'
import { AntDesign, Feather, MaterialIcons, FontAwesome } from '@expo/vector-icons'
import { removeFromCart, clearCart } from '../redux/CartReducer'
import { increaseQuantity, decreaseQuantity } from '../redux/CartReducer';
import { UserType } from '../Components/LoginRegisterComponent/UserContext'

const CartScreen = ({ navigation, route }: TabsStackScreenProps<"Cart">) => {
  const cart = useSelector((state: CartState) => state.cart.cart);
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState("");
  const dispatch = useDispatch();
  const { getUserId, setGetUserId } = useContext(UserType);

  const proceed = () => {
    if (getUserId === "") {
      navigation.navigate("UserLogin", { screenTitle: "User Authentication" });
    } else {
      if (cart.length === 0) {
        navigation.navigate("TabsStack", { screen: "Home" });
      }
      else { }
    }
  };

  const gotoCartScreen = () => {
    if (cart.length === 0) {
      setMessage("Cart is empty. Please add products to cart.");
      setDisplayMessage(true);
      setTimeout(() => {
        setDisplayMessage(false);
      }, 3000);
      navigation.navigate("Home");
    }
  }

  const handleIncreaseQuantity = (item: ProductListParams) => {
    dispatch(increaseQuantity(item));
  };

  const handleDecreaseQuantity = (item: ProductListParams) => {
    if (item.quantity && item.quantity > 1) {
      dispatch(decreaseQuantity(item));
    }
  };

  const handleDeleteItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
    setMessage("Item removed from cart");
    setDisplayMessage(true);
    setTimeout(() => {
      setDisplayMessage(false);
    }, 3000);
  };

  const handleClearCart = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa tất cả", 
          style: "destructive",
          onPress: () => {
            dispatch(clearCart());
            setMessage("Đã xóa tất cả sản phẩm trong giỏ hàng");
            setDisplayMessage(true);
            setTimeout(() => {
              setDisplayMessage(false);
            }, 3000);
          }
        }
      ]
    );
  };

  const goToPreviousScreen = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {displayMessage && <DisplayMessage message={message} visible={() => setDisplayMessage(!displayMessage)} />}
      <HeadersComponent gotoCartScreen={gotoCartScreen} cartLength={cart.length} goToPrevios={goToPreviousScreen} />

      {cart.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <View style={styles.emptyCartIconContainer}>
            <Feather name="shopping-cart" size={80} color="#e0e0e0" />
            <View style={styles.emptyCartBadge}>
              <Text style={styles.emptyCartBadgeText}>0</Text>
            </View>
          </View>
          <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
          <Text style={styles.emptyCartSubText}>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate("Home")}
          >
            <FontAwesome name="shopping-basket" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cartPageContainer}>
          <View style={styles.cartHeader}>
            <View style={styles.cartHeaderTitleContainer}>
              <Feather name="shopping-cart" size={20} color="#333" />
              <Text style={styles.cartTitle}>Giỏ hàng của bạn</Text>
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountText}>{cart.length}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.clearAllButton} 
              onPress={handleClearCart}
            >
              <Feather name="trash-2" size={14} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.clearAllButtonText}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.cartContainer} showsVerticalScrollIndicator={false}>
            {cart.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <Image
                  source={{
                    uri: getImageUrl(item.images[0]) || ''
                  }}
                  style={styles.itemImage}
                  defaultSource={require('../../assets/cat404.jpg')}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  
                  <View style={styles.itemActions}>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity style={styles.quantityButton} onPress={() => handleDecreaseQuantity(item)}>
                        <AntDesign name="minus" size={14} color="#333" />
                      </TouchableOpacity>
                      <Text style={styles.quantityValue}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.quantityButton} onPress={() => handleIncreaseQuantity(item)}>
                        <AntDesign name="plus" size={14} color="#333" />
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteItem(item._id)}>
                      <AntDesign name="delete" size={18} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalLabel}>Tổng:</Text>
                  <Text style={styles.itemTotalValue}>${(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.checkoutContainer}>
            <View style={styles.totalInfoContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tạm tính:</Text>
                <Text style={styles.totalValue}>
                  ${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
                <Text style={styles.totalValue}>$0.00</Text>
              </View>
              
              <View style={[styles.totalRow, styles.finalTotalRow]}>
                <Text style={styles.finalTotalLabel}>Tổng thanh toán:</Text>
                <Text style={styles.finalTotalValue}>
                  ${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </Text>
              </View>
            </View>
            
            <Pressable
              style={styles.checkoutButton}
              onPress={proceed}
            >
              <MaterialIcons name="payment" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.checkoutButtonText}>Tiến hành thanh toán</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  emptyCartBadge: {
    position: 'absolute',
    top: 0,
    right: -5,
    backgroundColor: '#FF6B6B',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyCartSubText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
  },
  continueShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: '#2ECC71',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  buttonIcon: {
    marginRight: 8,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartPageContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cartContainer: {
    flex: 1,
    padding: 15,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  cartHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  cartCountBadge: {
    backgroundColor: '#2ECC71',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  cartCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: 'bold',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  quantityValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  itemTotal: {
    position: 'absolute',
    right: 15,
    top: 15,
    alignItems: 'flex-end',
  },
  itemTotalLabel: {
    fontSize: 12,
    color: '#777',
  },
  itemTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  totalInfoContainer: {
    marginBottom: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  finalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 6,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ECC71',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;