// @ts-ignore
/* eslint-disable */

declare namespace API {
  type User = {
    id?: string;
    userName?: string;
    email?: string;
    roles?: string[];
  };

  type RegisterUserRequest = {
    email: string;
    userName: string;
    password: string;
    confirmPassword: string;
    roles: string[];
  };

  type CurrentUser = {
    id: string;
    userName: string;
    email: string;
    roles: string[];
    isVerified: boolean;
    jwtToken: string;
    refreshToken: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    email?: string;
    password?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  type Enquiry = {
    id: number;
    name: string;
    companyName: string;
    phone: string;
    email: string;
    type: number;
    message: string;
    status: number;
    assignedTo?: string;
    remarks?: string;
    created?: string;
    lastModified?: string;
    history?: EnquiryHistory[];
  };

  type EnquiryHistory = {
    id: number;
    name: string;
    companyName: string;
    phone: string;
    email: string;
    type: number;
    message: string;
    status?: number;
    assignedTo?: string;
    remarks?: string;
    created?: string;
    lastModified?: string;
    lastModifiedBy?: string;
  };

  type News = {
    id: number;
    title: string;
    description?: string;
    imageUrls?: string[];
    date: string;
    isActive: boolean;
  };

  type Projects = {
    id?: number;
    name: string;
    description?: string;
    imageUrls?: string[];
    latitude: number;
    longitude: number;
    isActive: boolean;
    date: string;
  };

  type Products = {
    id?: number;
    name: string;
    description?: string;
    productCategoryId: number;
    manufacturer: string;
    imageUrls?: string[];
    isActive: boolean;
  };

  type ProductCategory = {
    id: number;
    name: string;
    imageUrl: string;
  };

  type DashboardStaistic = {
    totalProducts: number;
    totalNews: number;
    totalProjects: number;
    totalPendingEnquiries: number;
  };
}
