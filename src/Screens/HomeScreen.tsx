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
import { CategoryCard } from "../Components/HomeScreenComponents/CategoryCard";
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
    <SafeAreaView style={{ paddingTop: Platform.OS === "android" ? 1 : 0, flex: 1, backgroundColor: "white" }}>
      {displayMessage && <DisplayMessage message={message} visible={() => setDisplayMessage(!displayMessage)} />}
      <HeadersComponent gotoCartScreen={gotoCartScreen} cartLength={cart.length} goToPrevios={goToPreviousScreen} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {isCategoryLoading ? (
            <Text style={styles.loadingText}>Loading categories...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {getCategory.map((item, index) => (
                <CategoryCard
                  key={index}
                  item={{
                    name: item.name,
                    images: [item.images[0]],
                    _id: item._id
                  }}
                  catStyleProps={{
                    height: 70,
                    width: 70,
                    radius: 35,
                    resizeMode: "cover",
                  }}
                  catProps={{
                    activeCat: activeCat,
                    onPress: () => {
                      setActiveCat(item._id);
                      setActivePrice(null);
                      setSearchQuery(""); // Clear search when changing categories
                    },
                  }}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Sort Options Section */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : activeCat
                ? 'Selected Category'
                : activePrice
                  ? `Products under $${activePrice}`
                  : 'All Products'
            }
          </Text>
          {isProductLoading ? (
            <Text style={styles.loadingText}>Loading products...</Text>
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
                          style={styles.gridProductCard}
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
                        >
                          <Image
                            source={{
                              uri: getImageUrl(item.images[0]) || undefined
                            }}
                            style={styles.productImage}
                            resizeMode="cover"
                            defaultSource={require('../../assets/cat404.jpg')}
                            onError={(e) => {
                              console.log('Image load error:', e.nativeEvent.error);
                            }}
                          />
                          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                          <Text style={styles.productPrice}>${item.price}</Text>
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

              {/* Pagination Dots */}
              {productPages.length > 1 && (
                <View style={styles.paginationDots}>
                  {productPages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        { backgroundColor: currentPage === index ? '#2ECC71' : '#ccc' }
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noProductsText}>
              {searchQuery ? `No products matching "${searchQuery}"` : "No products available"}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === "android" ? 40 : 0,
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
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categorySection: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingVertical: 10,
    gap: 15,
  },
  productSection: {
    padding: 15,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: 10,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    padding: 10,
  },
  noProductsText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  productCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  productName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  filterSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilter: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginRight: 5,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  // Grid layout styles
  productPage: {
    paddingRight: 0,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridProductCard: {
    width: '48%', // Almost half width to fit 2 in a row
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  }
});

export default HomeScreen;