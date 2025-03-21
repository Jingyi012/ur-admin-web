export enum EnquiryStatus {
  Pending = 1,
  InProgress = 2,
  Resolved = 2,
  Closed = 4,
}

export enum EnquiryType {
  ProdcutEnquiry = 1,
  ConsultancySiteSurvey = 2,
  Design = 3,
  RepairMantenance = 4,
  Other = 5,
}

export const getEnquiryTypeName = (type?: number): string => {
  if (type === undefined || type === null) {
    return 'Unknown';
  }

  const enquiryTypeMap: Record<number, string> = {
    1: 'Product Enquiry',
    2: 'Consultancy Site Survey',
    3: 'Design',
    4: 'Repair & Maintenance',
    5: 'Other',
  };

  return enquiryTypeMap[type] ?? 'Unknown';
};
