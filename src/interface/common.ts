
// #region params
export interface PageParams {
  pageSize?: number;
  currentPage?: number;
}

export interface AllSearchParams {
  MainModel: string;
  page?: PageParams;
  where?: Object;
  order?: Object;
  attributes?: Object;
  include?: Array<Object>;
}
// #endregion