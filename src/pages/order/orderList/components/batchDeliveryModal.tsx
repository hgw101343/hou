import React from 'react';
import { Modal, Button, Upload } from 'antd';
import styles from './modal.less'
import { } from '../service'

export interface BatchDeliveryModalPropsType {
  show: boolean;
  loading: boolean;
  submit: Function;
  close: Function;
}

const BatchDeliveryModal = (props: BatchDeliveryModalPropsType) => {

  const {
    show,
    submit,
    close
  } = props

  function handleOK() {
    submit()
  }

  const uploadProps = {
    action: ''
  }

  return (
    <Modal
      visible={show}
      title="批量发货"
      onOk={handleOK}
      onCancel={() => close()}
    >
      <div className={styles.warning}>注：只针对“待发货”状态的订单可操作发货，订单若包含有退款处理中的商品会自动关闭对应退款单</div>
      <div>发货订单：
        <Upload  {...uploadProps}>
          <Button>导入表格</Button>
        </Upload>
      </div>
    </Modal>
  )
}

export default BatchDeliveryModal;