import React, { useEffect } from 'react';
import { Modal, Form, Spin, Input } from 'antd';
import { FormComponentProps } from 'antd/es/form'

export interface SyncModalPropsType extends FormComponentProps {
  show: boolean;
  loading: boolean;
  submit: (value: { orderId: string }) => void;
  close: Function;
}

const SyncModal = (props: SyncModalPropsType) => {

  const {
    show,
    submit,
    loading,
    close,
    form: {
      getFieldDecorator,
      validateFields,
      resetFields
    }
  } = props

  useEffect(() => {
    if (!show) {
      resetFields()
    }
  }, [show])

  function handleOK() {
    validateFields((err, value) => {
      if (err) return;
      submit(value)
    })
  }

  return (
    <Modal
      visible={show}
      title="添加订单"
      confirmLoading={loading === true}
      onOk={handleOK}
      onCancel={() => close()}
    >
      <Spin spinning={loading === true}>
        <Form >
          <Form.Item>
            {getFieldDecorator('orderId', {
              rules: [{
                required: true,
                message: '请输入订单号'
              }]
            })(
              <Input placeholder="请输入订单号" />
            )}
          </Form.Item>
          <div style={{ color: '#267AFA' }}>补充同步漏单和更新已存在订单状态</div>
        </Form>
      </Spin>
    </Modal>
  )
}

export default Form.create<SyncModalPropsType>()(SyncModal);