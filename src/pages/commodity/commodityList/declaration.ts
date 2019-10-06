export interface SearchParams {
	category?: number[];
	storeSourceId?: string;
    statuses?: number | string;
    sourceId?: string; // 商品ID
    sourceName?: string; //商品名称
    minSellAmount?: number | string;
    maxSellAmount?: number | string;
    minSourcePrice?: number | string;
    maxSourcePrice?: number | string;
    dateTime?: Date[]
}

export interface TablePagination {
    total: number;
    pageSize: number;
    current: number;
}

export interface StateType {
    tableData: TableDataItem[];
    searchData: SearchParams;
    statuses: string;
	pagination: Partial<TablePagination>;
	sourceId: string;
}

export interface CategoryParams {
    id: number
}

export interface TableListState {
	[key: string]: any
}

export interface TableDataItem {
    categoryAttributes: any[];
    costPrice: number;
    createTime: string;
    creator: string;
    id: number;
    inventory: number;
    originPrice: number;
    primaryCategoryId: string;
    primaryCategoryName: string;
    secondaryCategoryId: string;
    secondaryCategoryName: string;
    sellAmountOf30Day: number;
    sourceId: string;
    sourceImg: string;
    sourceName: string;
    sourcePrice: number;
    status: number;
    statusDesc: string;
    storeName: string;
    storeSourceId: string;
    thirdlyCategoryId: string;
    thirdlyCategoryName: string;
    [key: string]: any;
}

export interface EditStateType {
	[key: string]: any;
}

export interface EditState {
	[key: string]: any;
}
