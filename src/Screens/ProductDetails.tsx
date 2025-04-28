import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import { TabsStackScreenProps } from '../Navigation/TabsNavigation';
import HeadersComponent from '../Components/HeaderComponents/HeaderComponent';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/CartReducer';
import { UserType } from '../Components/LoginRegisterComponent/UserContext';
import { CartState } from '../TypesCheck/productCartTypes';
import DisplayMessage from '../Components/ProductDetails/DisplayMessage';
import { AntDesign, Feather, MaterialIcons, Octicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '../TypesCheck/userTypes';
import { getImageUrl } from '../middleware/HomeMiddleware';

const { width } = Dimensions.get('window');

const ProductDetails = ({ navigation, route }: TabsStackScreenProps<"ProductDetails">) => {
  const { getUserId } = useContext(UserType);
  const cart = useSelector((state: CartState) => state.cart.cart);
  const dispatch = useDispatch();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [displayMessage, setDisplayMessage] = useState(false);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState('2-3 days');
  
  const { _id, name, price, oldPrice, description, images } = route.params;

  // Fetch user addresses
  useEffect(() => {
    if (getUserId) {
      loadUserAddresses();
    }
  }, [getUserId]);

  const loadUserAddresses = async () => {
    try {
      const storedAddresses = await AsyncStorage.getItem(`addresses_${getUserId}`);
      if (storedAddresses) {
        const addresses: Address[] = JSON.parse(storedAddresses);
        setUserAddresses(addresses);
        
        // Set default address if available
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
          // Calculate estimated delivery time based on address
          calculateDeliveryTime(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const calculateDeliveryTime = (address: Address) => {
    // This is a mock function that could use real delivery estimations
    // For now, we're simulating different delivery times based on location
    const bigCities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
    
    if (bigCities.some(city => address.province.includes(city))) {
      setDeliveryTime('1-2 days');
    } else {
      setDeliveryTime('3-5 days');
    }
  };

  const handleAddToCart = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      dispatch(addToCart({
        _id: _id,
        name: name,
        price: price,
        oldPrice: oldPrice,
        description: description,
        images: [images[0]],
        quantity: quantity
      }));
      
      setIsLoading(false);
      setMessage("Product added to cart successfully");
      setDisplayMessage(true);
      
      setTimeout(() => {
        setDisplayMessage(false);
      }, 2000);
    }, 500);
  };

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const navigateToAddressScreen = () => {
    if (!getUserId) {
      Alert.alert(
        "Cần đăng nhập",
        "Vui lòng đăng nhập để quản lý địa chỉ của bạn",
        [
          { 
            text: "Đăng nhập", 
            onPress: () => navigation.navigate("UserLogin", { screenTitle: "User Authentication" }) 
          }, 
          { text: "Hủy", style: "cancel" }
        ]
      );
      return;
    }
    navigation.navigate("AddressScreen");
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    calculateDeliveryTime(address);
    setAddressModalVisible(false);
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
      setMessage("Cart is empty. Please add products to cart.");
      setDisplayMessage(true);
      setTimeout(() => {
        setDisplayMessage(false);
      }, 3000);
    } else {
      navigation.navigate("TabsStack", { screen: "Cart" });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {displayMessage && <DisplayMessage message={message} visible={() => setDisplayMessage(!displayMessage)} />}
      <HeadersComponent gotoCartScreen={gotoCartScreen} cartLength={cart.length} goToPrevios={goToPreviousScreen} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const contentOffsetX = event.nativeEvent.contentOffset.x;
              const currentIndex = Math.round(contentOffsetX / width);
              setCurrentImageIndex(currentIndex);
            }}
            scrollEventThrottle={16}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: getImageUrl(image) || undefined }}
                style={styles.productImage}
                defaultSource={require('../../assets/cat404.jpg')}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Image Pagination Dots */}
          <View style={styles.paginationDots}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index ? styles.activePaginationDot : {}
                ]}
              />
            ))}
          </View>
          
          {/* Discount Badge */}
          {oldPrice && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.productName}>{name}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${price}</Text>
              {oldPrice && <Text style={styles.oldPrice}>${oldPrice}</Text>}
            </View>
            
            
            
          </View>
          
          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                onPress={() => handleQuantityChange('decrease')}
                disabled={quantity === 1}
              >
                <AntDesign name="minus" size={16} color={quantity === 1 ? "#ccc" : "#333"} />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange('increase')}
              >
                <AntDesign name="plus" size={16} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Delivery Section */}
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            
            {selectedAddress ? (
              <TouchableOpacity 
                style={styles.addressContainer}
                onPress={() => setAddressModalVisible(true)}
              >
                <View style={styles.addressInfo}>
                  <View style={styles.addressHeader}>
                    <Feather name="map-pin" size={16} color="#2ECC71" style={styles.addressIcon} />
                    <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
                    {selectedAddress.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText} numberOfLines={2}>
                    {selectedAddress.streetAddress}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                  </Text>
                  <Text style={styles.phoneText}>{selectedAddress.phoneNumber}</Text>
                </View>
                <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.addAddressButton}
                onPress={navigateToAddressScreen}
              >
                <AntDesign name="pluscircleo" size={16} color="#2ECC71" />
                <Text style={styles.addAddressText}>Add delivery address</Text>
              </TouchableOpacity>
            )}
            
            
          </View>
          
          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.favoriteButton}>
          <AntDesign name="hearto" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="shopping-cart" size={20} color="#fff" style={styles.cartIcon} />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Address Selection Modal */}
      <Modal
        visible={addressModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {userAddresses.length > 0 ? (
                userAddresses.map((address, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalAddressItem,
                      selectedAddress?.id === address.id && styles.selectedAddressItem
                    ]}
                    onPress={() => handleSelectAddress(address)}
                  >
                    <View style={styles.addressInfo}>
                      <View style={styles.addressHeader}>
                        <Text style={styles.addressName}>{address.fullName}</Text>
                        {address.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {address.streetAddress}, {address.ward}, {address.district}, {address.province}
                      </Text>
                      <Text style={styles.phoneText}>{address.phoneNumber}</Text>
                    </View>
                    
                    {selectedAddress?.id === address.id && (
                      <View style={styles.selectedAddressCheck}>
                        <AntDesign name="check" size={18} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noAddressContainer}>
                  <Feather name="map-pin" size={50} color="#ccc" />
                  <Text style={styles.noAddressText}>No addresses found</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.addNewAddressButton}
                onPress={() => {
                  setAddressModalVisible(false);
                  navigateToAddressScreen();
                }}
              >
                <AntDesign name="plus" size={18} color="#2ECC71" style={styles.addButtonIcon} />
                <Text style={styles.addNewAddressText}>Add New Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width * 0.9,
    position: 'relative',
  },
  productImage: {
    width: width,
    height: width * 0.9,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 3,
  },
  activePaginationDot: {
    backgroundColor: '#fff',
    width: 16,
    borderRadius: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 0,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  detailsSection: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  oldPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 10,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  quantityButtonDisabled: {
    opacity: 0.6,
  },
  quantityText: {
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  deliverySection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressIcon: {
    marginRight: 6,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  addAddressText: {
    marginLeft: 8,
    color: '#2ECC71',
    fontSize: 15,
    fontWeight: '500',
  },
  deliveryEstimate: {
    marginTop: 16,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryIcon: {
    marginRight: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#666',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  favoriteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  addToCartButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
    maxHeight: '70%',
  },
  modalAddressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedAddressItem: {
    borderColor: '#2ECC71',
    backgroundColor: 'rgba(46, 204, 113, 0.05)',
  },
  selectedAddressCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAddressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noAddressText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  addNewAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    marginTop: 10,
    marginBottom: 20,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addNewAddressText: {
    color: '#2ECC71',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ProductDetails;