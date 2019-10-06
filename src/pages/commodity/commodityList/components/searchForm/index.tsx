import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { FormComponentProps } from 'antd/es/form';
import { Form, Input, Select, Button, Icon, InputNumber, DatePicker, Cascader } from 'antd';
import { SearchParams } from '../../declaration';
import { listRootCategory, listSubCategory } from '../../service';

import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

export interface searchPropsType {
    searchData: SearchParams;
    handleSearch: Function;
    handleFormReset: Function;
    identity: string;
    statuses: string;
}

interface propsType extends searchPropsType, FormComponentProps {}

const SearchForm: React.FC<propsType> = forwardRef((props: propsType, ref) => {

    const {
		searchData,
        handleSearch,
        handleFormReset,
        identity,
        statuses,
        form: {
            getFieldDecorator,
            setFieldsValue,
            getFieldsValue,
            resetFields
        }
    } = props

    const [expandForm, setExpandForm] = useState(false);
    const [cascaderOption, setCascaderOption] = useState([]);

	useEffect(() => {
		init()
	}, [])

	useImperativeHandle(ref, () => ({
		handleReset() {
			onReset()
		}
	}))

    function init() {
		initCascaderOption();
    }

    function initCascaderOption() {
        listRootCategory({}).then(res => {
            let data = res.data;
            let option = data.map(item => ({
                value: item.id,
                label: item.name,
                isLeaf: item.leaf
            }));
            setCascaderOption(option);
        })
    }

    function toggleForm() {
        setExpandForm(!expandForm)
    }

    function onReset() {
        resetFields()
        handleFormReset()
    }

    function handleCascaderLoadData(selectedOptions) {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        listSubCategory({id: targetOption.value}).then(res => {

            let data = res.data;
            let hasSecond = data.some(item => item.depth == 2);
            if(hasSecond) data = data.filter(item => item.depth == 2);
            const children = data.map(item => ({
                value: item.id,
                label: item.name,
                isLeaf: item.leaf
            }));
            targetOption.loading = false;
            targetOption.children = children;
            setCascaderOption([...cascaderOption]);
        })
    }

    function renderAdvancedForm() {
        return (
            <Form onSubmit={() => {handleSearch(getFieldsValue())}} layout="inline">
                <FormItem label="商品ID">
                    {getFieldDecorator('sourceId', {initialValue: ''})(<Input placeholder="请输入" />)}
                </FormItem>

                <FormItem label="商家编码">
                    {getFieldDecorator('storeSourceId', {initialValue: ''})(<Input placeholder="请输入" />)}
                </FormItem>

                <FormItem label="商品标题">
                    {getFieldDecorator('sourceName', {initialValue: ''})(<Input placeholder="请输入" />)}
                </FormItem>

                <FormItem label="销售价">
                    <div className="flex-start">
                        {getFieldDecorator('minSellAmount', {initialValue: ''})(<InputNumber placeholder="请输入" />)}
                        <span style={{margin: '0 10px'}}>—</span>
                        {getFieldDecorator('maxSellAmount', {initialValue: ''})(<InputNumber placeholder="请输入" />)}
                    </div>
                </FormItem>

                <FormItem label="30天销量">
                    <div className="flex-start">
                        {getFieldDecorator('minSourcePrice', {initialValue: ''})(<InputNumber placeholder="请输入" />)}
                        <span style={{margin: '0 10px'}}>—</span>
                        {getFieldDecorator('maxSourcePrice', {initialValue: ''})(<InputNumber placeholder="请输入" />)}
                    </div>
                </FormItem>

                <FormItem label="类目">
                    {getFieldDecorator('category', {initialValue: []})(
                        <Cascader
                            options={cascaderOption}
                            loadData={handleCascaderLoadData}
                            changeOnSelect
                            placeholder='请选择'
                        />
                    )}
                </FormItem>

				<FormItem label={statuses == '0' ? '上架时间' : '创建时间'}>
					{getFieldDecorator('dateTime', {initialValue: []})(<RangePicker />)}
				</FormItem>

                <div style={{ overflow: 'hidden' }}>
                    <div style={{ float: 'right'}}>
                        <Button type="primary" onClick={() => handleSearch(getFieldsValue())}>
                            查询
                        </Button>
                        <Button style={{ marginLeft: 8 }} onClick={() => {onReset()}}>
                            重置
                        </Button>
                        {/* <a style={{ marginLeft: 8 }} onClick={toggleForm}>
                            {expandForm ? '收起' : '展开'}收起 <Icon type={expandForm ? 'up' : 'down'}/>
                        </a> */}
                    </div>
                </div>
            </Form>
        );
    }

    return (
        <div className={styles.searchForm}>
            { renderAdvancedForm() }
        </div>
    )
})

export default Form.create<propsType>({})(SearchForm);
