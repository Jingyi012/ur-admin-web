export enum EnquiryStatus {
  Pending = 0,
  InProgress = 1,
  Resolved = 2,
  Closed = 3,
}

export enum EnquiryType {
  ProdcutEnquiry = 0,
  ConsultancySiteSurvey = 1,
  Design = 2,
  RepairMantenance = 3,
  Other = 4,
}

export const getEnquiryTypeName = (type?: number): string => {
  if (type === undefined || type === null) {
    return 'Unknown';
  }

  const enquiryTypeMap: Record<number, string> = {
    0: 'Product Enquiry',
    1: 'Consultancy Site Survey',
    2: 'Design',
    3: 'Repair & Maintenance',
    4: 'Other',
  };

  return enquiryTypeMap[type] ?? 'Unknown';
};
