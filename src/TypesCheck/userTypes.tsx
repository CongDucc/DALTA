export interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  provinceCode: string;
  province: string;
  districtCode: string;
  district: string;
  wardCode: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}

export interface AddressFormData {
  fullName: string;
  phoneNumber: string;
  provinceCode: string;
  province: string;
  districtCode: string;
  district: string;
  wardCode: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}
