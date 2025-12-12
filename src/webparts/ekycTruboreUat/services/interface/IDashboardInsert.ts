export interface IDashboardInsert {
  Id?: number;
  Title: string;
  Department: string;
  Frequency: string;
  RenewalDate?: Date | string | null;
  Reminder1?: Date | string | null;
  Reminder2?: Date | string | null;
  Reminder3?: Date | string | null;
  CurrenrtStatus?: string;
  Remark?: string;
  EmployeeCode?: string;
  EmployeeName?: string;
  Location?: string;
  ACT?: string;
  Category?: string;
  ClosingDate?: Date | string | null;
  Email?: string;
  OtherRemark?: string;
  FromDate?: Date | string | null;
  ToDate?: Date | string | null;

}