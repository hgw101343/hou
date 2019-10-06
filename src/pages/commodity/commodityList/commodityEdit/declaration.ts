import { ColumnProps } from 'antd/es/table';

export interface EditStateType {
	[key: string]: any;
}

export interface EditState {
	[key: string]: any;
}

export interface CommodityBaseInfoState {
    [key: string]: any;
}

export interface CommoditySellInfoState {
    [key: string]: any;
}

export interface CommodityImgTextInfoState {
    [key: string]: any;
}

export interface CommodityOtherInfoState {
    [key: string]: any;
}

export interface SkuTableDataItem {
    [key: string]: any;
}
export interface SkuTableColumnProps extends ColumnProps<SkuTableDataItem> {
	[key: string]: any;
}