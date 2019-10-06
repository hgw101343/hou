import React, { useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker } from 'antd'
import { FormComponentProps } from 'antd/es/form'
import { orderStatus, orderType, remindStatusOpt, cargoStatus } from './config'
import styles from './search.less'
import { RangePickerValue } from 'antd/es/date-picker/interface'
import { FormProps } from 'antd/es/form'
import moment from 'moment'

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const formatLayout: FormProps = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 17,
  }
}

const orderStatusOption = orderStatus.map((item, index) => <Option key={index} value={item.value}>{item.label}</Option>)
const orderTypeOption = orderType.map((item, index) => <Option key={index} value={item.value}>{item.label}</Option>)
const remindStatusOptOption = remindStatusOpt.map((item, index) => <Option key={index} value={item.value}>{item.label}</Option>)
const cargoStatusOptOption = cargoStatus.map((item, index) => <Option key={index} value={item.value}>{item.label}</Option>)

export interface searchItemKey {
  orderId?: string;
  orderStatus?: number;
  dateTime?: RangePickerValue;
  orderType?: string;
  remindStatus?: string;
  sourceName?: string;
  sourceId?: string;
  phone?: string;
}

export interface searchPropsType {
  searchData: searchItemKey;
  handleSearch: Function;
  handleResetSearch: Function;
  identity: string
}

interface propsType extends searchPropsType, FormComponentProps { }

const OrderListSearch: React.FunctionComponent<propsType> = (props: propsType) => {

  const {
    searchData,
    handleResetSearch,
    handleSearch,
    identity,
    form: {
      getFieldDecorator,
      setFieldsValue,
      getFieldsValue,
      resetFields
    }
  } = props

  /**
   * contructor
   */
  useEffect(() => {
    if (Object.keys(searchData).length) {
      setFieldsValue(searchData)
    }
  }, [])

  function onReset() {
    resetFields()
    handleResetSearch()
  }

  return (
    <div className={styles.formLayout}>
      <Form layout="inline" {...formatLayout}>
        <FormItem label="订单号" colon={false} >
          {getFieldDecorator('orderId', {})(
            <Input placeholder="请输入订单号" allowClear />
          )}
        </FormItem>
        <FormItem label="订单状态" colon={false} >
          {getFieldDecorator('orderStatus', {})(
            <Select
              placeholder="请选择订单状态"
              allowClear
            >
              {orderStatusOption}
            </Select>
          )}
        </FormItem>
        <FormItem label="订单类型" colon={false} >
          {getFieldDecorator('orderType', {})(
            <Select
              placeholder="请选择订单类型"
              allowClear
            >
              {orderTypeOption}
            </Select>
          )}
        </FormItem>
        <FormItem label="下单时间" colon={false} >
          {getFieldDecorator('dateTime', {
            initialValue: [moment().subtract(30, 'days'), moment()]
          })(
            <RangePicker />
          )}
        </FormItem>
        <FormItem label="买家提醒发货" colon={false} >
          {getFieldDecorator('remindStatus', {})(
            <Select
              placeholder="请选择买家提醒发货"
              allowClear
            >
              {remindStatusOptOption}
            </Select>
          )}
        </FormItem>
        <FormItem label="商品标题" colon={false} >
          {getFieldDecorator('sourceName', {})(
            <Input placeholder="请输入商品标题" allowClear />
          )}
        </FormItem>
        <FormItem label="商品ID" colon={false} >
          {getFieldDecorator('sourceId', {})(
            <Input placeholder="请输入商品ID" allowClear />
          )}
        </FormItem>
        {
          identity === 'self' ?
            <>
              <FormItem label="1688订单号" colon={false} >
                {getFieldDecorator('cargoMallOrderId', {})(
                  <Input placeholder="请输入1688订单号" allowClear />
                )}
              </FormItem>
              <FormItem label="1688订单状态" colon={false} >
                {getFieldDecorator('cargoStatus', {})(
                  <Select
                    placeholder="请选择1688订单状态"
                    allowClear
                  >
                    {cargoStatusOptOption}
                  </Select>
                )}
              </FormItem>
              <FormItem label="联系电话" colon={false} >
                {getFieldDecorator('phone', {})(
                  <Input placeholder="请输入联系电话" allowClear />
                )}
              </FormItem>
            </> : null
        }
        <div className={styles.btnArea}>
          <Button type="primary" onClick={() => handleSearch(getFieldsValue())}>查询</Button>
          <Button type="default" onClick={() => onReset()}>重置</Button>
        </div>
      </Form>
    </div>
  )
}

export default Form.create<propsType>({})(OrderListSearch)
