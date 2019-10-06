import React, { useState, useEffect } from 'react'
import { Modal, Checkbox, Form, Row } from 'antd'
import { defaultColumn } from '../model'
import { FormComponentProps } from 'antd/es/form'
import { RadioChangeEvent } from 'antd/es/radio/interface'

const FormItem = Form.Item

export interface tableShowModalType {
  tableShowModal: boolean;
  submit: Function;
  cancel: Function;
  columnItems: string[];
  updateCheck: (checked: boolean, key: string) => void;
  updateCheckAll: Function;
}


const columnLabel = {
  defaultSendAddress: '发货地址',
  defaultReceiveAddress: '退货地址',
  contact: '联系人',
  area: '所在地区',
  street: '街道地址',
  phone: '联系方式',
  updateTime: '最后修改时间',
  remark: '备注'
}

const TableShowModal = (props: tableShowModalType) => {

  const {
    tableShowModal,
    cancel,
    submit,
    columnItems,
    updateCheck,
    updateCheckAll,
  } = props

  const [selectAll, setSelectAll] = useState(false)
  const [checkeds, setCheckeds] = useState<string[]>([])

  useEffect(() => {
    if (columnItems.every(item => defaultColumn.includes(item))) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
    setCheckeds(columnItems)
  }, [columnItems])

  function handleOK() {
    submit(checkeds)
  }

  function handleCancel() {
    cancel()
  }

  function handleSelectColumnItem(e: RadioChangeEvent, key: string) {
    let arr = checkeds
    if (e.target.checked) {
      console.log(e.target.checked, key)

      arr.push(key)
      setCheckeds(arr)
    } else {
      setCheckeds(arr.filter(item => item === key))
    }
  }

  function handleSelectAll(e: RadioChangeEvent) {
    if (e.target.checked) {
      updateCheckAll(true)
    } else {
      updateCheckAll(false)
    }
  }

  const formItem = defaultColumn.map(item => {

    return (
      <Checkbox
        checked={checkeds.includes(item)}
        onChange={(e) => handleSelectColumnItem(e, item)}
      >{columnLabel[item]}</Checkbox>
    )
  })

  return (
    <Modal
      visible={tableShowModal}
      title="列表显示控制"
      onOk={handleOK}
      onCancel={handleCancel}
    >
      <Row>
        <Checkbox
          checked={selectAll}
          onChange={(e) => handleSelectAll(e)}
        >全选</Checkbox>
      </Row>
      {formItem}
    </Modal>
  )
}

export default TableShowModal;