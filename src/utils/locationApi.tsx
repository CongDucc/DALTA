import axios from 'axios';

// API Base URL
const API_BASE_URL = 'https://provinces.open-api.vn/api';

export interface LocationItem {
  code: string;
  name: string;
}

// Fetch provinces list
export const fetchProvinces = async (): Promise<LocationItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/p/`);
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        code: item.code.toString(),
        name: item.name
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

// Fetch districts based on province code
export const fetchDistricts = async (provinceCode: string): Promise<LocationItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
    if (response.data && response.data.districts && Array.isArray(response.data.districts)) {
      return response.data.districts.map((item: any) => ({
        code: item.code.toString(),
        name: item.name
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

// Fetch wards based on district code
export const fetchWards = async (districtCode: string): Promise<LocationItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/d/${districtCode}?depth=2`);
    if (response.data && response.data.wards && Array.isArray(response.data.wards)) {
      return response.data.wards.map((item: any) => ({
        code: item.code.toString(),
        name: item.name
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
};
