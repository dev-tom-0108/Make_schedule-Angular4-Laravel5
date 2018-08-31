import { LANG_EN_NAME, LANG_CN_NAME } from "app/shared/services";

// page persmission
export class PagePermission {
  id: number;
  is_write: number;
  is_read: number;
  name: string;
}
export class Staff {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  account_name: string;
  role: string;
  phone: string;
  profile_image: string;
  table_color: string;
  is_enabled: string;
  password: string = '';
  permissions: PagePermission[];
  language: string = LANG_CN_NAME;
  email_notification: number;
}

export class StaffResponse {
  return_code: string;
  data: Staff[];
}

export const Language:Array<any> = [{ id: LANG_EN_NAME, name: "LANG_ENGLISH" }, { id: LANG_CN_NAME, name: "LANG_CHINESE" } ];
export const StaffRoles: Array<string> = ["STAFF_ROLE_ADMIN", "STAFF_ROLE_WAITER", "STAFF_ROLE_STAFF"];