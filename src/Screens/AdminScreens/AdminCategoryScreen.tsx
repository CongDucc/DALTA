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
  Image
} from 'react-native';
import { TabsStackScreenProps } from '../../Navigation/TabsNavigation';
import HeadersComponent from '../../Components/HeaderComponents/HeaderComponent';
import { UserType } from '../../Components/LoginRegisterComponent/UserContext';
import { MaterialIcons, AntDesign, Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getImageUrl } from '../../middleware/HomeMiddleware';
import { CategoryParams } from '../../TypesCheck/HomeProp';
import { CategoryFormData, ModalState } from '../../TypesCheck/AdminTypes';
import * as ImagePicker from 'expo-image-picker';

const AdminCategoryScreen = ({ navigation }: TabsStackScreenProps<"AdminCategory">) => {
  const { isAdmin } = useContext(UserType);
  const [categories, setCategories] = useState<CategoryParams[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: null
  });
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: '',
    images: []
  });
  const [imageFile, setImageFile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchCategories();
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

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://192.168.0.104:9000/category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu danh mục');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCategory = () => {
    setCategoryForm({
      name: '',
      images: []
    });
    setImageFile(null);
    setModalState({ visible: true, type: 'create' });
  };

  const handleEditCategory = (category: CategoryParams) => {
    setCategoryForm({
      _id: category._id,
      name: category.name,
      images: category.images || []
    });
    setImageFile(null);
    setModalState({ visible: true, type: 'edit', itemId: category._id });
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa danh mục này không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await axios.delete(`http://192.168.0.104:9000/category/deleteCategory/${categoryId}`);
              Alert.alert("Thành công", "Đã xóa danh mục");
              fetchCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert("Lỗi", "Không thể xóa danh mục");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Cần quyền truy cập", "Ứng dụng cần quyền truy cập vào thư viện hình ảnh");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setImageFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn hình ảnh');
    }
  };

  const handleSubmitCategory = async () => {
    if (!categoryForm.name) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    if (modalState.type === 'create' && !imageFile) {
      Alert.alert('Lỗi', 'Vui lòng chọn hình ảnh cho danh mục');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', categoryForm.name);

    if (imageFile) {
      const uriParts = imageFile.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('image', {
        uri: imageFile.uri,
        name: `category_${Date.now()}.${fileType}`,
        type: `image/${fileType}`
      } as any);
    }

    try {
      if (modalState.type === 'create') {
        await axios.post('http://192.168.0.104:9000/category/createCategory', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Alert.alert('Thành công', 'Đã tạo danh mục mới');
      } else if (modalState.type === 'edit' && categoryForm._id) {
        await axios.put(`http://192.168.0.104:9000/category/updateCategory/${categoryForm._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Alert.alert('Thành công', 'Đã cập nhật danh mục');
      }
      
      setModalState({ visible: false, type: null });
      fetchCategories();
    } catch (error) {
      console.error('Error submitting category:', error);
      Alert.alert('Lỗi', 'Không thể lưu danh mục');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderCategoryItem = ({ item }: { item: CategoryParams }) => (
    <View style={styles.categoryItem}>
      <Image 
        source={{ uri: getImageUrl(item.images[0]) || undefined }}
        style={styles.categoryImage}
        defaultSource={require('../../../assets/cat404.jpg')}
      />
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditCategory(item)}
        >
          <MaterialIcons name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCategory(item._id)}
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
        pageTitle="Quản lý danh mục"
        goToPrevios={goToPreviousScreen}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm danh mục..."
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
          onPress={handleCreateCategory}
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
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.categoryList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Feather name="list" size={64} color="#ccc" />
              <Text style={styles.emptyListText}>
                {searchQuery ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}
              </Text>
            </View>
          }
        />
      )}

      {/* Category Form Modal */}
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
                {modalState.type === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalState({ visible: false, type: null })}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên danh mục</Text>
                <TextInput
                  style={styles.formInput}
                  value={categoryForm.name}
                  onChangeText={(text) => setCategoryForm(prev => ({ ...prev, name: text }))}
                  placeholder="Nhập tên danh mục"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Hình ảnh</Text>
                
                {modalState.type === 'edit' && categoryForm.images.length > 0 && !imageFile && (
                  <View style={styles.currentImageContainer}>
                    <Text style={styles.subLabel}>Hình ảnh hiện tại:</Text>
                    <Image
                      source={{ uri: getImageUrl(categoryForm.images[0]) || undefined }}
                      style={styles.currentImage}
                      defaultSource={require('../../../assets/cat404.jpg')}
                    />
                  </View>
                )}
                
                {imageFile && (
                  <View style={styles.imagePreviewContainer}>
                    <Text style={styles.subLabel}>Hình ảnh mới:</Text>
                    <Image
                      source={{ uri: imageFile.uri }}
                      style={styles.imagePreview}
                    />
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.pickImageButton}
                  onPress={pickImage}
                >
                  <AntDesign name="picture" size={20} color="#2ECC71" />
                  <Text style={styles.pickImageText}>
                    {imageFile || (modalState.type === 'edit' && categoryForm.images.length > 0) 
                      ? 'Thay đổi hình ảnh' 
                      : 'Chọn hình ảnh'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitCategory}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {modalState.type === 'create' ? 'Thêm danh mục' : 'Cập nhật danh mục'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  categoryList: {
    padding: 15,
  },
  categoryItem: {
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
    alignItems: 'center',
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 15,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  formContainer: {
    padding: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentImageContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  currentImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imagePreviewContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#ddd',
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
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminCategoryScreen;
