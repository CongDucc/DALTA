import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Switch,
  Modal,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { TabsStackScreenProps } from '../Navigation/TabsNavigation';
import HeadersComponent from '../Components/HeaderComponents/HeaderComponent';
import { MaterialIcons, Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import { UserType } from '../Components/LoginRegisterComponent/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address, AddressFormData } from '../TypesCheck/userTypes';
import { Picker } from '@react-native-picker/picker';
import { LocationItem, fetchProvinces, fetchDistricts, fetchWards } from '../utils/locationApi';

const AddressScreen = ({ navigation }: TabsStackScreenProps<"AddressScreen">) => {
  const { getUserId } = useContext(UserType);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState<string | null>(null);
  
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [addressForm, setAddressForm] = useState<AddressFormData>({
    fullName: '',
    phoneNumber: '',
    provinceCode: '',
    province: '',
    districtCode: '',
    district: '',
    wardCode: '',
    ward: '',
    streetAddress: '',
    isDefault: false
  });

  const [errors, setErrors] = useState({
    fullName: '',
    phoneNumber: '',
    province: '',
    district: '',
    ward: '',
    streetAddress: '',
  });

  useEffect(() => {
    loadAddresses();
    loadProvinces();
  }, [getUserId]);

  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const data = await fetchProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const handleProvinceChange = async (provinceCode: string, provinceName: string) => {
    if (!provinceCode || provinceCode === '0') {
      setDistricts([]);
      setWards([]);
      setAddressForm(prev => ({
        ...prev,
        provinceCode: '',
        province: '',
        districtCode: '',
        district: '',
        wardCode: '',
        ward: ''
      }));
      return;
    }

    setAddressForm(prev => ({
      ...prev,
      provinceCode,
      province: provinceName,
      districtCode: '',
      district: '',
      wardCode: '',
      ward: ''
    }));

    setLoadingDistricts(true);
    try {
      const data = await fetchDistricts(provinceCode);
      setDistricts(data);
      setWards([]);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtCode: string, districtName: string) => {
    if (!districtCode || districtCode === '0') {
      setWards([]);
      setAddressForm(prev => ({
        ...prev,
        districtCode: '',
        district: '',
        wardCode: '',
        ward: ''
      }));
      return;
    }

    setAddressForm(prev => ({
      ...prev,
      districtCode,
      district: districtName,
      wardCode: '',
      ward: ''
    }));

    setLoadingWards(true);
    try {
      const data = await fetchWards(districtCode);
      setWards(data);
    } catch (error) {
      console.error('Error loading wards:', error);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleWardChange = (wardCode: string, wardName: string) => {
    if (!wardCode || wardCode === '0') {
      setAddressForm(prev => ({
        ...prev,
        wardCode: '',
        ward: ''
      }));
      return;
    }

    setAddressForm(prev => ({
      ...prev,
      wardCode,
      ward: wardName
    }));
  };

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const storedAddresses = await AsyncStorage.getItem(`addresses_${getUserId}`);
      if (storedAddresses) {
        setAddresses(JSON.parse(storedAddresses));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Lỗi', 'Không thể tải địa chỉ của bạn');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAddresses = async (newAddresses: Address[]) => {
    try {
      await AsyncStorage.setItem(`addresses_${getUserId}`, JSON.stringify(newAddresses));
    } catch (error) {
      console.error('Error saving addresses:', error);
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ của bạn');
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      fullName: '',
      phoneNumber: '',
      province: '',
      district: '',
      ward: '',
      streetAddress: '',
    };

    if (!addressForm.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
      isValid = false;
    }

    if (!addressForm.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(addressForm.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
      isValid = false;
    }

    if (!addressForm.provinceCode) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
      isValid = false;
    }

    if (!addressForm.districtCode) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
      isValid = false;
    }

    if (!addressForm.wardCode) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
      isValid = false;
    }

    if (!addressForm.streetAddress.trim()) {
      newErrors.streetAddress = 'Vui lòng nhập địa chỉ cụ thể';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddAddress = () => {
    setEditMode(false);
    setCurrentAddressId(null);
    setAddressForm({
      fullName: '',
      phoneNumber: '',
      provinceCode: '',
      province: '',
      districtCode: '',
      district: '',
      wardCode: '',
      ward: '',
      streetAddress: '',
      isDefault: addresses.length === 0
    });
    setModalVisible(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditMode(true);
    setCurrentAddressId(address.id);
    setAddressForm({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      provinceCode: address.provinceCode,
      province: address.province,
      districtCode: address.districtCode,
      district: address.district,
      wardCode: address.wardCode,
      ward: address.ward,
      streetAddress: address.streetAddress,
      isDefault: address.isDefault
    });
    
    if (address.provinceCode) {
      handleProvinceChange(address.provinceCode, address.province);
      if (address.districtCode) {
        handleDistrictChange(address.districtCode, address.district);
      }
    }
    
    setModalVisible(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa địa chỉ này không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            const newAddresses = addresses.filter(addr => addr.id !== addressId);
            if (addresses.find(addr => addr.id === addressId)?.isDefault && newAddresses.length > 0) {
              newAddresses[0].isDefault = true;
            }
            setAddresses(newAddresses);
            await saveAddresses(newAddresses);
          }
        }
      ]
    );
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const newAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setAddresses(newAddresses);
    saveAddresses(newAddresses);
  };

  const handleSubmitAddress = async () => {
    if (!validateForm()) return;

    let newAddresses: Address[];
    
    if (editMode && currentAddressId) {
      newAddresses = addresses.map(addr => 
        addr.id === currentAddressId 
          ? { ...addressForm, id: currentAddressId } 
          : addressForm.isDefault 
            ? { ...addr, isDefault: false } 
            : addr
      );
    } else {
      const newAddress: Address = {
        ...addressForm,
        id: Date.now().toString(),
      };

      if (newAddress.isDefault) {
        newAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        newAddresses.push(newAddress);
      } else {
        if (addresses.length === 0) {
          newAddress.isDefault = true;
        }
        newAddresses = [...addresses, newAddress];
      }
    }

    setAddresses(newAddresses);
    await saveAddresses(newAddresses);
    setModalVisible(false);
  };

  const goToPreviousScreen = () => {
    navigation.goBack();
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Mặc định</Text>
        </View>
      )}
      
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{item.fullName}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => handleEditAddress(item)}
          >
            <MaterialIcons name="edit" size={20} color="#3498DB" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleDeleteAddress(item.id)}
          >
            <MaterialIcons name="delete" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
      <Text style={styles.addressText}>
        {item.streetAddress}, {item.ward}, {item.district}, {item.province}
      </Text>
      
      {!item.isDefault && (
        <TouchableOpacity 
          style={styles.setDefaultButton}
          onPress={() => handleSetDefaultAddress(item.id)}
        >
          <Text style={styles.setDefaultText}>Đặt làm địa chỉ mặc định</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeadersComponent
        pageTitle="Địa chỉ của tôi"
        goToPrevios={goToPreviousScreen}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ECC71" />
          <Text style={styles.loadingText}>Đang tải địa chỉ...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddAddress}
          >
            <Ionicons name="add-circle-outline" size={20} color="#2ECC71" />
            <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
          </TouchableOpacity>

          {addresses.length > 0 ? (
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.addressList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="map-pin" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Bạn chưa có địa chỉ nào</Text>
              <Text style={styles.emptySubtext}>Thêm địa chỉ để dễ dàng đặt hàng</Text>
            </View>
          )}
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Họ tên người nhận</Text>
                <TextInput
                  style={[styles.formInput, errors.fullName ? styles.inputError : null]}
                  value={addressForm.fullName}
                  onChangeText={(text) => setAddressForm({...addressForm, fullName: text})}
                  placeholder="Nhập họ tên"
                />
                {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Số điện thoại</Text>
                <TextInput
                  style={[styles.formInput, errors.phoneNumber ? styles.inputError : null]}
                  value={addressForm.phoneNumber}
                  onChangeText={(text) => setAddressForm({...addressForm, phoneNumber: text})}
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tỉnh/Thành phố</Text>
                <View style={[styles.pickerContainer, errors.province ? styles.inputError : null]}>
                  {loadingProvinces ? (
                    <ActivityIndicator size="small" color="#2ECC71" style={styles.pickerLoading} />
                  ) : (
                    <Picker
                      selectedValue={addressForm.provinceCode}
                      style={styles.picker}
                      onValueChange={(itemValue) => {
                        if (itemValue) {
                          const selectedProvince = provinces.find(p => p.code === itemValue);
                          handleProvinceChange(
                            itemValue, 
                            selectedProvince ? selectedProvince.name : ''
                          );
                        }
                      }}
                    >
                      <Picker.Item label="Chọn tỉnh/thành phố" value="0" />
                      {provinces.map(province => (
                        <Picker.Item 
                          key={province.code} 
                          label={province.name} 
                          value={province.code} 
                        />
                      ))}
                    </Picker>
                  )}
                </View>
                {errors.province ? <Text style={styles.errorText}>{errors.province}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Quận/Huyện</Text>
                <View style={[styles.pickerContainer, errors.district ? styles.inputError : null]}>
                  {loadingDistricts ? (
                    <ActivityIndicator size="small" color="#2ECC71" style={styles.pickerLoading} />
                  ) : (
                    <Picker
                      selectedValue={addressForm.districtCode}
                      style={styles.picker}
                      enabled={!!addressForm.provinceCode && districts.length > 0}
                      onValueChange={(itemValue) => {
                        if (itemValue) {
                          const selectedDistrict = districts.find(d => d.code === itemValue);
                          handleDistrictChange(
                            itemValue, 
                            selectedDistrict ? selectedDistrict.name : ''
                          );
                        }
                      }}
                    >
                      <Picker.Item label="Chọn quận/huyện" value="0" />
                      {districts.map(district => (
                        <Picker.Item 
                          key={district.code} 
                          label={district.name} 
                          value={district.code} 
                        />
                      ))}
                    </Picker>
                  )}
                </View>
                {errors.district ? <Text style={styles.errorText}>{errors.district}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phường/Xã</Text>
                <View style={[styles.pickerContainer, errors.ward ? styles.inputError : null]}>
                  {loadingWards ? (
                    <ActivityIndicator size="small" color="#2ECC71" style={styles.pickerLoading} />
                  ) : (
                    <Picker
                      selectedValue={addressForm.wardCode}
                      style={styles.picker}
                      enabled={!!addressForm.districtCode && wards.length > 0}
                      onValueChange={(itemValue) => {
                        if (itemValue) {
                          const selectedWard = wards.find(w => w.code === itemValue);
                          handleWardChange(
                            itemValue, 
                            selectedWard ? selectedWard.name : ''
                          );
                        }
                      }}
                    >
                      <Picker.Item label="Chọn phường/xã" value="0" />
                      {wards.map(ward => (
                        <Picker.Item 
                          key={ward.code} 
                          label={ward.name} 
                          value={ward.code} 
                        />
                      ))}
                    </Picker>
                  )}
                </View>
                {errors.ward ? <Text style={styles.errorText}>{errors.ward}</Text> : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Địa chỉ cụ thể</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea, errors.streetAddress ? styles.inputError : null]}
                  value={addressForm.streetAddress}
                  onChangeText={(text) => setAddressForm({...addressForm, streetAddress: text})}
                  placeholder="Nhập số nhà, tên đường"
                  multiline
                  numberOfLines={3}
                />
                {errors.streetAddress ? <Text style={styles.errorText}>{errors.streetAddress}</Text> : null}
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Đặt làm địa chỉ mặc định</Text>
                <Switch
                  value={addressForm.isDefault}
                  onValueChange={(value) => setAddressForm({...addressForm, isDefault: value})}
                  trackColor={{ false: "#dddddd", true: "#2ECC71" }}
                  thumbColor={addressForm.isDefault ? "#ffffff" : "#f4f3f4"}
                />
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitAddress}
              >
                <Text style={styles.submitButtonText}>
                  {editMode ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
                </Text>
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
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  content: {
    flex: 1,
    padding: 15,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 2,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2ECC71',
    fontWeight: '500',
  },
  addressList: {
    paddingBottom: 20,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    position: 'relative',
  },
  defaultBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#2ECC71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  addressName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 5,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  setDefaultText: {
    color: '#2ECC71',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    height: 50,
  },
  picker: {
    height: 50,
  },
  pickerLoading: {
    marginVertical: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddressScreen;
