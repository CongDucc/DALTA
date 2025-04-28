import {
  View,
  Text,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  TextInput
} from "react-native";
import React, { useState, useEffect } from "react";
import { TabsStackScreenProps } from "../Navigation/TabsNavigation";
import { SafeAreaView } from "react-native-safe-area-context";
import HeadersComponent from "../Components/HeaderComponents/HeaderComponent";
import { ProductListParams, CategoryParams } from "../TypesCheck/HomeProp";
import { fetchCategories, fetchProductsByCatID, fetchProductsByPrice, getImageUrl } from '../middleware/HomeMiddleware';
import { CartState, SortOption } from "../TypesCheck/productCartTypes";
import { useSelector } from "react-redux";
import DisplayMessage from "../Components/ProductDetails/DisplayMessage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Utility function to chunk array into pages
const chunkArray = <T extends any>(array: T[], size: number): T[][] => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const HomeScreen = ({ navigation }: TabsStackScreenProps<"Home">) => {
  const [getCategory, setGetCategory] = useState<CategoryParams[]>([]);
  const [getProductsByCatID, setGetProductsByCatID] = useState<ProductListParams[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductListParams[]>([]);
  const [activeCat, setActiveCat] = useState<string>("");
  const [activePrice, setActivePrice] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.NONE);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const cart = useSelector((state: CartState) => state.cart.cart);
  const [message, setMessage] = React.useState("");
  const [displayMessage, setDisplayMessage] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { width } = Dimensions.get('window');

  // Function to handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.trim() === "") {
      setFilteredProducts(getProductsByCatID);
      return;
    }

    // Filter products by name or description containing search query
    const filtered = getProductsByCatID.filter(product =>
      product.name.toLowerCase().includes(text.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(text.toLowerCase()))
    );

    setFilteredProducts(filtered);
    setCurrentPage(0); // Reset to first page when searching
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredProducts(getProductsByCatID);
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

  const goToPreviousScreen = () => {
    if (navigation.canGoBack()) {
      console.log("Chuyển về trang trước.");
      navigation.goBack();
    } else {
      console.log("Không thể quay lại, chuyển về trang Onboarding.");
      navigation.navigate("OnboardingScreen"); // Điều hướng fallback nếu không quay lại được
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      setIsCategoryLoading(true);
      try {
        await fetchCategories({ setGetCategory });
        setError(null);
      } catch (err) {
        setError('Failed to load categories');
        console.error('Category loading error:', err);
      } finally {
        setIsCategoryLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setIsProductLoading(true);
      try {
        if (activeCat) {
          await fetchProductsByCatID({ setGetProductsByCatID, catID: activeCat });
        } else if (activePrice !== null) {
          await fetchProductsByPrice({ setGetProductsByCatID, maxPrice: activePrice });
        } else {
          await fetchProductsByCatID({ setGetProductsByCatID, catID: '' });
        }
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error('Product loading error:', err);
      } finally {
        setIsProductLoading(false);
      }
    };
    loadProducts();
    setCurrentPage(0); // Reset to first page when changing products
  }, [activeCat, activePrice]);

  // Update filtered products when products change
  useEffect(() => {
    let updatedProducts = [...getProductsByCatID];

    // Apply sorting
    if (sortOption === SortOption.PRICE_LOW_TO_HIGH) {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === SortOption.PRICE_HIGH_TO_LOW) {
      updatedProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(updatedProducts);

    // If there was a search query active, re-apply it
    if (searchQuery.trim() !== "") {
      handleSearch(searchQuery);
    }
  }, [getProductsByCatID, sortOption]);

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);

    // Apply the sorting immediately to the current filtered products
    let sortedProducts = [...filteredProducts];

    if (option === SortOption.PRICE_LOW_TO_HIGH) {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (option === SortOption.PRICE_HIGH_TO_LOW) {
      sortedProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(sortedProducts);
    setCurrentPage(0); // Reset to first page when sorting
  };

  const handlePageChange = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  // Create pages of 16 products (4x4 grid) from filtered products
  const productPages = filteredProducts?.length > 0 ? chunkArray(filteredProducts, 16) : [];

  return (
    <SafeAreaView style={styles.container}>
      {displayMessage && <DisplayMessage message={message} visible={() => setDisplayMessage(!displayMessage)} />}
      <HeadersComponent gotoCartScreen={gotoCartScreen} cartLength={cart.length} goToPrevios={goToPreviousScreen} />

      {/* Modern Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.mainScrollView}>
        {/* Categories Section */}
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => {
              setActiveCat("");
              setActivePrice(null);
              setSearchQuery("");
            }}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {isCategoryLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={24} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {getCategory.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryCard,
                    activeCat === item._id && styles.activeCategoryCard
                  ]}
                  onPress={() => {
                    setActiveCat(item._id);
                    setActivePrice(null);
                    setSearchQuery("");
                  }}
                >
                  <View style={styles.categoryImageContainer}>
                    <Image
                      source={{ uri: getImageUrl(item.images[0]) || undefined }}
                      style={styles.categoryImage}
                      defaultSource={require('../../assets/cat404.jpg')}
                    />
                  </View>
                  <Text 
                    style={[
                      styles.categoryName, 
                      activeCat === item._id && styles.activeCategoryName
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {activeCat === item._id && <View style={styles.categoryActiveIndicator} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Sort Options Section */}
        <View style={styles.filterSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sort By</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
            <TouchableOpacity
              style={[styles.filterButton, sortOption === SortOption.NONE && styles.activeFilter]}
              onPress={() => handleSortChange(SortOption.NONE)}
            >
              <Text style={[styles.filterText, sortOption === SortOption.NONE && styles.activeFilterText]}>
                Default
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, sortOption === SortOption.PRICE_LOW_TO_HIGH && styles.activeFilter]}
              onPress={() => handleSortChange(SortOption.PRICE_LOW_TO_HIGH)}
            >
              <Text style={[styles.filterText, sortOption === SortOption.PRICE_LOW_TO_HIGH && styles.activeFilterText]}>
                Price: Low to High
              </Text>
              <MaterialIcons name="arrow-upward" size={16} color={sortOption === SortOption.PRICE_LOW_TO_HIGH ? "#fff" : "#666"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, sortOption === SortOption.PRICE_HIGH_TO_LOW && styles.activeFilter]}
              onPress={() => handleSortChange(SortOption.PRICE_HIGH_TO_LOW)}
            >
              <Text style={[styles.filterText, sortOption === SortOption.PRICE_HIGH_TO_LOW && styles.activeFilterText]}>
                Price: High to Low
              </Text>
              <MaterialIcons name="arrow-downward" size={16} color={sortOption === SortOption.PRICE_HIGH_TO_LOW ? "#fff" : "#666"} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Products Section */}
        <View style={styles.productSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : activeCat
                  ? 'Selected Category'
                  : activePrice
                    ? `Products under $${activePrice}`
                    : 'All Products'
              }
            </Text>
            <Text style={styles.resultCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </Text>
          </View>
          
          {isProductLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : filteredProducts?.length > 0 ? (
            <View>
              <FlatList
                data={productPages}
                renderItem={({ item: pageItems }) => (
                  <View style={[styles.productPage, { width: width - 30 }]}>
                    <View style={styles.productGrid}>
                      {pageItems.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.productCard}
                          onPress={() => navigation.navigate("ProductDetails", {
                            _id: item._id,
                            name: item.name,
                            price: item.price,
                            oldPrice: item.oldPrice,
                            description: item.description,
                            images: item.images,
                            inStock: true,
                            quantity: 1
                          })}
                          activeOpacity={0.7}
                        >
                          <View style={styles.productImageContainer}>
                            <Image
                              source={{
                                uri: getImageUrl(item.images[0]) || undefined
                              }}
                              style={styles.productImage}
                              resizeMode="cover"
                              defaultSource={require('../../assets/cat404.jpg')}
                            />
                            {item.oldPrice && (
                              <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>
                                  {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}% OFF
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                            <View style={styles.priceContainer}>
                              <Text style={styles.productPrice}>${item.price}</Text>
                              {item.oldPrice && (
                                <Text style={styles.oldPrice}>${item.oldPrice}</Text>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => `page_${index}`}
                onScroll={handlePageChange}
                snapToInterval={width - 30}
                snapToAlignment="center"
                decelerationRate="fast"
              />

              {/* Modern Pagination Dots */}
              {productPages.length > 1 && (
                <View style={styles.paginationDots}>
                  {productPages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        currentPage === index ? styles.activePaginationDot : {}
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyResultsContainer}>
              <Ionicons name="search-outline" size={50} color="#ccc" />
              <Text style={styles.noProductsText}>
                {searchQuery ? `No products matching "${searchQuery}"` : "No products available"}
              </Text>
              {searchQuery && (
                <TouchableOpacity style={styles.resetButton} onPress={clearSearch}>
                  <Text style={styles.resetButtonText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainScrollView: {
    flex: 1,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#2ECC71',
    fontWeight: '600',
    fontSize: 14,
  },
  resultCount: {
    color: '#666',
    fontSize: 14,
  },
  categorySection: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  categoriesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  activeCategoryCard: {
    transform: [{ scale: 1.05 }],
  },
  categoryImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ebebeb',
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  categoryName: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeCategoryName: {
    color: '#2ECC71',
    fontWeight: 'bold',
  },
  categoryActiveIndicator: {
    width: 15,
    height: 3,
    backgroundColor: '#2ECC71',
    borderRadius: 3,
    marginTop: 5,
  },
  filterSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 12,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  filtersContainer: {
    paddingVertical: 5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  activeFilter: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  filterText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
    marginRight: 5,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  productSection: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF6B6B',
    marginLeft: 10,
    fontSize: 14,
  },
  emptyResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noProductsText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 15,
    fontSize: 15,
  },
  resetButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  productPage: {
    paddingRight: 0,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  productImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  discountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
    height: 40,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  oldPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 5,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  activePaginationDot: {
    backgroundColor: '#2ECC71',
    width: 16,
    borderRadius: 4,
  },
});

export default HomeScreen;