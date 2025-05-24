export interface Branch {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

export interface Semester {
  id: string;
  branch_id: string;
  number: number;
}

export interface NewBranch {
  name: string;
  code: string;
  description: string;
} 