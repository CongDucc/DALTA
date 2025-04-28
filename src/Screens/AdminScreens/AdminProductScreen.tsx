import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
    TextInput,
    Modal,
    ScrollView,
    Image
} from 'react-native';
import { TabsStackScreenProps } from '../../Navigation/TabsNavigation';
import HeadersComponent from '../../Components/HeaderComponents/HeaderComponent';
import { UserType } from '../../Components/LoginRegisterComponent/UserContext';
import { MaterialIcons, AntDesign, Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getImageUrl } from '../../middleware/HomeMiddleware';
import { ProductListParams, CategoryParams } from '../../TypesCheck/HomeProp';
import { ProductFormData, ModalState } from '../../TypesCheck/AdminTypes';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

const AdminProductScreen = ({ navigation }: TabsStackScreenProps<"AdminProduct">) => {
    const { isAdmin } = useContext(UserType);
    const [products, setProducts] = useState<ProductListParams[]>([]);
    const [categories, setCategories] = useState<CategoryParams[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalState, setModalState] = useState<ModalState>({
        visible: false,
        type: null
    });
    const [productForm, setProductForm] = useState<ProductFormData>({
        name: '',
        price: 0,
        oldPrice: 0,
        description: '',
        quantity: 0,
        inStock: true,
        isFeatured: false,
        category: '',
        images: []
    });
    const [imageFiles, setImageFiles] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        checkAdminStatus();
        fetchData();
    }, []);

    const checkAdminStatus = async () => {
        const adminStatus = await AsyncStorage.getItem('isAdmin');
        if (adminStatus !== 'true') {
            Alert.alert(
                "Không có quyền truy cập",
                "Bạn không có quyền truy cập trang quản trị",
                [{ text: "OK", onPress: () => navigation.navigate("TabsStack", { screen: "Home" }) }]
            );
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get('http://192.168.0.103:9000/product/getAllProducts'),
                axios.get('http://192.168.0.103:9000/category')
            ]);

            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu sản phẩm');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateProduct = () => {
        setProductForm({
            name: '',
            price: 0,
            oldPrice: 0,
            description: '',
            quantity: 0,
            inStock: true,
            isFeatured: false,
            category: categories.length > 0 ? categories[0]._id : '',
            images: []
        });
        setImageFiles([]);
        setModalState({ visible: true, type: 'create' });
    };

    const handleEditProduct = (product: ProductListParams) => {
        setProductForm({
            _id: product._id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice || 0,
            description: product.description || '',
            quantity: product.quantity,
            inStock: product.inStock || false,
            isFeatured: product.isFeatured || false,
            category: product.category || '',
            images: product.images || []
        });
        setImageFiles([]);
        setModalState({ visible: true, type: 'edit', itemId: product._id });
    };

    const handleDeleteProduct = (productId: string) => {
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa sản phẩm này không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await axios.delete(`http://192.168.0.103:9000/product/${productId}`);
                            Alert.alert("Thành công", "Đã xóa sản phẩm");
                            fetchData();
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            Alert.alert("Lỗi", "Không thể xóa sản phẩm");
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const pickImages = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Cần quyền truy cập", "Ứng dụng cần quyền truy cập vào thư viện hình ảnh");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                const assets = result.assets || [];
                setImageFiles(prev => [...prev, ...assets]);
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Lỗi', 'Không thể chọn hình ảnh');
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageUrl: string) => {
        setProductForm(prev => ({
            ...prev,
            images: prev.images.filter(img => img !== imageUrl)
        }));
    };

    const handleSubmitProduct = async () => {
        if (!productForm.name || !productForm.description || productForm.price <= 0 || !productForm.category) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin sản phẩm');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();

        formData.append('name', productForm.name);
        formData.append('price', productForm.price.toString());
        if (productForm.oldPrice && productForm.oldPrice > 0) {
            formData.append('oldPrice', productForm.oldPrice.toString());
        }
        formData.append('description', productForm.description);
        formData.append('quantity', productForm.quantity.toString());
        formData.append('inStock', productForm.inStock.toString());
        formData.append('isFeatured', productForm.isFeatured.toString());
        formData.append('category', productForm.category);

        // Add existing images
        productForm.images.forEach(image => {
            formData.append('existingImages', image);
        });

        // Add new images
        imageFiles.forEach(file => {
            const uriParts = file.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('images', {
                uri: file.uri,
                name: `image_${Date.now()}.${fileType}`,
                type: `image/${fileType}`
            } as any);
        });

        try {
            if (modalState.type === 'create') {
                await axios.post('http://192.168.0.103:9000/product/createProduct', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                Alert.alert('Thành công', 'Đã tạo sản phẩm mới');
            } else if (modalState.type === 'edit' && productForm._id) {
                await axios.put(`http://192.168.0.103:9000/product/${productForm._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                Alert.alert('Thành công', 'Đã cập nhật sản phẩm');
            }

            setModalState({ visible: false, type: null });
            fetchData();
        } catch (error) {
            console.error('Error submitting product:', error);
            Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
        } finally {
            setIsLoading(false);
        }
    };

    const renderProductItem = ({ item }: { item: ProductListParams }) => (
        <View style={styles.productItem}>
            <Image
                source={{ uri: getImageUrl(item.images[0]) || undefined }}
                style={styles.productImage}
                defaultSource={require('../../../assets/cat404.jpg')}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>${item.price}</Text>
                <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
                <Text style={styles.productStatus}>
                    {item.inStock ? 'Còn hàng' : 'Hết hàng'}
                </Text>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditProduct(item)}
                >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteProduct(item._id)}
                >
                    <MaterialIcons name="delete" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const goToPreviousScreen = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <HeadersComponent
                pageTitle="Quản lý sản phẩm"
                goToPrevios={goToPreviousScreen}
            />

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    ) : null}
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleCreateProduct}
                >
                    <AntDesign name="plus" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2ECC71" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.productList}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Feather name="package" size={64} color="#ccc" />
                            <Text style={styles.emptyListText}>
                                {searchQuery ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Product Form Modal */}
            <Modal
                visible={modalState.visible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalState({ visible: false, type: null })}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {modalState.type === 'create' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalState({ visible: false, type: null })}
                            >
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScrollView}>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Tên sản phẩm</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={productForm.name}
                                    onChangeText={(text) => setProductForm(prev => ({ ...prev, name: text }))}
                                    placeholder="Nhập tên sản phẩm"
                                />
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formGroup, { flex: 1, marginRight: 5 }]}>
                                    <Text style={styles.formLabel}>Giá</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={productForm.price.toString()}
                                        onChangeText={(text) => {
                                            const numValue = parseFloat(text) || 0;
                                            setProductForm(prev => ({ ...prev, price: numValue }));
                                        }}
                                        keyboardType="numeric"
                                        placeholder="Nhập giá"
                                    />
                                </View>

                                <View style={[styles.formGroup, { flex: 1, marginLeft: 5 }]}>
                                    <Text style={styles.formLabel}>Giá cũ (nếu có)</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={productForm.oldPrice ? productForm.oldPrice.toString() : ''}
                                        onChangeText={(text) => {
                                            const numValue = parseFloat(text) || 0;
                                            setProductForm(prev => ({ ...prev, oldPrice: numValue }));
                                        }}
                                        keyboardType="numeric"
                                        placeholder="Nhập giá cũ"
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Mô tả</Text>
                                <TextInput
                                    style={[styles.formInput, styles.formTextarea]}
                                    value={productForm.description}
                                    onChangeText={(text) => setProductForm(prev => ({ ...prev, description: text }))}
                                    placeholder="Nhập mô tả sản phẩm"
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formGroup, { flex: 1, marginRight: 5 }]}>
                                    <Text style={styles.formLabel}>Số lượng</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        value={productForm.quantity.toString()}
                                        onChangeText={(text) => {
                                            const numValue = parseInt(text) || 0;
                                            setProductForm(prev => ({
                                                ...prev,
                                                quantity: numValue,
                                                inStock: numValue > 0
                                            }));
                                        }}
                                        keyboardType="numeric"
                                        placeholder="Nhập số lượng"
                                    />
                                </View>

                                <View style={[styles.formGroup, { flex: 1, marginLeft: 5 }]}>
                                    <Text style={styles.formLabel}>Danh mục</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={productForm.category}
                                            style={styles.picker}
                                            onValueChange={(itemValue) =>
                                                setProductForm(prev => ({ ...prev, category: itemValue }))
                                            }
                                        >
                                            {categories.map(category => (
                                                <Picker.Item
                                                    key={category._id}
                                                    label={category.name}
                                                    value={category._id}
                                                />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.formLabel}>Tình trạng</Text>
                                    <View style={styles.statusContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.statusButton,
                                                productForm.inStock ? styles.statusButtonActive : {}
                                            ]}
                                            onPress={() => setProductForm(prev => ({ ...prev, inStock: true }))}
                                        >
                                            <Text style={productForm.inStock ? styles.statusTextActive : styles.statusText}>
                                                Còn hàng
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.statusButton,
                                                !productForm.inStock ? styles.statusButtonActive : {}
                                            ]}
                                            onPress={() => setProductForm(prev => ({ ...prev, inStock: false }))}
                                        >
                                            <Text style={!productForm.inStock ? styles.statusTextActive : styles.statusText}>
                                                Hết hàng
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.formLabel}>Nổi bật</Text>
                                    <View style={styles.statusContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.statusButton,
                                                productForm.isFeatured ? styles.statusButtonActive : {}
                                            ]}
                                            onPress={() => setProductForm(prev => ({ ...prev, isFeatured: true }))}
                                        >
                                            <Text style={productForm.isFeatured ? styles.statusTextActive : styles.statusText}>
                                                Có
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.statusButton,
                                                !productForm.isFeatured ? styles.statusButtonActive : {}
                                            ]}
                                            onPress={() => setProductForm(prev => ({ ...prev, isFeatured: false }))}
                                        >
                                            <Text style={!productForm.isFeatured ? styles.statusTextActive : styles.statusText}>
                                                Không
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Hình ảnh</Text>

                                {/* Existing Images */}
                                {productForm.images.length > 0 && (
                                    <View>
                                        <Text style={styles.subLabel}>Hình ảnh hiện tại:</Text>
                                        <ScrollView horizontal style={styles.imageScrollView}>
                                            {productForm.images.map((img, index) => (
                                                <View key={index} style={styles.imageContainer}>
                                                    <Image
                                                        source={{ uri: getImageUrl(img) || undefined }}
                                                        style={styles.imagePreview}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.removeImageBtn}
                                                        onPress={() => removeExistingImage(img)}
                                                    >
                                                        <AntDesign name="closecircle" size={20} color="#FF6B6B" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {/* New Images */}
                                {imageFiles.length > 0 && (
                                    <View>
                                        <Text style={styles.subLabel}>Hình ảnh mới:</Text>
                                        <ScrollView horizontal style={styles.imageScrollView}>
                                            {imageFiles.map((img, index) => (
                                                <View key={index} style={styles.imageContainer}>
                                                    <Image
                                                        source={{ uri: img.uri }}
                                                        style={styles.imagePreview}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.removeImageBtn}
                                                        onPress={() => removeImage(index)}
                                                    >
                                                        <AntDesign name="closecircle" size={20} color="#FF6B6B" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.pickImageButton}
                                    onPress={pickImages}
                                >
                                    <AntDesign name="picture" size={20} color="#2ECC71" />
                                    <Text style={styles.pickImageText}>Chọn hình ảnh</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmitProduct}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {modalState.type === 'create' ? 'Thêm sản phẩm' : 'Cập nhật sản phẩm'}
                                    </Text>
                                )}
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
        backgroundColor: '#fff',
        paddingTop: Platform.OS === "android" ? 20 : 0,
    },
    searchContainer: {
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    addButton: {
        marginLeft: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
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
    productList: {
        padding: 15,
    },
    productItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    productImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    productPrice: {
        fontSize: 16,
        color: '#2ECC71',
        fontWeight: '600',
        marginTop: 4,
    },
    productQuantity: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    productStatus: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    actionsContainer: {
        justifyContent: 'space-around',
        paddingLeft: 10,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
    editButton: {
        backgroundColor: '#3498DB',
    },
    deleteButton: {
        backgroundColor: '#FF6B6B',
    },
    emptyListContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyListText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: '90%',
        maxHeight: '90%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    formScrollView: {
        padding: 15,
        maxHeight: 500,
    },
    formGroup: {
        marginBottom: 15,
    },
    formRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    formInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    formTextarea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 40,
        width: '100%',
    },
    statusContainer: {
        flexDirection: 'row',
    },
    statusButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    statusButtonActive: {
        backgroundColor: '#2ECC71',
        borderColor: '#2ECC71',
    },
    statusText: {
        color: '#666',
    },
    statusTextActive: {
        color: '#fff',
        fontWeight: '500',
    },
    subLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    imageScrollView: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 10,
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    removeImageBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    pickImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2ECC71',
        borderRadius: 8,
        borderStyle: 'dashed',
        paddingVertical: 12,
    },
    pickImageText: {
        marginLeft: 8,
        color: '#2ECC71',
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#2ECC71',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AdminProductScreen;
