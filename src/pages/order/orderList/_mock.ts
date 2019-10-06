import { Request, Response } from 'express';

function postFakeList(req: Request, res: Response) {
  let result = []
  for (let i = 0; i < 10; i++) {
    result.push({
      orderId: "E20190716224350078400" + i,
      createTime: '2019/11/5 10:26:04',
      goods: [
        {
          goodsImg: 'https://img.yzcdn.cn/upload_files/2019/09/11/FrvRVCHwjMw_KSn8jYhr1vfsiuS-.jpg',
          goodsTitle: '商品' + i,
          goodsId: "XM0000" + i,
          price: 10,
          number: 100,
          rejectStatus: '退货'
        },
        {
          goodsImg: 'https://img.yzcdn.cn/upload_files/2019/09/11/FrvRVCHwjMw_KSn8jYhr1vfsiuS-.jpg',
          goodsTitle: '商品' + i,
          goodsId: "XM0001" + i,
          price: 10,
          number: 100,
          rejectStatus: '退货'
        }
      ],
      consignee: 'xm',
      phone: '17777777777',
      orderPrice: 1000,
      orderType: '代付款',
      orderStatus: '已发货',
    })
  }
  return res.json({ data: result, total: 100, })
}

export default {
  'POST  /api/order/list_for_page': postFakeList,
};
